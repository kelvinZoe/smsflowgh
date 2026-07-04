import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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

  @Post('payments/mtn-momo/callback/:providerReference')
  momoCallbackWithReference(@Param('providerReference') providerReference: string, @Body() body: Record<string, unknown>) {
    return this.payments.handleCallback({
      providerReference,
      status: this.parseProviderStatus(body.status),
      raw: body
    });
  }

  @Post('payments/mtn-momo/callback')
  momoCallback(@Body() dto: MomoCallbackDto | Record<string, unknown>) {
    if (this.isMomoCallbackDto(dto)) {
      return this.payments.handleCallback(dto);
    }

    throw new BadRequestException('MTN MoMo callback reference is required');
  }

  private parseProviderStatus(status: unknown): 'SUCCESSFUL' | 'FAILED' | 'PENDING' {
    if (status === 'SUCCESSFUL' || status === 'FAILED' || status === 'PENDING') {
      return status;
    }

    throw new BadRequestException('Invalid MTN MoMo callback status');
  }

  private isMomoCallbackDto(value: MomoCallbackDto | Record<string, unknown>): value is MomoCallbackDto {
    return (
      typeof value.providerReference === 'string' &&
      (value.status === 'SUCCESSFUL' || value.status === 'FAILED' || value.status === 'PENDING')
    );
  }
}
