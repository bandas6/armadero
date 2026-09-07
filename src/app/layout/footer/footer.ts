import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, catchError } from 'rxjs';
import { CatalogService } from '../../core/services/catalog.service';
import {
  BUSINESS_HOURS_SATURDAY,
  BUSINESS_HOURS_WEEKDAY,
  CITY,
  STORE_ADDRESS,
  STORE_ADDRESS_FALLBACK,
  WHATSAPP_DISPLAY,
  WHATSAPP_GENERIC_URL,
} from '../../core/business';
import type { SiteSettings } from '../../core/models/catalog.model';

/**
 * Pie oscuro con el logotipo dorado y la trenza del aviso. El contraste manda: el dorado
 * no llega a AA sobre --hueso, asi que el encabezado va claro con el logotipo en tinta y
 * el pie va en --tinta con el dorado. Ver design/PROMPT-1-arranque.md.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    @let s = settings();
    <footer style="background: var(--tinta);">
      <div
        class="mx-auto grid max-w-[1360px] gap-[26px] px-5 py-10 text-[15px]"
        style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); color: var(--pie-texto);"
      >
        <div>
          <img
            src="/marca/logotipo.svg"
            alt="Artemadero"
            width="250"
            height="44"
            class="marca-sombra mb-2.5 block h-auto w-full max-w-[250px]"
          />
          <div class="trenza-repetida mb-3.5 w-full max-w-[250px]" aria-hidden="true"></div>
          <p class="m-0 leading-relaxed">
            Muebles tejidos y de madera, hechos a la medida. Para el hogar, la finca o el
            negocio. {{ city }}.
          </p>
        </div>

        <div>
          <p class="mb-2 font-semibold" style="color: var(--hueso);">Horario de atención</p>
          <p class="m-0 leading-[1.7]">
            {{ weekday }}<br />
            {{ saturday }}
          </p>
        </div>

        <div>
          <p class="mb-2 font-semibold" style="color: var(--hueso);">Escríbenos</p>
          <p class="mb-2.5 leading-relaxed">{{ phone }}</p>
          <a
            [href]="s?.whatsappContactUrl || whatsappUrl"
            class="inline-flex min-h-11 items-center px-4 py-[11px] font-semibold no-underline"
            style="background: var(--hoja); color: #fff;"
            >Cotizar por WhatsApp</a
          >
          <p class="mt-3 flex flex-wrap gap-4">
            <!-- PENDIENTE: sin cuentas confirmadas, los enlaces sociales caen a WhatsApp. -->
            <a [href]="s?.instagramUrl || whatsappUrl" style="color: var(--hueso);">Instagram</a>
            <a [href]="s?.facebookUrl || whatsappUrl" style="color: var(--hueso);">Facebook</a>
          </p>
        </div>

        <div>
          <p class="mb-2 font-semibold" style="color: var(--hueso);">El local</p>
          <!-- PENDIENTE: falta la dirección del local (docs/pendientes-diseno.md). -->
          <p class="m-0 leading-[1.7]">
            {{ address }}<br />
            {{ city }}
          </p>
        </div>
      </div>

      <div style="border-top: 1px solid var(--pie-linea);">
        <p
          class="mx-auto max-w-[1360px] px-5 py-3.5 text-[13px]"
          style="color: var(--pie-tenue);"
        >
          Los precios son un valor estimado y se confirman por WhatsApp. El flete se acuerda
          en la conversación, según la ciudad y el tamaño del mueble.
        </p>
      </div>
    </footer>
  `,
})
export class Footer {
  private catalog = inject(CatalogService);

  readonly whatsappUrl = WHATSAPP_GENERIC_URL;
  readonly phone = WHATSAPP_DISPLAY;
  readonly city = CITY;
  readonly address = STORE_ADDRESS ?? STORE_ADDRESS_FALLBACK;
  readonly weekday = BUSINESS_HOURS_WEEKDAY;
  readonly saturday = BUSINESS_HOURS_SATURDAY;

  readonly settings = toSignal(
    this.catalog.getSettings().pipe(catchError(() => of(null as SiteSettings | null))),
    { initialValue: null as SiteSettings | null },
  );
}
