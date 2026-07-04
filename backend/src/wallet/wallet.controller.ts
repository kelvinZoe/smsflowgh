import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { ManualTopUpDto } from './dto';
import { WalletService } from './wallet.service';

@Controller()
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Get('wallet/summary')
  summary(@CurrentUser() user: RequestUser) {
    return this.wallet.summary(user.clientId ?? '');
  }

  @UseGuards(JwtAuthGuard)
  @Get('wallet/transactions')
  transactions(@CurrentUser() user: RequestUser) {
    return this.wallet.transactions(user.clientId ?? '');
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post('admin/wallet/top-up')
  manualTopUp(@Body() dto: ManualTopUpDto, @CurrentUser() actor: RequestUser) {
    return this.wallet.manualTopUp(dto, actor);
  }
}
