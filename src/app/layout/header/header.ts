import { Component, DestroyRef, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, catchError, filter } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { WHATSAPP_GENERIC_URL } from '../../core/business';
import type { CategoryNode, SiteSettings } from '../../core/models/catalog.model';

/**
 * Encabezado del sitio publico. Oscuro sobre --tinta, con el logotipo dorado, igual que
 * el pie: el dorado no alcanza contraste AA sobre el hueso, pero sobre la tinta si, y
 * asi el hero arranca del mismo negro sin costura. Ver el mockup aprobado,
 * design/direccion-03-tejido-o-madera/index.html.
 *
 * Sin menu hamburguesa a proposito: son dos enlaces y dos acciones, y con flex-wrap
 * caben en dos filas hasta en 360 px sin esconder nada detras de un boton.
 *
 * El panel de categorias bajo "Catalogo" repite el corte tejido | madera del resto del
 * sitio y sale del arbol real de categorias: si Vanessa crea u oculta una, el menu cambia
 * solo. Se abre con clic/tap (no hover: la mayoria del trafico es celular) y los enlaces
 * son <a href> de verdad, para que Google los siga desde cualquier pagina.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    @let s = settings();
    @let announcement = s?.announcement;
    @if (announcement) {
      <p class="px-5 py-2 text-center text-sm" style="background: var(--hoja); color: #fff;">
        {{ announcement }}
      </p>
    }

    <header
      class="sticky top-0 z-40 border-b"
      style="background: var(--tinta); border-color: var(--linea-oscura-tenue);"
    >
      <div class="mx-auto flex max-w-[1360px] flex-wrap items-center gap-x-5 gap-y-3 px-5 py-3">
        <a routerLink="/" class="flex shrink-0 items-center" aria-label="Artemadero, ir al inicio">
          <img
            src="/marca/logotipo.svg"
            alt="Artemadero"
            width="182"
            height="32"
            class="block h-8 w-auto"
          />
        </a>

        <nav class="flex items-center gap-[18px] text-[15px]" aria-label="Navegación principal">
          <a
            routerLink="/"
            routerLinkActive="font-semibold"
            [routerLinkActiveOptions]="{ exact: true }"
            class="no-underline"
            style="color: var(--sobre-oscuro);"
            >Inicio</a
          >
          <span class="inline-flex items-center gap-1">
            <a
              routerLink="/catalogo"
              routerLinkActive="font-semibold"
              class="no-underline"
              style="color: var(--sobre-oscuro);"
              >Catálogo</a
            >
            @if (hasCategories()) {
              <button
                type="button"
                (click)="toggle()"
                [attr.aria-expanded]="open()"
                aria-controls="menu-categorias"
                aria-label="Ver categorías"
                class="inline-flex h-11 w-8 cursor-pointer items-center justify-center"
                style="color: var(--sobre-oscuro);"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                  [style.transform]="open() ? 'rotate(180deg)' : 'none'"
                  style="transition: transform 0.15s;"
                >
                  <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" />
                </svg>
              </button>
            }
          </span>
        </nav>

        <div class="ml-auto flex items-center gap-2">
          <a
            routerLink="/carrito"
            class="rounded-control inline-flex min-h-11 items-center border px-3 text-[15px] no-underline"
            style="border-color: var(--linea-oscura); color: var(--sobre-oscuro);"
          >
            Mi cotización
            @if (cart.count() > 0) {
              <span
                class="rounded-pastilla ml-2 inline-flex h-6 min-w-6 items-center justify-center px-1 text-[13px] font-semibold"
                style="background: var(--sobre-oscuro); color: var(--tinta);"
                >{{ cart.count() }}</span
              >
            }
          </a>
          <a
            [href]="s?.whatsappContactUrl || whatsappUrl"
            class="rounded-control inline-flex min-h-11 items-center px-[17px] py-[11px] text-[15px] font-semibold no-underline"
            style="background: var(--hoja); color: #fff;"
            >Cotizar por WhatsApp</a
          >
        </div>
      </div>

      <!--
        Panel de categorías. Va dentro del header (sticky) para que el foco y el clic afuera
        se resuelvan aquí. Tres columnas que se apilan en móvil: tejido, madera y las líneas
        que no se parten por material.
      -->
      @if (open()) {
        <div
          id="menu-categorias"
          class="border-t"
          style="background: var(--tinta); border-color: var(--linea-oscura-tenue); color: var(--sobre-oscuro);"
        >
          <div
            class="mx-auto grid max-w-[1360px] gap-x-8 gap-y-6 px-5 py-6"
            style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));"
          >
            @for (col of columns(); track col.key) {
              <div>
                <!-- El color del material va en el cuadrito: el azul de madera no contrasta sobre tinta. -->
                <p
                  class="m-0 mb-3 text-[12px] font-semibold tracking-[0.12em] uppercase"
                  style="color: var(--sobre-oscuro-2);"
                >
                  <span
                    class="mr-2 inline-block h-2.5 w-2.5 align-middle"
                    [style.background]="col.color"
                    aria-hidden="true"
                  ></span
                  >{{ col.label }}
                </p>
                <ul class="m-0 list-none p-0">
                  @for (c of col.items; track c._id) {
                    <li>
                      <a
                        [routerLink]="['/categoria', c.slug]"
                        class="flex min-h-10 items-center justify-between gap-3 no-underline"
                        style="color: var(--sobre-oscuro);"
                      >
                        <span>{{ c.name }}</span>
                        <span class="text-[12px]" style="color: var(--sobre-oscuro-2);">
                          {{ c.productCount > 0 ? c.productCount : 'pronto' }}
                        </span>
                      </a>
                    </li>
                  }
                </ul>
                @if (col.key !== 'otros') {
                  <a
                    [routerLink]="'/catalogo'"
                    [queryParams]="{ material: col.key }"
                    class="mt-2 inline-block text-[14px] font-semibold"
                    style="color: var(--sobre-oscuro);"
                    >Ver todo lo {{ col.key === 'tejido' ? 'tejido' : 'de madera' }} →</a
                  >
                }
              </div>
            }
          </div>
        </div>
      }
    </header>
  `,
})
export class Header {
  readonly cart = inject(CartService);
  private catalog = inject(CatalogService);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);

  readonly whatsappUrl = WHATSAPP_GENERIC_URL;
  readonly open = signal(false);

  readonly settings = toSignal(
    this.catalog.getSettings().pipe(catchError(() => of(null as SiteSettings | null))),
    { initialValue: null as SiteSettings | null },
  );

  private tree = toSignal(
    this.catalog.getCategoryTree().pipe(catchError(() => of([] as CategoryNode[]))),
    { initialValue: [] as CategoryNode[] },
  );

  /** Las hojas del árbol: las que llevan material y a las que se asignan los muebles. */
  private leaves = computed(() => {
    const out: CategoryNode[] = [];
    const walk = (nodes: CategoryNode[] | null | undefined) => {
      // La API puede responder algo que no sea un arreglo; sin esta guarda el recorrido
      // revienta y, en el encabezado, se lleva por delante todas las páginas.
      if (!Array.isArray(nodes)) return;
      for (const n of nodes) {
        if (n.children?.length) walk(n.children);
        else out.push(n);
      }
    };
    walk(this.tree());
    return out;
  });

  readonly hasCategories = computed(() => this.leaves().length > 0);

  /** Tejido | Madera, y aparte lo que atraviesa el corte (camas, nocheros, guadua…). */
  readonly columns = computed(() => {
    const leaves = this.leaves();
    const cols = [
      { key: 'tejido', label: 'Tejido', color: 'var(--tejido)', items: leaves.filter((c) => c.material === 'tejido') },
      { key: 'madera', label: 'Madera', color: 'var(--madera)', items: leaves.filter((c) => c.material === 'madera') },
      { key: 'otros', label: 'También', color: 'var(--sobre-oscuro-2)', items: leaves.filter((c) => !c.material) },
    ];
    return cols.filter((c) => c.items.length > 0);
  });

  constructor() {
    // Al navegar se cierra: el panel es un atajo, no una pantalla.
    this.router.events
      .pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => this.open.set(false));
    inject(DestroyRef).onDestroy(() => this.open.set(false));
  }

  toggle() {
    this.open.update((v) => !v);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
