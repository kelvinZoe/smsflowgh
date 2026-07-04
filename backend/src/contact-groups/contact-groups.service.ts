import { BadRequestException, Injectable } from '@nestjs/common';
import { RequestUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactGroupDto } from './dto';

@Injectable()
export class ContactGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  list(user: RequestUser) {
    return this.prisma.contactGroup.findMany({
      where: { clientId: user.clientId ?? '' },
      include: { memberships: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  create(dto: CreateContactGroupDto, user: RequestUser) {
    if (!user.clientId) {
      throw new BadRequestException('Client account required');
    }
    return this.prisma.contactGroup.create({
      data: {
        clientId: user.clientId,
        name: dto.name,
        memberships: dto.contactIds
          ? {
              create: dto.contactIds.map((contactId) => ({ contactId }))
            }
          : undefined
      },
      include: { memberships: true }
    });
  }
}
