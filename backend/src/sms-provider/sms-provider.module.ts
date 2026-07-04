import { Module } from '@nestjs/common';
import { SmsOnlineGhModule } from '../smsonlinegh/smsonlinegh.module';
import { SmsOnlineGhProvider } from '../smsonlinegh/smsonlinegh.provider';
import { SMS_PROVIDER } from './sms-provider.interface';

@Module({
  imports: [SmsOnlineGhModule],
  providers: [
    {
      provide: SMS_PROVIDER,
      useExisting: SmsOnlineGhProvider
    }
  ],
  exports: [SMS_PROVIDER]
})
export class SmsProviderModule {}
