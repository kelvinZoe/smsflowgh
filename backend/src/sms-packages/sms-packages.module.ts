import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { SmsPackagesController } from './sms-packages.controller';
import { SmsPackagesService } from './sms-packages.service';

@Module({
  imports: [AuditLogsModule],
  controllers: [SmsPackagesController],
  providers: [SmsPackagesService],
  exports: [SmsPackagesService]
})
export class SmsPackagesModule {}
