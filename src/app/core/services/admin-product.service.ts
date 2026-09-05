import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  AdminProduct,
  AdminProductInput,
  AdminProductList,
} from '../models/admin.model';

export interface AdminListFilters {
  q?: string;
  category?: string;
  status?: string;
  active?: 'true' | 'false';
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/products`;

  list(filters: AdminListFilters = {}): Observable<AdminProductList> {
    let params = new HttpParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    }
    return this.http.get<AdminProductList>(this.base, { params });
  }

  get(id: string): Observable<AdminProduct> {
    return this.http.get<AdminProduct>(`${this.base}/${id}`);
  }

  create(input: AdminProductInput): Observable<AdminProduct> {
    return this.http.post<AdminProduct>(this.base, input);
  }

  update(id: string, patch: Partial<AdminProductInput>): Observable<AdminProduct> {
    return this.http.patch<AdminProduct>(`${this.base}/${id}`, patch);
  }

  setActive(id: string, active: boolean): Observable<AdminProduct> {
    return this.http.post<AdminProduct>(`${this.base}/${id}/active`, { active });
  }

  setFeatured(id: string, featured: boolean): Observable<AdminProduct> {
    return this.http.post<AdminProduct>(`${this.base}/${id}/featured`, { featured });
  }

  reorder(orderedIds: string[]): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/admin/products/reorder`, {
      scope: 'all',
      orderedIds,
    });
  }

  // --- Imágenes ---
  upload(file: File): Observable<{ url: string; publicId: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string; publicId: string }>(
      `${environment.apiUrl}/admin/uploads`,
      form,
    );
  }

  attachImage(
    id: string,
    image: { url: string; publicId: string; alt?: string },
  ): Observable<AdminProduct> {
    return this.http.post<AdminProduct>(`${this.base}/${id}/images`, image);
  }

  reorderImages(id: string, orderedIds: string[]): Observable<AdminProduct> {
    return this.http.patch<AdminProduct>(`${this.base}/${id}/images/reorder`, { orderedIds });
  }

  setPrimaryImage(id: string, imageId: string): Observable<AdminProduct> {
    return this.http.post<AdminProduct>(`${this.base}/${id}/images/${imageId}/primary`, {});
  }

  removeImage(id: string, imageId: string): Observable<AdminProduct> {
    return this.http.delete<AdminProduct>(`${this.base}/${id}/images/${imageId}`);
  }
}
