import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProviderClient, PaymentRequest, ProviderPaymentStatus } from './payment-provider.interface';

type MtnTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type MtnPaymentStatusResponse = {
  amount?: string;
  currency?: string;
  financialTransactionId?: string;
  externalId?: string;
  payer?: {
    partyIdType?: string;
    partyId?: string;
  };
  payerMessage?: string;
  payeeNote?: string;
  status?: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  reason?: string;
};

@Injectable()
export class MtnMomoProvider implements PaymentProviderClient {
  private accessToken?: string;
  private accessTokenExpiresAt = 0;

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

    const token = await this.getAccessToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': this.subscriptionKey(),
      'X-Reference-Id': request.providerReference,
      'X-Target-Environment': this.targetEnvironment()
    };
    const callbackUrl = this.callbackUrl(request.providerReference);
    if (callbackUrl) {
      headers['X-Callback-Url'] = callbackUrl;
    }

    const response = await fetch(`${this.baseUrl()}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        amount: request.amountGhs,
        currency: this.currency(),
        externalId: request.providerReference,
        payer: {
          partyIdType: 'MSISDN',
          partyId: this.normalizeMsisdn(request.momoNumber)
        },
        payerMessage: request.payerMessage.slice(0, 160),
        payeeNote: `SMS credit purchase ${request.providerReference}`.slice(0, 160)
      })
    });

    if (response.status === 202) {
      return {
        status: 'PENDING',
        raw: {
          providerReference: request.providerReference,
          statusCode: response.status,
          statusText: response.statusText
        }
      };
    }

    const raw = await this.readResponse(response);
    return {
      status: 'FAILED',
      raw: {
        providerReference: request.providerReference,
        statusCode: response.status,
        statusText: response.statusText,
        response: raw
      }
    };
  }

  async getPaymentStatus(providerReference: string): Promise<ProviderPaymentStatus> {
    if (!this.isConfigured()) {
      return {
        status: 'PENDING',
        raw: { mode: 'mock', providerReference }
      };
    }

    const token = await this.getAccessToken();
    const response = await fetch(`${this.baseUrl()}/collection/v1_0/requesttopay/${providerReference}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Ocp-Apim-Subscription-Key': this.subscriptionKey(),
        'X-Target-Environment': this.targetEnvironment()
      }
    });

    const raw = await this.readResponse<MtnPaymentStatusResponse>(response);
    if (!response.ok) {
      return {
        status: 'PENDING',
        raw: {
          providerReference,
          statusCode: response.status,
          statusText: response.statusText,
          response: raw
        }
      };
    }

    return {
      status: raw.status ?? 'PENDING',
      raw: { providerReference, ...raw }
    };
  }

  private async getAccessToken() {
    if (this.accessToken && Date.now() < this.accessTokenExpiresAt) {
      return this.accessToken;
    }

    const credentials = Buffer.from(`${this.apiUserId()}:${this.apiKey()}`).toString('base64');
    const response = await fetch(`${this.baseUrl()}/collection/token/`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Length': '0',
        'Ocp-Apim-Subscription-Key': this.subscriptionKey()
      }
    });

    const raw = await this.readResponse<MtnTokenResponse>(response);
    if (!response.ok || !raw.access_token) {
      throw new BadGatewayException({
        message: 'Unable to authenticate with MTN MoMo',
        statusCode: response.status,
        response: raw
      });
    }

    this.accessToken = raw.access_token;
    this.accessTokenExpiresAt = Date.now() + Math.max(raw.expires_in - 60, 60) * 1000;
    return this.accessToken;
  }

  private async readResponse<T extends Record<string, unknown>>(response: Response): Promise<T> {
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return { body: text } as unknown as T;
    }
  }

  private callbackUrl(providerReference: string) {
    const configured = this.config.get<string>('MTN_MOMO_CALLBACK_URL');
    if (!configured) {
      return '';
    }

    return `${configured.replace(/\/$/, '')}/${providerReference}`;
  }

  private normalizeMsisdn(value: string) {
    return value.replace(/\D/g, '');
  }

  private baseUrl() {
    return this.config.get<string>('MTN_MOMO_BASE_URL') ?? 'https://sandbox.momodeveloper.mtn.com';
  }

  private targetEnvironment() {
    return this.config.get<string>('MTN_MOMO_ENVIRONMENT') ?? 'sandbox';
  }

  private currency() {
    return this.targetEnvironment() === 'sandbox' ? 'EUR' : 'GHS';
  }

  private subscriptionKey() {
    return this.config.getOrThrow<string>('MTN_MOMO_COLLECTION_PRIMARY_KEY');
  }

  private apiUserId() {
    return this.config.getOrThrow<string>('MTN_MOMO_COLLECTION_USER_ID');
  }

  private apiKey() {
    return this.config.getOrThrow<string>('MTN_MOMO_COLLECTION_API_KEY');
  }

  private isConfigured() {
    return Boolean(
      this.config.get<string>('MTN_MOMO_COLLECTION_PRIMARY_KEY') &&
        this.config.get<string>('MTN_MOMO_COLLECTION_USER_ID') &&
        this.config.get<string>('MTN_MOMO_COLLECTION_API_KEY')
    );
  }
}
