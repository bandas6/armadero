import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, catchError } from 'rxjs';
import { CatalogService } from '../core/services/catalog.service';
import { CopCurrencyPipe } from './pipes/cop-currency.pipe';
import type { ShippingZone } from '../core/models/catalog.model';

/**
 * La nota del flete debajo del precio (ficha) y del total (carrito). Si el panel tiene
 * zonas de envío, las lista como "desde"; si no, solo dice que se acuerda por WhatsApp.
 * En ningún caso es un precio en firme: el valor final se confirma en la conversación.
 */
@Component({
  selector: 'app-shipping-note',
  standalone: true,
  imports: [CopCurrencyPipe],
  template: `
    @if (zones().length) {
      <p class="m-0 text-[15px]" style="color: var(--tinta-suave);">
        Flete aproximado:
        @for (z of shown(); track z._id; let last = $last) {
          {{ z.city }} desde {{ z.cost | copCurrency }}{{ last ? '' : ' · ' }}
        }
        @if (zones().length > shown().length) {
          · y {{ zones().length - shown().length }} ciudades más
        }
        <br />
        Se confirma por WhatsApp, según el tamaño del mueble.
      </p>
    } @else {
      <p class="m-0 text-[15px]" style="color: var(--tinta-suave);">
        El flete se acuerda por WhatsApp, según la ciudad y el tamaño.
      </p>
    }
  `,
})
export class ShippingNote {
  private catalog = inject(CatalogService);

  readonly zones = toSignal(
    this.catalog.getShippingZones().pipe(catchError(() => of([] as ShippingZone[]))),
    { initialValue: [] as ShippingZone[] },
  );

  /** Las primeras, para que la nota siga siendo una nota y no una tabla. */
  readonly shown = computed(() => this.zones().slice(0, 4));
}
