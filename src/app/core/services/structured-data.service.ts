import { DOCUMENT } from '@angular/common';
import { Injectable, REQUEST, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import type { Product } from '../models/product.model';
import type { SiteSettings } from '../models/catalog.model';

const SCRIPT_ID = 'ld-json';
const AVAILABILITY: Record<string, string> = {
  AVAILABLE: 'https://schema.org/InStock',
  MADE_TO_ORDER: 'https://schema.org/PreOrder',
  OUT_OF_STOCK: 'https://schema.org/OutOfStock',
  DISCONTINUED: 'https://schema.org/Discontinued',
};

@Injectable({ providedIn: 'root' })
export class StructuredDataService {
  private doc = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private request = inject(REQUEST, { optional: true });

  private origin(): string {
    if (isPlatformBrowser(this.platformId)) return this.doc.location.origin;
    const host = this.request?.headers?.get?.('host');
    if (host) {
      const fwd = this.request?.headers?.get?.('x-forwarded-proto');
      const proto = fwd ?? (/^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? 'http' : 'https');
      return `${proto}://${host}`;
    }
    return environment.siteUrl || '';
  }

  private write(data: unknown): void {
    const head = this.doc.head;
    let el = head.querySelector<HTMLScriptElement>(`script#${SCRIPT_ID}`);
    if (!el) {
      el = this.doc.createElement('script');
      el.id = SCRIPT_ID;
      el.type = 'application/ld+json';
      head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  clear(): void {
    this.doc.head.querySelector(`script#${SCRIPT_ID}`)?.remove();
  }

  setProduct(p: Product): void {
    const image = p.images?.find((i) => i.isPrimary)?.url ?? p.images?.[0]?.url;
    const price = p.priceFrom;
    const data: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.shortDescription || p.description || p.name,
      brand: { '@type': 'Brand', name: 'Artemadero' },
      category: p.category?.name,
      url: `${this.origin()}/producto/${p.slug}`,
    };
    if (image) data['image'] = image;
    if (p.material) data['material'] = p.material;

    if (p.hasPrice && typeof price === 'number') {
      data['offers'] = {
        '@type': 'Offer',
        price: String(price),
        priceCurrency: 'COP',
        availability: AVAILABILITY[p.status] ?? 'https://schema.org/PreOrder',
        url: `${this.origin()}/producto/${p.slug}`,
        seller: { '@type': 'Organization', name: 'Artemadero' },
      };
    }
    this.write(data);
  }

  setLocalBusiness(settings: SiteSettings | null): void {
    const data: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'FurnitureStore',
      name: 'Artemadero',
      description: 'Fabricantes de muebles campestres y tejidos en Cali. Diseños personalizados para hogar, finca o negocio.',
      url: this.origin(),
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Cali',
        addressRegion: 'Valle del Cauca',
        addressCountry: 'CO',
      },
      areaServed: 'Colombia',
    };
    const hours = settings?.businessHours;
    if (hours) data['openingHours'] = hours;
    const sameAs = [settings?.instagramUrl, settings?.facebookUrl].filter(Boolean);
    if (sameAs.length) data['sameAs'] = sameAs;
    this.write(data);
  }
}
