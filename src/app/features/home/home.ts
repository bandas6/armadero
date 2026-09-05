import { Component, DestroyRef, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, catchError } from 'rxjs';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { StructuredDataService } from '../../core/services/structured-data.service';
import { ProductCard } from '../catalog/product-card';
import type { CategoryNode, ProductListResponse, SiteSettings } from '../../core/models/catalog.model';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: '¿Fabrican a la medida?',
    a: 'Sí. La mayoría de los muebles se hacen por encargo: defines medidas, número de puestos, color del tejido o el acabado de la madera.',
  },
  {
    q: '¿En cuánto tiempo entregan?',
    a: 'Depende del mueble y de la carga del taller. Lo confirmamos por WhatsApp cuando cerramos la cotización.',
  },
  {
    q: '¿Envían fuera de Cali?',
    a: 'Sí. El costo del flete se acuerda en la conversación según la ciudad y el tamaño del mueble.',
  },
  {
    q: '¿El tejido aguanta el exterior?',
    a: 'Trabajamos fibras sintéticas para exterior y fibras naturales para interior. Te decimos cuál conviene según dónde va el mueble.',
  },
  {
    q: '¿Dan garantía?',
    a: 'Sí, sobre la estructura y el tejido. El detalle queda por escrito al confirmar el pedido.',
  },
];

const PILARES = [
  { title: 'Se fabrica a la medida', text: 'Cada mueble sale del taller con las medidas de tu espacio, no de un molde.' },
  { title: 'Tejido a mano', text: 'Mimbre, ratán y fibra sintética tejidos a mano, pieza por pieza.' },
  { title: 'Atención directa', text: 'Hablas con quien fabrica el mueble, no con un intermediario.' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCard],
  templateUrl: './home.html',
})
export class Home {
  private catalog = inject(CatalogService);
  private seo = inject(SeoService);
  private jsonLd = inject(StructuredDataService);

  readonly faqs = FAQS;
  readonly pilares = PILARES;
  readonly filesUrl = environment.filesUrl;

  readonly tree = toSignal(
    this.catalog.getCategoryTree().pipe(catchError(() => of([] as CategoryNode[]))),
    { initialValue: [] as CategoryNode[] },
  );

  readonly settings = toSignal(
    this.catalog.getSettings().pipe(catchError(() => of(null as SiteSettings | null))),
    { initialValue: null as SiteSettings | null },
  );

  private featuredResponse = toSignal(
    this.catalog
      .getProducts({ sort: 'destacados', pageSize: 8 })
      .pipe(catchError(() => of<ProductListResponse | null>(null))),
    { initialValue: null as ProductListResponse | null },
  );

  readonly featured = computed(() => this.featuredResponse()?.items.filter((p) => p.featured) ?? []);

  /** Grilla de categorías del home: solo los tipos de primer nivel. */
  readonly typeCategories = computed(() => this.tree());

  constructor() {
    this.seo.setPage({
      title: 'Muebles campestres y tejidos en Cali',
      description:
        'Fabricantes de muebles campestres y tejidos en Cali. Mecedoras, salas, comedores y más, hechos a la medida. Cotiza por WhatsApp.',
      path: '/',
      type: 'website',
    });
    effect(() => this.jsonLd.setLocalBusiness(this.settings()));
    inject(DestroyRef).onDestroy(() => this.jsonLd.clear());
  }

  /** Subcategorías con corte de material (las que se muestran como Tejido / Madera). */
  materialChildren(parent: CategoryNode): CategoryNode[] {
    return parent.children.filter((c) => c.material);
  }
}
