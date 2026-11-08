import { DOCUMENT, isPlatformServer } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  REQUEST,
  REQUEST_CONTEXT,
  TransferState,
  inject,
  makeStateKey,
} from '@angular/core';
import { environment } from '../../../environments/environment';

const ORIGIN_KEY = makeStateKey<string>('site-origin');

/**
 * Origen absoluto del sitio (https://dominio, sin barra final) para canonical, og:url y
 * JSON-LD.
 *
 * El dominio canónico sale de la variable SITE_URL del servidor (server.ts la pasa como
 * contexto del request). Así, aunque el sitio responda también por la URL .onrender.com o
 * por www, todas las páginas se declaran bajo un solo dominio. Sin SITE_URL (desarrollo) se
 * usa el host del request. El valor viaja al navegador por TransferState para que la
 * navegación del lado del cliente declare el mismo dominio que el SSR.
 */
@Injectable({ providedIn: 'root' })
export class SiteOriginService {
  private doc = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private request = inject(REQUEST, { optional: true });
  private context = inject(REQUEST_CONTEXT, { optional: true }) as { siteUrl?: string } | null;
  private state = inject(TransferState);

  readonly origin: string = this.resolve();

  private resolve(): string {
    if (!isPlatformServer(this.platformId)) {
      return this.state.get(ORIGIN_KEY, '') || this.doc.location.origin;
    }
    const origin = (this.context?.siteUrl || this.fromRequest() || environment.siteUrl || '')
      .replace(/\/$/, '');
    this.state.set(ORIGIN_KEY, origin);
    return origin;
  }

  private fromRequest(): string {
    const host = this.request?.headers.get('host');
    if (!host) return '';
    // Detrás de varios proxies llega "https,http": manda el primero.
    const fwd = this.request?.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
    const proto = fwd || (/^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? 'http' : 'https');
    return `${proto}://${host}`;
  }
}
