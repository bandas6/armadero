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
        <h1 class="text-2xl">No encontramos esta cotización</h1>
        <p class="mt-2" style="color: var(--texto-suave);">
          Revisa el código o escríbenos por WhatsApp con los muebles que te interesan.
        </p>
        <a routerLink="/catalogo" class="mt-4 inline-block underline" style="color: var(--verde-guadua);">Ver el catálogo</a>
      </section>
    } @else if (s.quote; as quote) {
      <section class="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <p class="font-mono-precio text-xs uppercase tracking-wide" style="color: var(--texto-suave);">
          Cotización #{{ quote.code }}
        </p>
        <h1 class="mt-1 text-2xl sm:text-3xl">Hola, {{ quote.customerName }}</h1>
        <p class="mt-2" style="color: color-mix(in srgb, var(--grafito) 80%, transparent);">
          Esta es tu selección. Te responderemos por WhatsApp en el horario de atención.
        </p>

        <ul class="mt-6 divide-y" style="border-color: color-mix(in srgb, var(--musgo) 30%, transparent);">
          @for (item of quote.items; track item.sku) {
            <li class="flex gap-4 py-4">
              <div class="h-16 w-16 shrink-0 overflow-hidden rounded-sm border" style="border-color: color-mix(in srgb, var(--musgo) 40%, transparent);">
                @if (item.imageUrl) {
                  <img [src]="item.imageUrl" [alt]="item.productName" class="h-full w-full object-cover" width="64" height="64" />
                }
              </div>
              <div class="flex-1">
                <p class="font-medium">{{ item.productName }}</p>
                <p class="text-sm" style="color: var(--texto-suave);">{{ item.variantName }} · Cantidad: {{ item.quantity }}</p>
                @if (item.customization?.length) {
                  <ul class="mt-1 text-xs" style="color: var(--texto-suave);">
                    @for (a of item.customization; track a.label) {
                      <li>{{ a.label }}: <span style="color: var(--grafito);">{{ a.value }}</span></li>
                    }
                  </ul>
                }
              </div>
              <p class="font-mono-precio text-sm" style="color: var(--ocre-cana);">
                {{ item.unitPrice != null ? (item.unitPrice | copCurrency) : 'Según medidas' }}
              </p>
            </li>
          }
        </ul>

        <div class="mt-4 flex justify-between rounded-sm border p-4 font-mono-precio" style="border-color: color-mix(in srgb, var(--musgo) 40%, transparent);">
          <span>Total estimado</span>
          <span>{{ quote.total | copCurrency }}</span>
        </div>
        @if (quote.hasCustomItems) {
          <p class="mt-2 text-xs" style="color: var(--texto-suave);">
            Algunos muebles se cotizan según medidas. El valor final y el flete se acuerdan por WhatsApp.
          </p>
        }
      </section>
    } @else {
      <div class="mx-auto max-w-2xl px-4 py-16 text-center" style="color: var(--texto-suave);">Cargando…</div>
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
