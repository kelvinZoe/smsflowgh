import { Injectable } from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService
  ) {}

  list() {
    return this.prisma.client.findMany({ include: { wallet: true }, orderBy: { createdAt: 'desc' } });
  }

  async create(dto: CreateClientDto, actor: RequestUser) {
    const client = await this.prisma.client.create({
      data: {
        ...dto,
        wallet: { create: {} }
      },
      include: { wallet: true }
    });
    await this.auditLogs.record({
      actorId: actor.id,
      clientId: client.id,
      action: 'CLIENT_CREATE',
      entity: 'Client',
      entityId: client.id
    });
    return client;
  }
}
