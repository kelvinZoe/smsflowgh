import { Module } from '@nestjs/common';
import { SmsOnlineGhProvider } from './smsonlinegh.provider';

@Module({
  providers: [SmsOnlineGhProvider],
  exports: [SmsOnlineGhProvider]
})
export class SmsOnlineGhModule {}
