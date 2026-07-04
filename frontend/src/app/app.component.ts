import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from './core/auth/session.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    @if (isAuthRoute()) {
      <main class="auth-content">
        <router-outlet />
      </main>
    } @else {
      <div class="shell">
        <aside class="sidebar">
          <a class="brand" routerLink="/">
            <span class="brand-mark">SMS</span>
            <span>
              <span class="brand-name">SMS Portal</span>
              <span class="brand-subtitle">Client console</span>
            </span>
          </a>
          <nav>
            <a routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
            <a routerLink="/buy-credits" routerLinkActive="active-link">Buy credits</a>
            <a routerLink="/payments" routerLinkActive="active-link">Payments</a>
            <a routerLink="/campaigns" routerLinkActive="active-link">Campaigns</a>
            @if (isSuperAdmin()) {
              <a routerLink="/admin" routerLinkActive="active-link">Admin</a>
            }
          </nav>
          <div class="session-strip">
            @if (user()) {
              <div class="session-card">
                <span class="session-name">{{ user()?.fullName }}</span>
                <span class="session-role">{{ user()?.role }}</span>
              </div>
              <button class="ghost" type="button" (click)="logout()">Sign out</button>
            } @else {
              <a class="button-link" routerLink="/login">Sign in</a>
            }
          </div>
        </aside>
        <main class="content">
          <router-outlet />
        </main>
      </div>
    }
  `
})
export class AppComponent {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly currentUrl = signal(this.router.url);
  readonly user = this.session.user;
  readonly isSuperAdmin = computed(() => Boolean(this.user()?.isSuperAdmin));
  readonly isAuthRoute = computed(() => this.currentUrl().startsWith('/login'));

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects);
      }
    });
  }

  logout() {
    this.session.clear();
  }
}
