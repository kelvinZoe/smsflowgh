import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { CreateSmsPackageDto, UpdateSmsPackageDto } from './dto';
import { SmsPackagesService } from './sms-packages.service';

@Controller()
export class SmsPackagesController {
  constructor(private readonly smsPackages: SmsPackagesService) {}

  @Get('sms-packages')
  listActive() {
    return this.smsPackages.listActive();
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('admin/sms-packages')
  listAll() {
    return this.smsPackages.listAll();
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post('admin/sms-packages')
  create(@Body() dto: CreateSmsPackageDto, @CurrentUser() actor: RequestUser) {
    return this.smsPackages.create(dto, actor);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Patch('admin/sms-packages/:id')
  update(@Param('id') id: string, @Body() dto: UpdateSmsPackageDto, @CurrentUser() actor: RequestUser) {
    return this.smsPackages.update(id, dto, actor);
  }
}
