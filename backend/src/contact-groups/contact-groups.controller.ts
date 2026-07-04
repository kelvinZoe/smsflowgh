import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ContactGroupsService } from './contact-groups.service';
import { CreateContactGroupDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('contact-groups')
export class ContactGroupsController {
  constructor(private readonly groups: ContactGroupsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.groups.list(user);
  }

  @Post()
  create(@Body() dto: CreateContactGroupDto, @CurrentUser() user: RequestUser) {
    return this.groups.create(dto, user);
  }
}
