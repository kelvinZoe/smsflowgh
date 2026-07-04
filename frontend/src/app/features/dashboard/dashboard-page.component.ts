import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, SmsPackage, WalletSummary } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  template: `
    <section class="page-stack">
      <header class="page-header">
        <div class="header-row">
          <div class="header-copy">
            <p class="page-kicker">Client portal</p>
            <h1>SMS wallet dashboard</h1>
            <p class="subtle">Track wallet balance, package pricing, and payment settlement from one view.</p>
          </div>
          <div class="header-actions">
            <a class="button-link" routerLink="/buy-credits">Buy credits</a>
            <a class="soft-action" routerLink="/campaigns">Campaigns</a>
          </div>
        </div>
      </header>

      <div class="metric-grid">
        <article class="metric panel">
          <span>Wallet balance</span>
          <strong>{{ wallet()?.balance ?? 0 | number }} SMS</strong>
          <a routerLink="/buy-credits">Top up now</a>
        </article>
        <article class="metric panel">
          <span>Credits bought</span>
          <strong>{{ report()?.walletCredits ?? 0 | number }}</strong>
        </article>
        <article class="metric panel">
          <span>Credits spent</span>
          <strong>{{ report()?.walletDebits ?? 0 | number }}</strong>
        </article>
        <article class="metric panel">
          <span>Campaigns</span>
          <strong>{{ report()?.campaignCount ?? 0 | number }}</strong>
        </article>
      </div>

      <section class="split">
        <div class="panel">
          <div class="section-title">
            <div class="section-copy">
              <p class="eyebrow">Credit bundles</p>
              <h2>Active packages</h2>
            </div>
            <a routerLink="/buy-credits">Open</a>
          </div>
          <div class="package-list compact">
            @for (pack of packages(); track pack.id) {
              <article>
                <span>{{ pack.name }}</span>
                <strong>GH¢{{ pack.amountGhs }}</strong>
                <em>{{ pack.smsUnits | number }} SMS</em>
              </article>
            }
          </div>
        </div>

        <div class="panel">
          <div class="section-title">
            <div class="section-copy">
              <p class="eyebrow">Settlement log</p>
              <h2>Recent payments</h2>
            </div>
            <a routerLink="/payments">View</a>
          </div>
          <table>
            <thead>
              <tr><th>Date</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              @for (payment of payments().slice(0, 5); track payment.id) {
                <tr>
                  <td>{{ payment.createdAt | date:'mediumDate' }}</td>
                  <td>GH¢{{ payment.amountGhs }}</td>
                  <td><span class="status {{ payment.status }}">{{ payment.status }}</span></td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="3">
                    <div class="empty-state">
                      <strong>No payments yet</strong>
                      <span>Buy credits and payment activity will appear here.</span>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `
})
export class DashboardPageComponent {
  private readonly api = inject(ApiService);
  readonly wallet = signal<WalletSummary | null>(null);
  readonly report = signal<any | null>(null);
  readonly packages = signal<SmsPackage[]>([]);
  readonly payments = signal<any[]>([]);

  constructor() {
    this.api.wallet().subscribe({ next: (value) => this.wallet.set(value), error: () => this.wallet.set(null) });
    this.api.dashboard().subscribe({ next: (value) => this.report.set(value), error: () => this.report.set(null) });
    this.api.packages().subscribe((value) => this.packages.set(value));
    this.api.payments().subscribe({ next: (value) => this.payments.set(value), error: () => this.payments.set([]) });
  }
}
