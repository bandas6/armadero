import { Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, switchMap, catchError, startWith, type Observable } from 'rxjs';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCard } from './product-card';
import { whatsappUrl } from '../../core/business';
import type {
  CategoryNode,
  Material,
  ProductListResponse,
  ProductSort,
} from '../../core/models/catalog.model';

const SORTS: { value: ProductSort; label: string }[] = [
  { value: 'destacados', label: 'Destacados' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'recientes', label: 'Más recientes' },
];

/** Rangos de precio del filtro, en pesos enteros. */
const PRICE_RANGES: { value: string; label: string; min?: number; max?: number }[] = [
  { value: '', label: 'Cualquier precio' },
  { value: '0-500000', label: 'Hasta $ 500.000', max: 500000 },
  { value: '500000-1500000', label: '$ 500.000 a $ 1.500.000', min: 500000, max: 1500000 },
  { value: '1500000-3000000', label: '$ 1.500.000 a $ 3.000.000', min: 1500000, max: 3000000 },
  { value: '3000000-', label: 'Más de $ 3.000.000', min: 3000000 },
];

/** Puestos que se piden de verdad en salas y comedores. */
const SEAT_OPTIONS = [2, 3, 4, 5, 6, 8, 10, 12];

interface CatalogParams {
  /** null cuando la categoría elegida no se parte por material (Camas, Guadua...). */
  material: Material | null;
  category?: string;
  seats?: number;
  price: string;
  personalizable: boolean;
  disponible: boolean;
  q?: string;
  sort: ProductSort;
  page: number;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ProductCard],
  templateUrl: './catalog.html',
})
export class Catalog {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalog = inject(CatalogService);
  private seo = inject(SeoService);

  readonly sorts = SORTS;
  readonly priceRanges = PRICE_RANGES;
  readonly seatOptions = SEAT_OPTIONS;

  private tree = toSignal(
    this.catalog.getCategoryTree().pipe(catchError(() => of([] as CategoryNode[]))),
    { initialValue: [] as CategoryNode[] },
  );

  /**
   * Todo el estado vive en la URL: el conmutador se puede compartir por enlace y el SSR
   * renderiza la pantalla correcta (design/PROMPT-3-catalogo.md).
   *
   * Sin categoría elegida el catálogo arranca en tejido, que es más de la mitad de lo que
   * el taller fabrica. Con una categoría que no se parte por material, `material` queda en
   * null y el conmutador no marca ninguno de los dos.
   */
  private readParams(
    p: { get(k: string): string | null },
    qp: { get(k: string): string | null },
  ): CatalogParams {
    const category = p.get('slug') ?? qp.get('categoria') ?? undefined;
    const rawMaterial = qp.get('material') as Material | null;
    return {
      material: rawMaterial ?? (category ? null : 'tejido'),
      category,
      seats: Number(qp.get('puestos')) || undefined,
      price: qp.get('precio') ?? '',
      personalizable: qp.get('medida') === 'true',
      disponible: qp.get('entrega') === 'true',
      q: qp.get('q') ?? undefined,
      sort: (qp.get('orden') as ProductSort | null) ?? 'destacados',
      page: Number(qp.get('pagina')) || 1,
    };
  }

  private params$ = combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
    map(([p, qp]) => this.readParams(p, qp)),
  );

  readonly filters = toSignal(this.params$, {
    initialValue: {
      material: 'tejido' as Material | null,
      price: '',
      personalizable: false,
      disponible: false,
      sort: 'destacados' as ProductSort,
      page: 1,
    } as CatalogParams,
  });

  private result = toSignal(
    this.params$.pipe(
      switchMap((f) => {
        const range = PRICE_RANGES.find((r) => r.value === f.price);
        return this.catalog
          .getProducts({
            category: f.category,
            material: f.material ?? undefined,
            q: f.q,
            seats: f.seats,
            minPrice: range?.min,
            maxPrice: range?.max,
            personalizable: f.personalizable || undefined,
            disponible: f.disponible || undefined,
            sort: f.sort,
            page: f.page,
            pageSize: 24,
          })
          .pipe(catchError(() => of({ items: [], total: 0, page: 1, pageSize: 24 })));
      }),
      startWith(null),
    ) as Observable<ProductListResponse | null>,
  );

  readonly response = this.result;
  readonly loading = computed(() => this.result() === null);

  /** Todas las hojas del árbol: los productos siempre cuelgan de una hoja. */
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

  /**
   * Las categorías del material activo. El conmutador reestructura esta retícula, no solo
   * filtra la de productos: en tejido salen unas y en madera otras.
   */
  readonly materialCategories = computed(() => {
    const material = this.filters().material;
    if (!material) return [];
    return this.leaves().filter((c) => c.material === material);
  });

  /** Las que ya tienen fotos, y las que se fabrican pero todavía no se han fotografiado. */
  readonly categoriesWithPhotos = computed(() =>
    this.materialCategories().filter((c) => c.productCount > 0),
  );
  readonly categoriesPending = computed(() =>
    this.materialCategories().filter((c) => c.productCount === 0),
  );

  /**
   * Las líneas que atraviesan el corte: Camas, Nocheros, Mesas de centro, Guadua. No se
   * fabrican en dos materiales, así que no caben en ninguna de las dos mitades — pero
   * tampoco se pueden esconder.
   */
  readonly crossCategories = computed(() =>
    this.leaves().filter((c) => !c.material && c.productCount > 0),
  );

  readonly activeCategory = computed<CategoryNode | undefined>(() => {
    const slug = this.filters().category;
    if (!slug) return undefined;
    const find = (nodes: CategoryNode[]): CategoryNode | undefined => {
      for (const n of nodes) {
        if (n.slug === slug) return n;
        const hit = find(n.children);
        if (hit) return hit;
      }
      return undefined;
    };
    return find(this.tree());
  });

  readonly totalPages = computed(() => {
    const r = this.result();
    return r ? Math.max(1, Math.ceil(r.total / r.pageSize)) : 1;
  });

  readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    return Boolean(f.category || f.seats || f.price || f.personalizable || f.disponible || f.q);
  });

  readonly materialLabel = computed(() =>
    this.filters().material === 'madera' ? 'de madera' : 'tejidos',
  );

  /** Enlace a WhatsApp para una categoría que todavía no tiene fotos. */
  pendingCategoryUrl(category: CategoryNode): string {
    return whatsappUrl(
      `Hola Artemadero, quiero ver ${category.name.toLowerCase()}. ¿Me mandas fotos y precios?`,
    );
  }

  // ---- Navegación: cada cambio de filtro reescribe la URL y vuelve a la página 1 ----

  private navigate(patch: Record<string, string | number | boolean | null>) {
    this.router.navigate(['/catalogo'], {
      queryParams: { ...patch, pagina: null },
      queryParamsHandling: 'merge',
    });
  }

  setMaterial(material: Material) {
    // Cambiar de material deja sin sentido la categoría elegida en el otro.
    this.router.navigate(['/catalogo'], { queryParams: { material } });
  }

  setCategory(category: CategoryNode | null) {
    this.router.navigate(['/catalogo'], {
      queryParams: {
        categoria: category?.slug ?? null,
        // Una categoría transversal (Camas, Guadua) no pertenece a ningún material.
        material: category ? (category.material ?? null) : this.filters().material,
      },
    });
  }

  setSeats(value: string) {
    this.navigate({ puestos: value || null });
  }

  setPrice(value: string) {
    this.navigate({ precio: value || null });
  }

  togglePersonalizable() {
    this.navigate({ medida: this.filters().personalizable ? null : 'true' });
  }

  toggleDisponible() {
    this.navigate({ entrega: this.filters().disponible ? null : 'true' });
  }

  setSort(value: string) {
    this.navigate({ orden: value === 'destacados' ? null : value });
  }

  clearFilters() {
    this.router.navigate(['/catalogo'], {
      queryParams: { material: this.filters().material },
    });
  }

  goToPage(page: number) {
    this.router.navigate(['/catalogo'], {
      queryParams: { pagina: page <= 1 ? null : page },
      queryParamsHandling: 'merge',
    });
  }

  constructor() {
    effect(() => {
      const cat = this.activeCategory();
      const f = this.filters();
      const material = f.material === 'tejido' ? 'tejidos' : f.material === 'madera' ? 'de madera' : '';
      const title = cat
        ? cat.name
        : f.q
          ? `Búsqueda: ${f.q}`
          : material
            ? `Muebles ${material}`
            : 'Catálogo';
      const total = this.response()?.total ?? 0;
      this.seo.setPage({
        title,
        description:
          cat?.description ??
          `${cat ? cat.name : `Muebles ${material || 'de Artemadero'}`}: ${total} referencias, ` +
            'hechas a la medida en Cali. Precio según medidas o valor estimado, y cotización por WhatsApp.',
        // Canonical sin paginación ni búsqueda.
        path: cat
          ? `/catalogo?categoria=${cat.slug}`
          : f.material
            ? `/catalogo?material=${f.material}`
            : '/catalogo',
        type: 'website',
        noindex: Boolean(f.q) || total === 0,
      });
    });
  }
}
