import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, catchError } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { WHATSAPP_GENERIC_URL } from '../../core/business';
import type { SiteSettings } from '../../core/models/catalog.model';

/**
 * Encabezado del sitio publico. Oscuro sobre --tinta, con el logotipo dorado, igual que
 * el pie: el dorado no alcanza contraste AA sobre el hueso, pero sobre la tinta si, y
 * asi el hero arranca del mismo negro sin costura. Ver el mockup aprobado,
 * design/direccion-03-tejido-o-madera/index.html.
 *
 * Sin menu hamburguesa a proposito: son dos enlaces y dos acciones, y con flex-wrap
 * caben en dos filas hasta en 360 px sin esconder nada detras de un boton.
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

        <nav class="flex gap-[18px] text-[15px]" aria-label="Navegación principal">
          <a
            routerLink="/"
            routerLinkActive="font-semibold"
            [routerLinkActiveOptions]="{ exact: true }"
            class="no-underline"
            style="color: var(--sobre-oscuro);"
            >Inicio</a
          >
          <a
            routerLink="/catalogo"
            routerLinkActive="font-semibold"
            class="no-underline"
            style="color: var(--sobre-oscuro);"
            >Catálogo</a
          >
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
    </header>
  `,
})
export class Header {
  readonly cart = inject(CartService);
  private catalog = inject(CatalogService);

  readonly whatsappUrl = WHATSAPP_GENERIC_URL;

  readonly settings = toSignal(
    this.catalog.getSettings().pipe(catchError(() => of(null as SiteSettings | null))),
    { initialValue: null as SiteSettings | null },
  );
}
