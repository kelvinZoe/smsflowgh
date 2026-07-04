import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSmsPackageDto, UpdateSmsPackageDto } from './dto';

@Injectable()
export class SmsPackagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService
  ) {}

  listActive() {
    return this.prisma.smsPackage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { amountGhs: 'asc' }]
    });
  }

  listAll() {
    return this.prisma.smsPackage.findMany({
      orderBy: [{ sortOrder: 'asc' }, { amountGhs: 'asc' }]
    });
  }

  async create(dto: CreateSmsPackageDto, actor: RequestUser) {
    const smsPackage = await this.prisma.smsPackage.create({ data: dto });
    await this.auditLogs.record({
      actorId: actor.id,
      action: 'SMS_PACKAGE_CREATE',
      entity: 'SmsPackage',
      entityId: smsPackage.id,
      metadata: { name: smsPackage.name }
    });
    return smsPackage;
  }

  async update(id: string, dto: UpdateSmsPackageDto, actor: RequestUser) {
    const smsPackage = await this.prisma.smsPackage.update({ where: { id }, data: dto });
    await this.auditLogs.record({
      actorId: actor.id,
      action: 'SMS_PACKAGE_UPDATE',
      entity: 'SmsPackage',
      entityId: smsPackage.id,
      metadata: { ...dto } as Prisma.InputJsonObject
    });
    return smsPackage;
  }
}
