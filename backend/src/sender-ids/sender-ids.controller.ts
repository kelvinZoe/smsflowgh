import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateSenderIdDto } from './dto';
import { SenderIdsService } from './sender-ids.service';

@UseGuards(JwtAuthGuard)
@Controller('sender-ids')
export class SenderIdsController {
  constructor(private readonly senderIds: SenderIdsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.senderIds.list(user);
  }

  @Post()
  request(@Body() dto: CreateSenderIdDto, @CurrentUser() user: RequestUser) {
    return this.senderIds.request(dto, user);
  }
}
