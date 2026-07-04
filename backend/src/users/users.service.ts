import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService
  ) {}

  list(actor: RequestUser) {
    return this.prisma.user.findMany({
      where: actor.isSuperAdmin ? {} : { clientId: actor.clientId ?? '' },
      select: {
        id: true,
        clientId: true,
        email: true,
        fullName: true,
        status: true,
        isSuperAdmin: true,
        role: true,
        client: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(dto: CreateUserDto, actor: RequestUser) {
    const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
    if (!role) {
      throw new BadRequestException('Role not found');
    }

    if (!actor.isSuperAdmin) {
      if (!actor.clientId) {
        throw new BadRequestException('Client account required');
      }
      if (dto.isSuperAdmin || role.name === 'SUPER_ADMIN' || (dto.clientId && dto.clientId !== actor.clientId)) {
        throw new ForbiddenException('Cannot create users outside your client or grant platform access');
      }
    }

    const isSuperAdmin = actor.isSuperAdmin ? (dto.isSuperAdmin ?? role.name === 'SUPER_ADMIN') : false;
    if (isSuperAdmin && role.name !== 'SUPER_ADMIN') {
      throw new BadRequestException('Super admin users must use the SUPER_ADMIN role');
    }
    if (role.name === 'SUPER_ADMIN' && !isSuperAdmin) {
      throw new BadRequestException('SUPER_ADMIN role requires platform access');
    }

    const user = await this.prisma.user.create({
      data: {
        clientId: isSuperAdmin ? null : dto.clientId ?? (actor.isSuperAdmin ? null : actor.clientId),
        roleId: dto.roleId,
        email: dto.email,
        fullName: dto.fullName,
        passwordHash: await bcrypt.hash(dto.password, 10),
        isSuperAdmin
      },
      select: {
        id: true,
        clientId: true,
        email: true,
        fullName: true,
        status: true,
        isSuperAdmin: true,
        role: true,
        client: true,
        createdAt: true,
        updatedAt: true
      }
    });
    await this.auditLogs.record({
      actorId: actor.id,
      clientId: user.clientId,
      action: 'USER_CREATE',
      entity: 'User',
      entityId: user.id
    });
    return user;
  }
}
