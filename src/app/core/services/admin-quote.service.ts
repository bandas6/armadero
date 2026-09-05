import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AdminQuote, AdminQuoteCard, QuoteStats, QuoteStatus } from '../models/admin.model';

export interface QuoteListResponse {
  items: AdminQuoteCard[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class AdminQuoteService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/quotes`;

  list(filters: { status?: string; q?: string; page?: number } = {}): Observable<QuoteListResponse> {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    }
    return this.http.get<QuoteListResponse>(this.base, { params });
  }

  stats(): Observable<QuoteStats> {
    return this.http.get<QuoteStats>(`${this.base}/stats`);
  }

  get(id: string): Observable<AdminQuote> {
    return this.http.get<AdminQuote>(`${this.base}/${id}`);
  }

  update(id: string, patch: { status?: QuoteStatus; adminNotes?: string }): Observable<AdminQuote> {
    return this.http.patch<AdminQuote>(`${this.base}/${id}`, patch);
  }
}
