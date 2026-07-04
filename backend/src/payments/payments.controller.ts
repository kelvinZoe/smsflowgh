import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MomoCallbackDto } from './dto/momo-callback.dto';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('payments')
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: RequestUser) {
    return this.payments.create(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('payments')
  history(@CurrentUser() user: RequestUser) {
    return this.payments.history(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('payments/:id/verify')
  verify(@Param('id') paymentId: string, @CurrentUser() user: RequestUser) {
    return this.payments.verify(paymentId, user);
  }

  @Post('payments/mtn-momo/callback')
  momoCallback(@Body() dto: MomoCallbackDto) {
    return this.payments.handleCallback(dto);
  }
}
