import { Routes } from '@angular/router';
import { authGuard, superAdminGuard } from './core/auth/auth.guard';
import { AdminPageComponent } from './features/admin/admin-page.component';
import { CampaignsPageComponent } from './features/campaigns/campaigns-page.component';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';
import { LoginPageComponent } from './features/login/login-page.component';
import { PaymentsPageComponent } from './features/payments/payments-page.component';
import { BuyCreditsPageComponent } from './features/wallet/buy-credits-page.component';

export const routes: Routes = [
  { path: '', component: DashboardPageComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginPageComponent },
  { path: 'buy-credits', component: BuyCreditsPageComponent, canActivate: [authGuard] },
  { path: 'payments', component: PaymentsPageComponent, canActivate: [authGuard] },
  { path: 'campaigns', component: CampaignsPageComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminPageComponent, canActivate: [authGuard, superAdminGuard] },
  { path: '**', redirectTo: '' }
];
