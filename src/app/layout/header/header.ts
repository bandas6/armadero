import {
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, catchError, filter } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import type { SiteSettings } from '../../core/models/catalog.model';

interface NavItem {
  label: string;
  path: string;
  fragment?: string;
}

const NAV: NavItem[] = [
  { label: 'Categorías', path: '/', fragment: 'categorias' },
  { label: 'Catálogo', path: '/catalogo' },
  { label: 'Nuestro taller', path: '/', fragment: 'taller' },
  { label: 'Preguntas', path: '/', fragment: 'preguntas' },
];

// Secciones del home que el scroll-spy vigila, en orden de aparición.
const SPY_SECTIONS = ['categorias', 'taller', 'preguntas'];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    @let announcement = settings()?.announcement;
    @if (announcement) {
      <p class="px-4 py-2 text-center text-sm" style="background: var(--verde-guadua); color: var(--blanco-taller);">
        {{ announcement }}
      </p>
    }
    <header class="sticky top-0 z-40 border-b backdrop-blur" style="border-color: color-mix(in srgb, var(--musgo) 40%, transparent); background: color-mix(in srgb, var(--lino) 95%, transparent);">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <a routerLink="/" class="text-lg font-semibold tracking-wide" style="color: var(--grafito);">ARTEMADERO</a>

        <nav class="hidden gap-6 text-sm md:flex" aria-label="Navegación principal">
          @for (item of nav; track item.label) {
            <a
              [routerLink]="item.path"
              [fragment]="item.fragment"
              [routerLinkActive]="item.fragment ? '' : 'font-semibold'"
              [routerLinkActiveOptions]="{ exact: !item.fragment }"
              [class.font-semibold]="isSectionActive(item)"
              [attr.aria-current]="isSectionActive(item) ? 'true' : null"
              class="hover:opacity-70"
            >{{ item.label }}</a>
          }
        </nav>

        <div class="flex items-center gap-2">
          <a routerLink="/carrito" class="relative rounded-sm border px-3 py-1.5 text-sm font-medium" style="border-color: var(--verde-guadua); color: var(--verde-guadua);">
            Cotización
            @if (cart.count() > 0) {
              <span class="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs" style="background: var(--verde-guadua); color: var(--blanco-taller);">
                {{ cart.count() }}
              </span>
            }
          </a>
          <button
            type="button"
            class="rounded-sm border p-2 md:hidden"
            style="border-color: var(--verde-guadua); color: var(--verde-guadua);"
            [attr.aria-expanded]="open()"
            aria-label="Menú"
            aria-controls="menu-movil"
            (click)="open.set(!open())"
          >
            @if (open()) { ✕ } @else { ☰ }
          </button>
        </div>
      </div>

      @if (open()) {
        <nav id="menu-movil" class="border-t md:hidden" style="border-color: color-mix(in srgb, var(--musgo) 40%, transparent); background: var(--blanco-taller);" aria-label="Navegación principal">
          <ul class="mx-auto max-w-6xl divide-y px-4" style="border-color: color-mix(in srgb, var(--musgo) 25%, transparent);">
            @for (item of nav; track item.label) {
              <li>
                <a
                  [routerLink]="item.path"
                  [fragment]="item.fragment"
                  [routerLinkActive]="item.fragment ? '' : 'font-semibold'"
                  [routerLinkActiveOptions]="{ exact: !item.fragment }"
                  [class.font-semibold]="isSectionActive(item)"
                  [attr.aria-current]="isSectionActive(item) ? 'true' : null"
                  class="block py-3"
                >{{ item.label }}</a>
              </li>
            }
          </ul>
        </nav>
      }
    </header>
  `,
})
export class Header {
  readonly cart = inject(CartService);
  private catalog = inject(CatalogService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly nav = NAV;
  readonly open = signal(false);

  // Sección del home visible ahora mismo (la que el scroll-spy resalta en el menú).
  // '' = ninguna (p. ej. en el hero, o fuera del home).
  private readonly activeSection = signal('');

  readonly settings = toSignal(
    this.catalog.getSettings().pipe(catchError(() => of(null as SiteSettings | null))),
    { initialValue: null as SiteSettings | null },
  );

  constructor() {
    // Cierra el menú móvil al navegar.
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.open.set(false));

    // El scroll-spy solo tiene sentido en el navegador y sobre el home, donde
    // existen las secciones con id. afterNextRender no corre en SSR.
    afterNextRender(() => this.setupScrollSpy());
  }

  /** True si el ítem de menú corresponde a la sección del home visible ahora. */
  isSectionActive(item: NavItem): boolean {
    return !!item.fragment && this.activeSection() === item.fragment;
  }

  private setupScrollSpy(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    let observer: IntersectionObserver | null = null;
    // Visibilidad por sección; en cada cambio elegimos la primera visible en
    // orden de documento para que el resaltado no salte hacia atrás.
    const visible = new Map<string, boolean>();

    const disconnect = () => {
      observer?.disconnect();
      observer = null;
      visible.clear();
      this.activeSection.set('');
    };

    const observeHomeSections = () => {
      disconnect();
      if (this.router.url.split(/[?#]/)[0] !== '/') return;

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            visible.set(entry.target.id, entry.isIntersecting);
          }
          const current = SPY_SECTIONS.find((id) => visible.get(id)) ?? '';
          this.activeSection.set(current);
        },
        // Banda de detección: por debajo del header sticky (~96px) y sin contar
        // el 45% inferior de la pantalla, para que solo una sección quede activa.
        { rootMargin: '-96px 0px -45% 0px' },
      );

      for (const id of SPY_SECTIONS) {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      }
    };

    observeHomeSections();
    const sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(observeHomeSections);

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
      disconnect();
    });
  }
}
