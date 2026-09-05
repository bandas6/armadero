import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, REQUEST, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export interface PageSeo {
  title: string;
  description?: string;
  /** Ruta absoluta desde la raíz, sin dominio ni query. Ej: "/producto/mecedora-buga". */
  path: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
}

const SUFIJO = ' · Artemadero';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private request = inject(REQUEST, { optional: true });

  /** Origen absoluto del sitio (https://dominio), para canonical y og:url. */
  private origin(): string {
    if (isPlatformBrowser(this.platformId)) return this.doc.location.origin;
    // SSR: el host real del request; si no, el configurado en environment.
    const host = this.request?.headers?.get?.('host');
    if (host) {
      const fwd = this.request?.headers?.get?.('x-forwarded-proto');
      const proto = fwd ?? (/^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? 'http' : 'https');
      return `${proto}://${host}`;
    }
    return environment.siteUrl || '';
  }

  setPage(seo: PageSeo): void {
    const full = seo.title.endsWith(SUFIJO) ? seo.title : seo.title + SUFIJO;
    this.title.setTitle(full);

    const url = this.origin() + seo.path;
    const image = seo.image ?? `${this.origin()}/favicon.ico`;

    const tags: Record<string, string> = {
      'og:site_name': 'Artemadero',
      'og:title': full,
      'og:type': seo.type ?? 'website',
      'og:url': url,
      'og:image': image,
      'twitter:card': 'summary_large_image',
      'twitter:title': full,
    };
    if (seo.description) {
      tags['description'] = seo.description;
      tags['og:description'] = seo.description;
      tags['twitter:description'] = seo.description;
    } else {
      this.meta.removeTag('name="description"');
    }

    for (const [key, content] of Object.entries(tags)) {
      const attr = key.startsWith('og:') ? 'property' : 'name';
      this.meta.updateTag({ [attr]: key, content } as Record<string, string>);
    }

    if (seo.noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex,nofollow' });
    } else {
      this.meta.removeTag('name="robots"');
    }

    this.setCanonical(seo.noindex ? null : url);
  }

  private setCanonical(url: string | null): void {
    const head = this.doc.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!url) {
      link?.remove();
      return;
    }
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
