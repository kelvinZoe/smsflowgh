export type SmsMessage = {
  senderId: string;
  recipient: string;
  message: string;
};

export type SmsSendResult = {
  recipient: string;
  status: 'SENT' | 'FAILED';
  providerMessageId?: string;
  errorMessage?: string;
};

export interface SmsProviderClient {
  sendBulk(messages: SmsMessage[]): Promise<SmsSendResult[]>;
}

export const SMS_PROVIDER = Symbol('SMS_PROVIDER');
