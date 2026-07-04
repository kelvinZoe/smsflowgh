import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ApiService, SmsPackage } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <section class="page-stack">
      <header class="page-header">
        <div class="header-row">
          <div class="header-copy">
            <p class="page-kicker">Super admin</p>
            <h1>Package controls</h1>
            <p class="subtle">Manage package visibility and compare effective price per SMS.</p>
          </div>
          <div class="amount-lockup">
            <span class="mini-label">Catalog</span>
            <strong>{{ packages().length | number }}</strong>
          </div>
        </div>
      </header>

      <div class="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Amount</th>
              <th>SMS units</th>
              <th>Rate</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (pack of packages(); track pack.id) {
              <tr>
                <td>{{ pack.name }}</td>
                <td>GH¢{{ pack.amountGhs }}</td>
                <td>{{ pack.smsUnits | number }}</td>
                <td>GH¢{{ pricePerSms(pack) }}</td>
                <td><span class="status {{ pack.isActive ? 'ACTIVE' : 'INACTIVE' }}">{{ pack.isActive ? 'ACTIVE' : 'INACTIVE' }}</span></td>
                <td>
                  <button class="ghost" type="button" (click)="toggle(pack)">
                    {{ pack.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6">
                  <div class="empty-state">
                    <strong>No packages configured</strong>
                    <span>Create SMS packages in the backend seed or admin API.</span>
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
export class AdminPageComponent {
  private readonly api = inject(ApiService);
  readonly packages = signal<SmsPackage[]>([]);

  constructor() {
    this.load();
  }

  toggle(pack: SmsPackage) {
    this.api.updatePackage(pack.id, { isActive: !pack.isActive }).subscribe(() => this.load());
  }

  pricePerSms(pack: SmsPackage) {
    return (Number(pack.amountGhs) / pack.smsUnits).toFixed(4);
  }

  private load() {
    this.api.adminPackages().subscribe((value) => this.packages.set(value));
  }
}
