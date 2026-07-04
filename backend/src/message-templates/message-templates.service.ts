import { BadRequestException, Injectable } from '@nestjs/common';
import { RequestUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageTemplateDto } from './dto';

@Injectable()
export class MessageTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  list(user: RequestUser) {
    return this.prisma.messageTemplate.findMany({
      where: { clientId: user.clientId ?? '' },
      orderBy: { createdAt: 'desc' }
    });
  }

  create(dto: CreateMessageTemplateDto, user: RequestUser) {
    if (!user.clientId) {
      throw new BadRequestException('Client account required');
    }
    return this.prisma.messageTemplate.create({ data: { ...dto, clientId: user.clientId } });
  }
}
