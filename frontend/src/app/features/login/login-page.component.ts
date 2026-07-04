import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SessionService } from '../../core/auth/session.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="login-layout">
      <div class="login-showcase">
        <div class="header-copy">
          <p class="brand-subtitle">SMS Portal</p>
          <h1>Wallet-first bulk messaging</h1>
          <p>Buy SMS credits, monitor wallet movement, and launch campaigns from one focused operations console.</p>
        </div>
        <div class="showcase-grid">
          <div class="showcase-tile">
            <span>Wallet</span>
            <strong>Ledger ready</strong>
          </div>
          <div class="showcase-tile">
            <span>Payments</span>
            <strong>MoMo flow</strong>
          </div>
          <div class="showcase-tile">
            <span>Campaigns</span>
            <strong>Bulk SMS</strong>
          </div>
        </div>
      </div>

      <form class="panel form-grid login-card" (ngSubmit)="login()">
        <div class="section-copy">
          <p class="eyebrow">Access</p>
          <h1>Sign in</h1>
          <p class="subtle">Use your admin or client account to continue.</p>
        </div>
        <label>
          Email
          <input type="email" name="email" [(ngModel)]="email" autocomplete="email">
        </label>
        <label>
          Password
          <input type="password" name="password" [(ngModel)]="password" autocomplete="current-password">
        </label>
        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
        <button type="submit">Sign in</button>
      </form>
    </section>
  `
})
export class LoginPageComponent {
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly error = signal('');
  email = 'admin@smsportal.local';
  password = 'ChangeMe123!';

  login() {
    this.error.set('');
    this.api.login(this.email, this.password).subscribe({
      next: (response) => {
        this.session.setSession(response.accessToken, response.user);
        void this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('returnUrl') ?? '/');
      },
      error: () => this.error.set('Invalid email or password')
    });
  }
}
