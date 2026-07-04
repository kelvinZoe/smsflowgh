import { Injectable } from '@nestjs/common';
import { RequestUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(user: RequestUser) {
    const where = user.isSuperAdmin ? {} : { clientId: user.clientId ?? '' };
    const [payments, campaigns, walletTransactions] = await Promise.all([
      this.prisma.payment.findMany({ where }),
      this.prisma.campaign.findMany({ where }),
      this.prisma.walletTransaction.findMany({ where })
    ]);

    return {
      walletCredits: walletTransactions
        .filter((transaction) => transaction.type === 'CREDIT')
        .reduce((sum, transaction) => sum + transaction.units, 0),
      walletDebits: walletTransactions
        .filter((transaction) => transaction.type === 'DEBIT')
        .reduce((sum, transaction) => sum + transaction.units, 0),
      successfulPayments: payments.filter((payment) => payment.status === 'SUCCESSFUL').length,
      campaignCount: campaigns.length,
      sentUnits: campaigns.reduce((sum, campaign) => sum + campaign.totalUnits, 0),
      providerBalance: null
    };
  }
}
