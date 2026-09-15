import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  AdminBanner,
  AdminBannerInput,
  AdminCollection,
  AdminCollectionInput,
  AdminShippingZone,
  AdminShippingZoneInput,
  AdminUserInput,
  AdminUserRow,
} from '../models/admin.model';

/**
 * Los recursos de la "segunda versión" del panel: banners del home, colecciones, zonas de
 * envío y usuarios. Mismo contrato que productos y categorías: nada se borra, se oculta.
 */
@Injectable({ providedIn: 'root' })
export class AdminContentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin`;

  // --- Banners ---
  listBanners(): Observable<AdminBanner[]> {
    return this.http.get<AdminBanner[]>(`${this.base}/banners`);
  }
  createBanner(input: AdminBannerInput): Observable<AdminBanner> {
    return this.http.post<AdminBanner>(`${this.base}/banners`, input);
  }
  updateBanner(id: string, patch: AdminBannerInput): Observable<AdminBanner> {
    return this.http.patch<AdminBanner>(`${this.base}/banners/${id}`, patch);
  }
  setBannerActive(id: string, active: boolean): Observable<AdminBanner> {
    return this.http.post<AdminBanner>(`${this.base}/banners/${id}/active`, { active });
  }
  reorderBanners(orderedIds: string[]): Observable<void> {
    return this.http.patch<void>(`${this.base}/banners/reorder`, { orderedIds });
  }

  // --- Colecciones ---
  listCollections(): Observable<AdminCollection[]> {
    return this.http.get<AdminCollection[]>(`${this.base}/collections`);
  }
  createCollection(input: AdminCollectionInput): Observable<AdminCollection> {
    return this.http.post<AdminCollection>(`${this.base}/collections`, input);
  }
  updateCollection(id: string, patch: AdminCollectionInput): Observable<AdminCollection> {
    return this.http.patch<AdminCollection>(`${this.base}/collections/${id}`, patch);
  }
  setCollectionActive(id: string, active: boolean): Observable<AdminCollection> {
    return this.http.post<AdminCollection>(`${this.base}/collections/${id}/active`, { active });
  }
  reorderCollections(orderedIds: string[]): Observable<void> {
    return this.http.patch<void>(`${this.base}/collections/reorder`, { orderedIds });
  }

  // --- Zonas de envío ---
  listShippingZones(): Observable<AdminShippingZone[]> {
    return this.http.get<AdminShippingZone[]>(`${this.base}/shipping-zones`);
  }
  createShippingZone(input: AdminShippingZoneInput): Observable<AdminShippingZone> {
    return this.http.post<AdminShippingZone>(`${this.base}/shipping-zones`, input);
  }
  updateShippingZone(id: string, patch: AdminShippingZoneInput): Observable<AdminShippingZone> {
    return this.http.patch<AdminShippingZone>(`${this.base}/shipping-zones/${id}`, patch);
  }
  setShippingZoneActive(id: string, active: boolean): Observable<AdminShippingZone> {
    return this.http.post<AdminShippingZone>(`${this.base}/shipping-zones/${id}/active`, {
      active,
    });
  }

  // --- Usuarios ---
  listUsers(): Observable<AdminUserRow[]> {
    return this.http.get<AdminUserRow[]>(`${this.base}/users`);
  }
  createUser(input: AdminUserInput): Observable<AdminUserRow> {
    return this.http.post<AdminUserRow>(`${this.base}/users`, input);
  }
  updateUser(id: string, patch: AdminUserInput): Observable<AdminUserRow> {
    return this.http.patch<AdminUserRow>(`${this.base}/users/${id}`, patch);
  }

  /** La propia contraseña: pide la actual y cierra las demás sesiones. */
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.base}/auth/password`, { currentPassword, newPassword });
  }
}
