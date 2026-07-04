import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ClientsModule } from './clients/clients.module';
import { ContactsModule } from './contacts/contacts.module';
import { ContactGroupsModule } from './contact-groups/contact-groups.module';
import { MessageTemplatesModule } from './message-templates/message-templates.module';
import { MtnMomoModule } from './mtn-momo/mtn-momo.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportsModule } from './reports/reports.module';
import { RolesModule } from './roles/roles.module';
import { SenderIdsModule } from './sender-ids/sender-ids.module';
import { SmsPackagesModule } from './sms-packages/sms-packages.module';
import { SmsProviderModule } from './sms-provider/sms-provider.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ClientsModule,
    UsersModule,
    RolesModule,
    SmsPackagesModule,
    WalletModule,
    PaymentsModule,
    SmsProviderModule,
    SenderIdsModule,
    ContactsModule,
    ContactGroupsModule,
    MessageTemplatesModule,
    MtnMomoModule,
    CampaignsModule,
    ReportsModule,
    AuditLogsModule
  ]
})
export class AppModule {}
