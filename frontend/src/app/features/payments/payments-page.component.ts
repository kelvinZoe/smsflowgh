import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  template: `
    <section class="page-stack">
      <header class="page-header">
        <div class="header-row">
          <div class="header-copy">
            <p class="page-kicker">Wallet ledger</p>
            <h1>Payment history</h1>
            <p class="subtle">Review package purchases, payment status, and wallet crediting progress.</p>
          </div>
          <div class="amount-lockup">
            <span class="mini-label">Records</span>
            <strong>{{ payments().length | number }}</strong>
          </div>
        </div>
      </header>

      <div class="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Package</th>
              <th>Amount</th>
              <th>SMS</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (payment of payments(); track payment.id) {
              <tr>
                <td>{{ payment.createdAt | date:'medium' }}</td>
                <td>{{ payment.smsPackage?.name }}</td>
                <td>GH¢{{ payment.amountGhs }}</td>
                <td>{{ payment.smsUnits | number }}</td>
                <td><span class="status {{ payment.status }}">{{ payment.status }}</span></td>
                <td><button class="ghost" type="button" (click)="verify(payment.id)">Verify</button></td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6">
                  <div class="empty-state">
                    <strong>No payment records</strong>
                    <span>Credit purchases will be listed here after a payment request is created.</span>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class PaymentsPageComponent {
  private readonly api = inject(ApiService);
  readonly payments = signal<any[]>([]);

  constructor() {
    this.load();
  }

  verify(id: string) {
    this.api.verifyPayment(id).subscribe(() => this.load());
  }

  private load() {
    this.api.payments().subscribe((value) => this.payments.set(value));
  }
}
