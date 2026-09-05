import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AdminSettings } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminSettingsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/settings`;

  get(): Observable<AdminSettings> {
    return this.http.get<AdminSettings>(this.base);
  }

  update(patch: Partial<AdminSettings>): Observable<AdminSettings> {
    return this.http.put<AdminSettings>(this.base, patch);
  }
}
