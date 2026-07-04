import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MomoCallbackDto } from './dto/momo-callback.dto';
import { PAYMENT_PROVIDER, PaymentProviderClient } from './providers/payment-provider.interface';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wallet: WalletService,
    private readonly auditLogs: AuditLogsService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProviderClient
  ) {}

  async create(dto: CreatePaymentDto, user: RequestUser) {
    if (!user.clientId) {
      throw new BadRequestException('Client account required to buy SMS credits');
    }

    const smsPackage = await this.prisma.smsPackage.findFirst({
      where: { id: dto.smsPackageId, isActive: true }
    });
    if (!smsPackage) {
      throw new NotFoundException('Active SMS package not found');
    }

    const providerReference = randomUUID();
    const payment = await this.prisma.payment.create({
      data: {
        clientId: user.clientId,
        smsPackageId: smsPackage.id,
        amountGhs: smsPackage.amountGhs,
        smsUnits: smsPackage.smsUnits,
        momoNumber: dto.momoNumber,
        providerReference,
        status: PaymentStatus.PENDING
      }
    });

    const providerResult = await this.provider.requestToPay({
      amountGhs: smsPackage.amountGhs.toString(),
      momoNumber: dto.momoNumber,
      providerReference,
      payerMessage: `Buy ${smsPackage.smsUnits} SMS units`
    });

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: providerResult.status === 'FAILED' ? PaymentStatus.FAILED : PaymentStatus.PROCESSING,
        providerStatus: providerResult.status,
        providerRawResponse: providerResult.raw as Prisma.InputJsonValue | undefined
      }
    });

    await this.auditLogs.record({
      actorId: user.id,
      clientId: user.clientId,
      action: 'PAYMENT_CREATE',
      entity: 'Payment',
      entityId: payment.id,
      metadata: { smsPackageId: smsPackage.id, smsUnits: smsPackage.smsUnits }
    });

    return updated;
  }

  history(user: RequestUser) {
    return this.prisma.payment.findMany({
      where: user.isSuperAdmin ? {} : { clientId: user.clientId ?? '' },
      include: { smsPackage: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  async verify(paymentId: string, user: RequestUser) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        ...(user.isSuperAdmin ? {} : { clientId: user.clientId ?? '' })
      }
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const providerStatus = await this.provider.getPaymentStatus(payment.providerReference);
    return this.applyProviderStatus(payment.providerReference, providerStatus.status, providerStatus.raw, user);
  }

  async handleCallback(dto: MomoCallbackDto) {
    return this.applyProviderStatus(dto.providerReference, dto.status, dto.raw);
  }

  private async applyProviderStatus(
    providerReference: string,
    providerStatus: 'PENDING' | 'SUCCESSFUL' | 'FAILED',
    raw?: Record<string, unknown>,
    actor?: RequestUser
  ) {
    const payment = await this.prisma.payment.findUnique({ where: { providerReference } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const status =
      providerStatus === 'SUCCESSFUL'
        ? PaymentStatus.SUCCESSFUL
        : providerStatus === 'FAILED'
          ? PaymentStatus.FAILED
          : PaymentStatus.PROCESSING;

    const updated = await this.prisma.$transaction(async (tx) => {
      const settled = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status,
          providerStatus,
          providerRawResponse: raw as Prisma.InputJsonValue | undefined
        }
      });

      if (status === PaymentStatus.SUCCESSFUL && !settled.creditedAt) {
        await this.wallet.creditFromPayment(settled.id, tx);
      }

      return tx.payment.findUniqueOrThrow({ where: { id: payment.id }, include: { walletTransactions: true } });
    });

    await this.auditLogs.record({
      actorId: actor?.id,
      clientId: payment.clientId,
      action: status === PaymentStatus.SUCCESSFUL ? 'PAYMENT_SUCCESS_CREDIT_WALLET' : 'PAYMENT_STATUS_UPDATE',
      entity: 'Payment',
      entityId: payment.id,
      metadata: { providerStatus }
    });

    return updated;
  }
}
