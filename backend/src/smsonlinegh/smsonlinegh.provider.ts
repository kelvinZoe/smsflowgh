import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsMessage, SmsProviderClient, SmsSendResult } from '../sms-provider/sms-provider.interface';

@Injectable()
export class SmsOnlineGhProvider implements SmsProviderClient {
  constructor(private readonly config: ConfigService) {}

  async sendBulk(messages: SmsMessage[]): Promise<SmsSendResult[]> {
    if (!this.isConfigured()) {
      return messages.map((message, index) => ({
        recipient: message.recipient,
        status: 'SENT',
        providerMessageId: `mock-${Date.now()}-${index}`
      }));
    }

    // Real SMSOnlineGH integration belongs here. Keep this backend-only so API keys
    // never reach Angular.
    return messages.map((message, index) => ({
      recipient: message.recipient,
      status: 'SENT',
      providerMessageId: `smsonlinegh-placeholder-${Date.now()}-${index}`
    }));
  }

  private isConfigured() {
    return Boolean(this.config.get<string>('SMSONLINEGH_API_KEY') && this.config.get<string>('SMSONLINEGH_CLIENT_ID'));
  }
}
