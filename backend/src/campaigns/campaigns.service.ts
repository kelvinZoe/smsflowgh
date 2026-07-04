import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CampaignStatus, DeliveryStatus } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
import { calculateSmsUnits } from '../common/utils/sms-units';
import { PrismaService } from '../prisma/prisma.service';
import { SMS_PROVIDER, SmsProviderClient } from '../sms-provider/sms-provider.interface';
import { WalletService } from '../wallet/wallet.service';
import { CreateCampaignDto } from './dto';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
    private readonly auditLogs: AuditLogsService,
    @Inject(SMS_PROVIDER) private readonly smsProvider: SmsProviderClient
  ) {}

  list(user: RequestUser) {
    return this.prisma.campaign.findMany({
      where: user.isSuperAdmin ? {} : { clientId: user.clientId ?? '' },
      orderBy: { createdAt: 'desc' },
      include: { recipients: true },
      take: 100
    });
  }

  async details(id: string, user: RequestUser) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, ...(user.isSuperAdmin ? {} : { clientId: user.clientId ?? '' }) },
      include: { recipients: true, walletTransactions: true }
    });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  async createAndSend(dto: CreateCampaignDto, user: RequestUser) {
    if (!user.clientId) {
      throw new BadRequestException('Client account required to send campaigns');
    }

    const recipients = await this.resolveRecipients(user.clientId, dto);
    if (recipients.length === 0) {
      throw new BadRequestException('At least one recipient is required');
    }

    const unitsPerRecipient = calculateSmsUnits(dto.message);
    const totalUnits = recipients.length * unitsPerRecipient;
    if (totalUnits <= 0) {
      throw new BadRequestException('Message body is required');
    }

    const campaign = await this.prisma.$transaction(async (tx) => {
      const created = await tx.campaign.create({
        data: {
          clientId: user.clientId!,
          title: dto.title,
          senderId: dto.senderId,
          message: dto.message,
          status: CampaignStatus.QUEUED,
          totalRecipients: recipients.length,
          totalUnits,
          recipients: {
            create: recipients.map((phone) => ({
              phone,
              units: unitsPerRecipient
            }))
          }
        },
        include: { recipients: true }
      });

      await this.wallet.debitForCampaign({
        clientId: user.clientId!,
        campaignId: created.id,
        units: totalUnits,
        tx
      });

      return created;
    });

    const results = await this.smsProvider.sendBulk(
      campaign.recipients.map((recipient) => ({
        senderId: dto.senderId,
        recipient: recipient.phone,
        message: dto.message
      }))
    );

    await this.prisma.$transaction(
      results.map((result) =>
        this.prisma.campaignRecipient.updateMany({
          where: { campaignId: campaign.id, phone: result.recipient },
          data: {
            deliveryStatus: result.status === 'SENT' ? DeliveryStatus.SENT : DeliveryStatus.FAILED,
            providerMessageId: result.providerMessageId,
            errorMessage: result.errorMessage
          }
        })
      )
    );

    const failedCount = results.filter((result) => result.status === 'FAILED').length;
    const updated = await this.prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: failedCount === results.length ? CampaignStatus.FAILED : CampaignStatus.SENT },
      include: { recipients: true, walletTransactions: true }
    });

    await this.auditLogs.record({
      actorId: user.id,
      clientId: user.clientId,
      action: 'CAMPAIGN_SEND',
      entity: 'Campaign',
      entityId: campaign.id,
      metadata: { totalRecipients: recipients.length, totalUnits, failedCount }
    });

    return updated;
  }

  private async resolveRecipients(clientId: string, dto: CreateCampaignDto) {
    const direct = dto.recipients ?? [];
    const groupContacts = dto.contactGroupIds?.length
      ? await this.prisma.contact.findMany({
          where: {
            clientId,
            memberships: { some: { groupId: { in: dto.contactGroupIds } } }
          },
          select: { phone: true }
        })
      : [];

    return [...new Set([...direct, ...groupContacts.map((contact) => contact.phone)].map((phone) => phone.trim()))].filter(
      Boolean
    );
  }
}
