import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap, catchError, map } from 'rxjs';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { QuoteService, type PublicQuote } from '../../core/services/quote.service';
import { SeoService } from '../../core/services/seo.service';

type State = { quote: PublicQuote | null; notFound: boolean };

@Component({
  selector: 'app-quote-confirmation',
  standalone: true,
  imports: [RouterLink, CopCurrencyPipe],
  template: `
    @let s = state();
    @if (s.notFound) {
      <section class="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 class="font-display text-3xl">No encontramos esta cotización</h1>
        <p class="mt-2" style="color: var(--gris);">
          Revisa el código o escríbenos por WhatsApp con los muebles que te interesan.
        </p>
        <a
          routerLink="/catalogo"
          class="rounded-pieza mt-6 inline-flex min-h-11 items-center px-5 py-3 font-semibold no-underline"
          style="background: var(--hoja); color: #fff;"
          >Ver el catálogo</a
        >
      </section>
    } @else if (s.quote; as quote) {
      <section class="mx-auto max-w-2xl px-5 pt-15 pb-15">
        <p class="text-xs uppercase tracking-wide" style="color: var(--gris);">
          Cotización #{{ quote.code }}
        </p>
        <h1 class="font-display m-0 mt-1 leading-none" style="font-size: clamp(34px, 5vw, 56px);">
          Hola, {{ quote.customerName }}
        </h1>
        <p class="mt-2" style="color: var(--tinta-suave);">
          Esta es tu selección. Te responderemos por WhatsApp en el horario de atención.
        </p>

        <ul class="mt-6 divide-y" style="border-color: var(--linea);">
          @for (item of quote.items; track item.sku) {
            <li class="flex gap-4 py-4">
              <div class="rounded-control h-16 w-16 shrink-0 overflow-hidden" style="border: 1px solid var(--linea);">
                @if (item.imageUrl) {
                  <img [src]="item.imageUrl" [alt]="item.productName" class="h-full w-full object-cover" width="64" height="64" />
                }
              </div>
              <div class="flex-1">
                <p class="font-medium">{{ item.productName }}</p>
                <p class="text-sm" style="color: var(--gris);">{{ item.variantName }} · Cantidad: {{ item.quantity }}</p>
                @if (item.customization?.length) {
                  <ul class="mt-1 text-xs" style="color: var(--gris);">
                    @for (a of item.customization; track a.label) {
                      <li>{{ a.label }}: <span style="color: var(--tinta);">{{ a.value }}</span></li>
                    }
                  </ul>
                }
              </div>
              <p
                class="text-sm font-semibold"
                [style.color]="item.unitPrice != null ? 'var(--tinta)' : 'var(--hoja)'"
              >
                {{ item.unitPrice != null ? (item.unitPrice | copCurrency) : 'Precio según medidas' }}
              </p>
            </li>
          }
        </ul>

        <div class="rounded-bloque mt-4 p-5" style="border: 1.5px solid var(--tinta);">
          <div class="flex items-baseline justify-between gap-4">
            <span class="text-[15px]">Subtotal estimado</span>
            <strong class="font-display text-[28px] leading-none font-normal">
              {{ quote.total | copCurrency }}
            </strong>
          </div>
          @if (quote.hasCustomItems) {
            <p class="mt-2 text-[15px] font-semibold" style="color: var(--hoja);">
              Hay muebles que se cotizan según medidas, aparte.
            </p>
          }
          <p class="mt-1 text-[14px]" style="color: var(--gris);">
            Es un valor estimado. El valor final y el flete se acuerdan por WhatsApp.
          </p>
        </div>
      </section>
    } @else {
      <div class="mx-auto max-w-2xl px-4 py-16 text-center" style="color: var(--gris);">Cargando…</div>
    }
  `,
})
export class QuoteConfirmation {
  private route = inject(ActivatedRoute);
  private quoteService = inject(QuoteService);

  constructor() {
    inject(SeoService).setPage({
      title: 'Tu cotización',
      description: 'Detalle de tu cotización en Artemadero.',
      path: '/',
      noindex: true,
    });
  }

  readonly state = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) =>
        this.quoteService.getByCode(params.get('code')!).pipe(
          map((quote): State => ({ quote, notFound: false })),
          catchError(() => of<State>({ quote: null, notFound: true })),
        ),
      ),
    ),
    { initialValue: { quote: null, notFound: false } as State },
  );

  readonly hasItems = computed(() => (this.state().quote?.items.length ?? 0) > 0);
}
