import { Injectable, signal } from '@angular/core';

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  clientId: string | null;
  isSuperAdmin: boolean;
};

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly tokenKey = 'sms_portal_token';
  private readonly userKey = 'sms_portal_user';
  readonly user = signal<SessionUser | null>(this.readUser());

  token() {
    return localStorage.getItem(this.tokenKey);
  }

  setSession(accessToken: string, user: SessionUser) {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.user.set(user);
  }

  clear() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.user.set(null);
  }

  private readUser() {
    const raw = localStorage.getItem(this.userKey);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  }
}
