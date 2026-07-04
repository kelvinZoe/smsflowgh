import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { WalletModule } from '../wallet/wallet.module';
import { PAYMENT_PROVIDER } from './providers/payment-provider.interface';
import { MtnMomoProvider } from './providers/mtn-momo.provider';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [AuditLogsModule, WalletModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    MtnMomoProvider,
    {
      provide: PAYMENT_PROVIDER,
      useExisting: MtnMomoProvider
    }
  ]
})
export class PaymentsModule {}
