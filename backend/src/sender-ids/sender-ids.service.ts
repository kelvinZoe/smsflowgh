import { BadRequestException, Injectable } from '@nestjs/common';
import { RequestUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSenderIdDto } from './dto';

@Injectable()
export class SenderIdsService {
  constructor(private readonly prisma: PrismaService) {}

  list(user: RequestUser) {
    return this.prisma.senderId.findMany({
      where: { clientId: user.clientId ?? '' },
      orderBy: { createdAt: 'desc' }
    });
  }

  request(dto: CreateSenderIdDto, user: RequestUser) {
    if (!user.clientId) {
      throw new BadRequestException('Client account required');
    }
    return this.prisma.senderId.create({ data: { clientId: user.clientId, name: dto.name } });
  }
}
