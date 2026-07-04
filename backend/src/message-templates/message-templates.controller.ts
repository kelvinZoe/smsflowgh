import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateMessageTemplateDto } from './dto';
import { MessageTemplatesService } from './message-templates.service';

@UseGuards(JwtAuthGuard)
@Controller('message-templates')
export class MessageTemplatesController {
  constructor(private readonly templates: MessageTemplatesService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.templates.list(user);
  }

  @Post()
  create(@Body() dto: CreateMessageTemplateDto, @CurrentUser() user: RequestUser) {
    return this.templates.create(dto, user);
  }
}
