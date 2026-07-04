export type PaymentRequest = {
  amountGhs: string;
  momoNumber: string;
  providerReference: string;
  payerMessage: string;
};

export type ProviderPaymentStatus = {
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  raw?: Record<string, unknown>;
};

export interface PaymentProviderClient {
  requestToPay(request: PaymentRequest): Promise<ProviderPaymentStatus>;
  getPaymentStatus(providerReference: string): Promise<ProviderPaymentStatus>;
}

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');
