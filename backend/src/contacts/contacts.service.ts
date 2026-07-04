import { BadRequestException, Injectable } from '@nestjs/common';
import { RequestUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  list(user: RequestUser) {
    return this.prisma.contact.findMany({
      where: { clientId: user.clientId ?? '' },
      orderBy: { createdAt: 'desc' }
    });
  }

  create(dto: CreateContactDto, user: RequestUser) {
    if (!user.clientId) {
      throw new BadRequestException('Client account required');
    }
    return this.prisma.contact.create({ data: { ...dto, clientId: user.clientId } });
  }
}
