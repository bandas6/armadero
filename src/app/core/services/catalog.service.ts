import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CategoryNode,
  ProductFilters,
  ProductListResponse,
  SiteSettings,
} from '../models/catalog.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getProducts(filters: ProductFilters = {}): Observable<ProductListResponse> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<ProductListResponse>(`${this.base}/products`, { params });
  }

  // Categorias y ajustes cambian poco: se comparten dentro de la misma sesion/render
  // para no repetir la llamada por cada componente (header, footer, home).
  private categories$ = this.http
    .get<CategoryNode[]>(`${this.base}/categories`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  private settings$ = this.http
    .get<SiteSettings>(`${this.base}/settings`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getCategoryTree(): Observable<CategoryNode[]> {
    return this.categories$;
  }

  getSettings(): Observable<SiteSettings> {
    return this.settings$;
  }
}
