import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, SmsPackage } from '../../core/services/api.service';

@Component({
  selector: 'app-buy-credits-page',
  standalone: true,
  imports: [DecimalPipe, FormsModule],
  template: `
    <section class="page-stack">
      <header class="page-header">
        <div class="header-row">
          <div class="header-copy">
            <p class="page-kicker">Wallet desk</p>
            <h1>Buy SMS credits</h1>
            <p class="subtle">Choose a package, enter the MTN MoMo number, and request payment approval.</p>
          </div>
          <div class="amount-lockup">
            <span class="mini-label">Selected</span>
            <strong>{{ selectedPackage()?.smsUnits || 0 | number }} SMS</strong>
          </div>
        </div>
      </header>

      <div class="package-grid">
        @for (pack of packages(); track pack.id) {
          <button
            class="package-tile"
            type="button"
            [class.selected]="selectedPackageId() === pack.id"
            (click)="selectedPackageId.set(pack.id)">
            <span>{{ pack.name }}</span>
            <strong>GH¢{{ pack.amountGhs }}</strong>
            <em>{{ pack.smsUnits | number }} SMS</em>
            <small class="subtle">GH¢{{ pricePerSms(pack) }} / SMS</small>
          </button>
        }
      </div>

      <form class="panel form-row" (ngSubmit)="buy()">
        <label>
          MTN MoMo number
          <input name="momoNumber" [(ngModel)]="momoNumber" placeholder="+233241234567">
        </label>
        <div class="purchase-summary">
          <span>{{ selectedPackage()?.name || 'Select package' }}</span>
          <strong>{{ selectedPackage()?.smsUnits || 0 | number }} SMS</strong>
        </div>
        <button type="submit">Request to pay</button>
      </form>

      @if (payment()) {
        <section class="panel result-panel">
          <span class="status {{ payment().status }}">{{ payment().status }}</span>
          <h2>Payment request created</h2>
          <p>Reference: {{ payment().providerReference }}</p>
        </section>
      }
    </section>
  `
})
export class BuyCreditsPageComponent {
  private readonly api = inject(ApiService);
  readonly packages = signal<SmsPackage[]>([]);
  readonly selectedPackageId = signal('');
  readonly payment = signal<any | null>(null);
  momoNumber = '';
  readonly selectedPackage = computed(() => this.packages().find((pack) => pack.id === this.selectedPackageId()));

  constructor() {
    this.api.packages().subscribe((value) => {
      this.packages.set(value);
      this.selectedPackageId.set(value[0]?.id ?? '');
    });
  }

  buy() {
    const smsPackageId = this.selectedPackageId();
    if (!smsPackageId || !this.momoNumber) {
      return;
    }
    this.api.buyCredits(smsPackageId, this.momoNumber).subscribe((value) => this.payment.set(value));
  }

  pricePerSms(pack: SmsPackage) {
    return (Number(pack.amountGhs) / pack.smsUnits).toFixed(4);
  }
}
