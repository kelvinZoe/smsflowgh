import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  imports: [AuditLogsModule],
  controllers: [ClientsController],
  providers: [ClientsService]
})
export class ClientsModule {}
