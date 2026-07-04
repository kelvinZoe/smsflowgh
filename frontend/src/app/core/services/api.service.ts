import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export type SmsPackage = {
  id: string;
  name: string;
  amountGhs: string;
  smsUnits: number;
  isActive: boolean;
  sortOrder: number;
};

export type WalletSummary = {
  id: string;
  clientId: string;
  balance: number;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{ accessToken: string; user: any }>(`${environment.apiUrl}/auth/login`, { email, password });
  }

  packages() {
    return this.http.get<SmsPackage[]>(`${environment.apiUrl}/sms-packages`);
  }

  adminPackages() {
    return this.http.get<SmsPackage[]>(`${environment.apiUrl}/admin/sms-packages`);
  }

  updatePackage(id: string, data: Partial<SmsPackage>) {
    return this.http.patch<SmsPackage>(`${environment.apiUrl}/admin/sms-packages/${id}`, data);
  }

  wallet() {
    return this.http.get<WalletSummary>(`${environment.apiUrl}/wallet/summary`);
  }

  walletTransactions() {
    return this.http.get<any[]>(`${environment.apiUrl}/wallet/transactions`);
  }

  buyCredits(smsPackageId: string, momoNumber: string) {
    return this.http.post<any>(`${environment.apiUrl}/payments`, { smsPackageId, momoNumber });
  }

  payments() {
    return this.http.get<any[]>(`${environment.apiUrl}/payments`);
  }

  verifyPayment(id: string) {
    return this.http.post<any>(`${environment.apiUrl}/payments/${id}/verify`, {});
  }

  dashboard() {
    return this.http.get<any>(`${environment.apiUrl}/reports/dashboard`);
  }

  campaigns() {
    return this.http.get<any[]>(`${environment.apiUrl}/campaigns`);
  }

  sendCampaign(data: { title: string; senderId: string; message: string; recipients: string[] }) {
    return this.http.post<any>(`${environment.apiUrl}/campaigns`, data);
  }
}
