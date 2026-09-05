import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AdminUser, AuthResponse } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private base = `${environment.apiUrl}/admin/auth`;

  private _user = signal<AdminUser | null>(null);
  private _accessToken = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  /** Se resuelve cuando el intento inicial de restaurar sesión terminó (éxito o no). */
  readonly ready: Promise<void>;

  constructor() {
    this.ready = isPlatformBrowser(this.platformId)
      ? this.restoreSession()
      : Promise.resolve();
  }

  get accessToken(): string | null {
    return this._accessToken();
  }

  private apply(res: AuthResponse) {
    this._accessToken.set(res.accessToken);
    this._user.set(res.user);
  }

  private clear() {
    this._accessToken.set(null);
    this._user.set(null);
  }

  async restoreSession(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.base}/refresh`, {}, { withCredentials: true }),
      );
      this.apply(res);
    } catch {
      this.clear();
    }
  }

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(
        `${this.base}/login`,
        { email, password },
        { withCredentials: true },
      ),
    );
    this.apply(res);
  }

  /** Usado por el interceptor ante un 401: intenta una rotación silenciosa. */
  async refresh(): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.base}/refresh`, {}, { withCredentials: true }),
      );
      this.apply(res);
      return true;
    } catch {
      this.clear();
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.base}/logout`, {}, { withCredentials: true }),
      );
    } finally {
      this.clear();
    }
  }
}
