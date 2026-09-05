import { Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, switchMap, catchError, startWith, type Observable } from 'rxjs';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCard } from './product-card';
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

  private tree = toSignal(this.catalog.getCategoryTree().pipe(catchError(() => of([] as CategoryNode[]))), {
    initialValue: [] as CategoryNode[],
  });

  // Combina el slug de ruta (/categoria/:slug) con los query params (/catalogo?...).
  private params = toSignal(
    combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      map(([p, qp]) => ({
        category: p.get('slug') ?? qp.get('categoria') ?? undefined,
        material: (qp.get('material') as Material | null) ?? undefined,
        q: qp.get('q') ?? undefined,
        sort: (qp.get('orden') as ProductSort | null) ?? 'destacados',
        page: Number(qp.get('pagina')) || 1,
      })),
    ),
    { initialValue: { category: undefined, material: undefined, q: undefined, sort: 'destacados' as ProductSort, page: 1 } },
  );

  private result = toSignal(
    combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      switchMap(([p, qp]) =>
        this.catalog
          .getProducts({
            category: p.get('slug') ?? qp.get('categoria') ?? undefined,
            material: (qp.get('material') as Material | null) ?? undefined,
            q: qp.get('q') ?? undefined,
            sort: (qp.get('orden') as ProductSort | null) ?? undefined,
            page: Number(qp.get('pagina')) || 1,
          })
          .pipe(catchError(() => of({ items: [], total: 0, page: 1, pageSize: 12 }))),
      ),
      startWith(null),
    ) as Observable<ProductListResponse | null>,
  );

  readonly filters = this.params;
  readonly response = this.result;
  readonly loading = computed(() => this.result() === null);

  readonly parentCategories = computed(() => this.tree());

  readonly activeCategory = computed<CategoryNode | undefined>(() => {
    const slug = this.params().category;
    if (!slug) return undefined;
    for (const parent of this.tree()) {
      if (parent.slug === slug) return parent;
      const child = parent.children.find((c) => c.slug === slug);
      if (child) return child;
    }
    return undefined;
  });

  readonly totalPages = computed(() => {
    const r = this.result();
    return r ? Math.max(1, Math.ceil(r.total / r.pageSize)) : 1;
  });

  private navigate(patch: Record<string, string | number | null>) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...patch, pagina: patch['pagina'] ?? null },
      queryParamsHandling: 'merge',
    });
  }

  setMaterial(material: Material | null) {
    this.navigate({ material });
  }

  setCategory(slug: string | null) {
    // categoria vive como query param aqui para no saltar entre rutas al filtrar
    this.router.navigate(['/catalogo'], {
      queryParams: {
        categoria: slug,
        material: this.params().material ?? null,
        orden: this.params().sort === 'destacados' ? null : this.params().sort,
      },
    });
  }

  setSort(value: string) {
    this.navigate({ orden: value === 'destacados' ? null : value });
  }

  goToPage(page: number) {
    this.navigate({ pagina: page <= 1 ? null : page });
  }

  isCategoryActive(slug: string): boolean {
    return this.params().category === slug;
  }

  constructor() {
    effect(() => {
      const cat = this.activeCategory();
      const f = this.params();
      const mat = f.material ? (f.material === 'tejido' ? ' tejidos' : ' en madera') : '';
      const title = cat ? `${cat.name}${cat.material ? '' : mat}` : f.q ? `Búsqueda: ${f.q}` : 'Catálogo';
      const total = this.response()?.total ?? 0;
      this.seo.setPage({
        title,
        description: cat?.description
          ? cat.description
          : `Catálogo de muebles de Artemadero${cat ? ' — ' + cat.name : ''}. ${total} referencias, hechas a la medida en Cali.`,
        // canonical sin query de paginación ni búsqueda
        path: cat ? `/catalogo?categoria=${cat.slug}${f.material ? '&material=' + f.material : ''}` : '/catalogo',
        type: 'website',
        noindex: Boolean(f.q) || (this.response()?.total ?? 0) === 0,
      });
    });
  }
}
