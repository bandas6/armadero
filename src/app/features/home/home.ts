import { Component, DestroyRef, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, catchError } from 'rxjs';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { StructuredDataService } from '../../core/services/structured-data.service';
import { ProductCard } from '../catalog/product-card';
import { MaterialTag } from '../../shared/material-tag';
import {
  BUSINESS_HOURS,
  BUSINESS_HOURS_SATURDAY,
  BUSINESS_HOURS_WEEKDAY,
  FOUNDING_YEAR,
  WHATSAPP_GENERIC_URL,
} from '../../core/business';
import type {
  CategoryNode,
  Material,
  ProductListResponse,
  SiteSettings,
} from '../../core/models/catalog.model';
import { environment } from '../../../environments/environment';

interface Faq {
  q: string;
  a: string;
}

/**
 * Seis preguntas, dos lineas cada una. Son las que hoy se resuelven por WhatsApp:
 * contestarlas antes baja el trabajo del chat (design/PROMPT-2-home.md). El texto es el
 * del mockup aprobado.
 */
const FAQS: Faq[] = [
  {
    q: '¿Fabrican a la medida?',
    a: 'Sí, casi todo. Nos dices el espacio que tienes y ajustamos el mueble. El precio depende de las medidas finales.',
  },
  {
    q: '¿En cuánto tiempo entregan?',
    a: 'Entre 2 y 5 semanas según la pieza y la medida. Al cotizar te damos la fecha concreta.',
  },
  {
    q: '¿Envían fuera de Cali?',
    a: 'Sí. El flete se cotiza aparte según la ciudad y el tamaño del mueble.',
  },
  {
    q: '¿El tejido aguanta el exterior?',
    a: 'Bajo techo sí, en terraza o corredor. A sol y lluvia directos la fibra se resiente; para eso te recomendamos madera o guadua.',
  },
  {
    q: '¿Dan garantía?',
    a: '12 meses en estructura y tejido. Si algo se suelta, lo reparamos en el taller.',
  },
  {
    q: '¿Puedo ir al local?',
    a: 'Claro. Ahí ves los tejidos, las maderas y los acabados en vivo antes de encargar.',
  },
];

/**
 * Las cuatro cifras del hero. Son las mismas que responden las preguntas frecuentes
 * (2 a 5 semanas, 12 meses): si cambia una, cambian las dos.
 */
const DATOS_HERO: { dato: string; nota: string }[] = [
  { dato: 'A la medida', nota: 'Casi todo el catálogo' },
  { dato: 'Tejido a mano', nota: 'Pieza por pieza' },
  { dato: '2 a 5 semanas', nota: 'Fabricación' },
  { dato: '12 meses', nota: 'De garantía' },
];

/** Las tres cosas que quitan el miedo a escribir por WhatsApp. */
const GARANTIAS_HERO = [
  'Local a la calle en Cali',
  'Enviamos a todo el país',
  'Hablas con quien fabrica',
];

interface Pilar {
  material: Material | 'ambos';
  title: string;
  text: string;
  photo: string;
  alt: string;
}

/** Tres, no cuatro, y cada uno con foto propia: nunca iconos genéricos de stock. */
const PILARES: Pilar[] = [
  {
    material: 'tejido',
    title: 'Tejido a mano',
    text: 'Mimbre, ratán y fibra natural, tejidos pieza por pieza. No hay dos exactamente iguales.',
    photo: '/fotos/lamparas-tejidas/lamparas-tejidas-02.webp',
    alt: 'Pantalla de lámpara tejida a mano en fibra natural, vista de cerca',
  },
  {
    material: 'madera',
    title: 'Madera y guadua',
    text: 'Madera maciza y guadua trabajadas en el taller, con acabados que aguantan el clima de aquí.',
    photo: '/fotos/muebles-guadua/muebles-guadua-01.webp',
    alt: 'Muebles en guadua terminados en el taller',
  },
  {
    material: 'ambos',
    title: 'A la medida',
    text: 'Dinos el espacio que tienes y lo fabricamos con esas medidas, en el material y el acabado que escojas.',
    photo: '/fotos/comedores-rusticos/comedores-rusticos-01.webp',
    alt: 'Comedor en madera maciza fabricado a la medida, exhibido en el local',
  },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, ProductCard, MaterialTag],
  templateUrl: './home.html',
})
export class Home {
  private catalog = inject(CatalogService);
  private seo = inject(SeoService);
  private jsonLd = inject(StructuredDataService);

  readonly faqs = FAQS;
  readonly pilares = PILARES;
  readonly datosHero = DATOS_HERO;
  readonly garantiasHero = GARANTIAS_HERO;
  readonly filesUrl = environment.filesUrl;
  readonly whatsappUrl = WHATSAPP_GENERIC_URL;
  readonly hours = BUSINESS_HOURS;
  readonly hoursWeekday = BUSINESS_HOURS_WEEKDAY;
  readonly hoursSaturday = BUSINESS_HOURS_SATURDAY;

  /**
   * PENDIENTE — sin el año de fundación la frase se arma sin él. "Fabricamos desde 2011"
   * pesa mucho más que "fabricamos muebles" (docs/pendientes-diseno.md).
   */
  readonly foundingYear = FOUNDING_YEAR;

  private tree = toSignal(
    this.catalog.getCategoryTree().pipe(catchError(() => of([] as CategoryNode[]))),
    { initialValue: [] as CategoryNode[] },
  );

  readonly settings = toSignal(
    this.catalog.getSettings().pipe(catchError(() => of(null as SiteSettings | null))),
    { initialValue: null as SiteSettings | null },
  );

  private featuredResponse = toSignal(
    this.catalog
      .getProducts({ sort: 'destacados', pageSize: 9 })
      .pipe(catchError(() => of<ProductListResponse | null>(null))),
    { initialValue: null as ProductListResponse | null },
  );

  /** El muestrario del home: nueve piezas. */
  readonly featured = computed(
    () => this.featuredResponse()?.items.filter((p) => p.featured).slice(0, 9) ?? [],
  );

  /**
   * Cuenta de categorías hoja por material, para las dos mitades del hero: cuántas tienen
   * fotos y cuántas están en camino. Sale del árbol real, no de un número escrito a mano.
   */
  private leaves = computed(() => {
    const out: CategoryNode[] = [];
    const walk = (nodes: CategoryNode[]) => {
      for (const n of nodes) {
        if (n.children.length) walk(n.children);
        else out.push(n);
      }
    };
    walk(this.tree());
    return out;
  });

  readonly tejidoCount = computed(() => this.countBy('tejido'));
  readonly maderaCount = computed(() => this.countBy('madera'));

  private countBy(material: Material) {
    const own = this.leaves().filter((c) => c.material === material);
    return {
      conFotos: own.filter((c) => c.productCount > 0).length,
      enCamino: own.filter((c) => c.productCount === 0).length,
    };
  }

  constructor() {
    this.seo.setPage({
      title: 'Muebles tejidos y de madera en Cali',
      description:
        'Fabricamos muebles tejidos y de madera en Cali: salas, comedores, mecedoras, camas, ' +
        'lámparas y espejos, a la medida de tu espacio. Cotiza por WhatsApp.',
      path: '/',
      type: 'website',
    });
    effect(() => this.jsonLd.setLocalBusiness(this.settings()));
    inject(DestroyRef).onDestroy(() => this.jsonLd.clear());
  }
}
