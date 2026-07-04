import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProviderClient, PaymentRequest, ProviderPaymentStatus } from './payment-provider.interface';

@Injectable()
export class MtnMomoProvider implements PaymentProviderClient {
  constructor(private readonly config: ConfigService) {}

  async requestToPay(request: PaymentRequest): Promise<ProviderPaymentStatus> {
    if (!this.isConfigured()) {
      return {
        status: 'PENDING',
        raw: {
          mode: 'mock',
          message: 'MTN MoMo sandbox credentials are not configured',
          providerReference: request.providerReference
        }
      };
    }

    // Real sandbox integration belongs here: create an access token, call requesttopay,
    // then rely on callbacks plus polling to settle the payment.
    return {
      status: 'PENDING',
      raw: { mode: 'sandbox-placeholder', providerReference: request.providerReference }
    };
  }

  async getPaymentStatus(providerReference: string): Promise<ProviderPaymentStatus> {
    if (!this.isConfigured()) {
      return {
        status: 'PENDING',
        raw: { mode: 'mock', providerReference }
      };
    }

    return {
      status: 'PENDING',
      raw: { mode: 'sandbox-placeholder', providerReference }
    };
  }

  private isConfigured() {
    return Boolean(
      this.config.get<string>('MTN_MOMO_COLLECTION_PRIMARY_KEY') &&
        this.config.get<string>('MTN_MOMO_COLLECTION_USER_ID') &&
        this.config.get<string>('MTN_MOMO_COLLECTION_API_KEY')
    );
  }
}
