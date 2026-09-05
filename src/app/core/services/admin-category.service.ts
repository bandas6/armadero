import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AdminCategory, AdminCategoryInput } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminCategoryService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/categories`;

  list(): Observable<AdminCategory[]> {
    return this.http.get<AdminCategory[]>(this.base);
  }

  create(input: AdminCategoryInput): Observable<AdminCategory> {
    return this.http.post<AdminCategory>(this.base, input);
  }

  update(id: string, patch: AdminCategoryInput): Observable<AdminCategory> {
    return this.http.patch<AdminCategory>(`${this.base}/${id}`, patch);
  }

  setActive(id: string, active: boolean): Observable<{ hiddenProductCount: number }> {
    return this.http.post<{ hiddenProductCount: number }>(`${this.base}/${id}/active`, { active });
  }

  reorder(orderedIds: string[]): Observable<void> {
    return this.http.patch<void>(`${this.base}/reorder`, { orderedIds });
  }
}
