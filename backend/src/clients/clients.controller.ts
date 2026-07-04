import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto';

@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/clients')
export class ClientsController {
  constructor(private readonly clients: ClientsService) {}

  @Get()
  list() {
    return this.clients.list();
  }

  @Post()
  create(@Body() dto: CreateClientDto, @CurrentUser() actor: RequestUser) {
    return this.clients.create(dto, actor);
  }
}
