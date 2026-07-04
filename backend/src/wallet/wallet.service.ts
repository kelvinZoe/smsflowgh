import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, WalletTransactionSource, WalletTransactionType } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { ManualTopUpDto } from './dto';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService
  ) {}

  async summary(clientId: string) {
    const wallet = await this.prisma.walletAccount.upsert({
      where: { clientId },
      update: {},
      create: { clientId }
    });
    return wallet;
  }

  transactions(clientId: string) {
    return this.prisma.walletTransaction.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  async creditFromPayment(paymentId: string, tx: Prisma.TransactionClient = this.prisma) {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.creditedAt) {
      return tx.walletTransaction.findFirst({ where: { paymentId } });
    }

    const idempotencyKey = `payment:${payment.id}`;
    const existing = await tx.walletTransaction.findUnique({ where: { idempotencyKey } });
    if (existing) {
      await tx.payment.update({ where: { id: payment.id }, data: { creditedAt: existing.createdAt } });
      return existing;
    }

    const wallet = await tx.walletAccount.upsert({
      where: { clientId: payment.clientId },
      update: {},
      create: { clientId: payment.clientId }
    });

    const balanceAfter = wallet.balance + payment.smsUnits;
    const transaction = await tx.walletTransaction.create({
      data: {
        clientId: payment.clientId,
        type: WalletTransactionType.CREDIT,
        source: WalletTransactionSource.PAYMENT,
        units: payment.smsUnits,
        balanceBefore: wallet.balance,
        balanceAfter,
        paymentId: payment.id,
        idempotencyKey,
        note: `Wallet credit for payment ${payment.providerReference}`
      }
    });

    await tx.walletAccount.update({
      where: { clientId: payment.clientId },
      data: { balance: balanceAfter }
    });
    await tx.payment.update({
      where: { id: payment.id },
      data: { creditedAt: transaction.createdAt }
    });

    return transaction;
  }

  async debitForCampaign(input: {
    clientId: string;
    campaignId: string;
    units: number;
    tx?: Prisma.TransactionClient;
  }) {
    const tx = input.tx ?? this.prisma;
    const idempotencyKey = `campaign:${input.campaignId}`;
    const existing = await tx.walletTransaction.findUnique({ where: { idempotencyKey } });
    if (existing) {
      return existing;
    }

    const wallet = await tx.walletAccount.upsert({
      where: { clientId: input.clientId },
      update: {},
      create: { clientId: input.clientId }
    });
    if (wallet.balance < input.units) {
      throw new BadRequestException('Insufficient SMS wallet balance');
    }

    const balanceAfter = wallet.balance - input.units;
    const transaction = await tx.walletTransaction.create({
      data: {
        clientId: input.clientId,
        type: WalletTransactionType.DEBIT,
        source: WalletTransactionSource.CAMPAIGN,
        units: input.units,
        balanceBefore: wallet.balance,
        balanceAfter,
        campaignId: input.campaignId,
        idempotencyKey,
        note: 'SMS campaign debit'
      }
    });

    await tx.walletAccount.update({
      where: { clientId: input.clientId },
      data: { balance: balanceAfter }
    });

    return transaction;
  }

  async manualTopUp(dto: ManualTopUpDto, actor: RequestUser) {
    const transaction = await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.walletAccount.upsert({
        where: { clientId: dto.clientId },
        update: {},
        create: { clientId: dto.clientId }
      });
      const balanceAfter = wallet.balance + dto.units;
      const walletTransaction = await tx.walletTransaction.create({
        data: {
          clientId: dto.clientId,
          type: WalletTransactionType.CREDIT,
          source: WalletTransactionSource.MANUAL_TOP_UP,
          units: dto.units,
          balanceBefore: wallet.balance,
          balanceAfter,
          idempotencyKey: `manual:${dto.clientId}:${Date.now()}`,
          note: dto.note
        }
      });
      await tx.walletAccount.update({ where: { clientId: dto.clientId }, data: { balance: balanceAfter } });
      return walletTransaction;
    });

    await this.auditLogs.record({
      actorId: actor.id,
      clientId: dto.clientId,
      action: 'WALLET_MANUAL_TOP_UP',
      entity: 'WalletTransaction',
      entityId: transaction.id,
      metadata: { units: dto.units, note: dto.note }
    });

    return transaction;
  }
}
