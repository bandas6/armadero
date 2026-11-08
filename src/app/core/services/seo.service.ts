import { DOCUMENT } from '@angular/common';
import { Injectable, RESPONSE_INIT, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SiteOriginService } from './site-origin.service';

export interface PageSeo {
  title: string;
  description?: string;
  /** Ruta absoluta desde la raíz, sin dominio ni query. Ej: "/producto/mecedora-buga". */
  path: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  /**
   * Código HTTP de la respuesta SSR. Una página "no encontrado" debe responder 404 (no
   * 200 con noindex, que Google reporta como soft 404); un fallo de la API, 503, para que
   * Google reintente en vez de sacar el producto del índice.
   */
  status?: number;
}

const SUFIJO = ' · Artemadero';
/** Imagen para compartir cuando la página no tiene foto propia (1200×630, en public/). */
const OG_IMAGE_DEFAULT = '/og-artemadero.jpg';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);
  private site = inject(SiteOriginService);
  /** Solo existe en el servidor: en el navegador el código de estado ya no aplica. */
  private response = inject(RESPONSE_INIT, { optional: true });

  setPage(seo: PageSeo): void {
    if (this.response) this.response.status = seo.status ?? 200;

    const full = seo.title.endsWith(SUFIJO) ? seo.title : seo.title + SUFIJO;
    this.title.setTitle(full);

    const origin = this.site.origin;
    const url = origin + seo.path;
    const image = seo.image ?? origin + OG_IMAGE_DEFAULT;

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
