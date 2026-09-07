import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { MaterialTag } from '../../shared/material-tag';
import { measureCard } from '../../shared/measure-label';
import type { ProductCard as ProductCardModel } from '../../core/models/catalog.model';

/** Las dos escalas de la tarjeta, sacadas del mockup aprobado. */
const SCALE = {
  suelta: { gap: 11, name: 22, note: 14, headline: 19, detail: 13, price: 15, pad: '8px 10px' },
  densa: { gap: 9, name: 20, note: 13, headline: 17, detail: 12, price: 14, pad: '7px 9px' },
} as const;

/**
 * La tarjeta del catalogo, igual en el muestrario del home y en la reticula del catalogo
 * (design/PROMPT-3-catalogo.md): foto cuadrada, etiqueta de material, nombre en Instrument
 * Serif, cedula de medidas con borde, y el precio o "Precio segun medidas".
 *
 * "Precio segun medidas" tiene el mismo tamano y peso que un precio normal, en --hoja: es
 * un caso de primera clase del negocio, no un hueco donde falto el dato.
 *
 * `dense` es la variante del catalogo: los mismos elementos un punto mas pequenos, para
 * que la reticula quede mas apretada.
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, CopCurrencyPipe, MaterialTag],
  template: `
    @let p = product();
    @let m = measures();
    @let s = scale();
    <article class="flex h-full flex-col" [style.gap.px]="s.gap">
      <a
        [routerLink]="['/producto', p.slug]"
        class="relative block aspect-square"
        style="border: 1px solid var(--linea);"
        tabindex="-1"
      >
        @if (p.primaryImageUrl) {
          <img
            [ngSrc]="p.primaryImageUrl"
            [alt]="alt()"
            fill
            [priority]="priority()"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 260px"
            class="object-cover"
          />
        } @else {
          <span
            class="absolute inset-0 flex items-center justify-center text-sm"
            style="background: var(--hueso-alt); color: var(--gris);"
            >Foto pronto</span
          >
        }
      </a>

      <div class="flex flex-1 flex-col">
        @if (p.category.material) {
          <app-material-tag [material]="p.category.material" class="mb-[7px] block" />
        }

        <h3 class="font-display leading-tight" [style.font-size.px]="s.name">
          <a [routerLink]="['/producto', p.slug]" class="no-underline" style="color: var(--tinta);">{{
            p.name
          }}</a>
        </h3>

        @if (p.shortDescription) {
          <p class="mt-[3px] leading-snug" [style.font-size.px]="s.note" style="color: var(--gris);">
            {{ p.shortDescription }}
          </p>
        }

        <!-- Cédula de medidas: el dato grande arriba, los centímetros debajo. -->
        <div class="mt-auto" [style.padding]="s.pad" style="border: 1px solid var(--tinta); margin-top: 9px;">
          <p class="m-0 font-semibold leading-tight" [style.font-size.px]="s.headline">
            {{ m.headline }}
          </p>
          @if (m.detail) {
            <p class="mt-0.5" [style.font-size.px]="s.detail" style="color: var(--gris);">
              {{ m.detail }}
            </p>
          }
        </div>

        <p
          class="mt-2 font-semibold"
          [style.font-size.px]="s.price"
          [style.color]="p.hasPrice ? 'var(--tinta)' : 'var(--hoja)'"
        >
          @if (p.hasPrice) {
            @if (p.priceTo && p.priceTo !== p.priceFrom) { Desde }{{ p.priceFrom | copCurrency }}
          } @else {
            Precio según medidas
          }
        </p>
      </div>
    </article>
  `,
})
export class ProductCard {
  product = input.required<ProductCardModel>();
  priority = input(false);
  /** La retícula del catálogo va más apretada que el muestrario del home. */
  dense = input(false);

  readonly scale = computed(() => (this.dense() ? SCALE.densa : SCALE.suelta));

  readonly measures = computed(() =>
    measureCard(this.product().measures, this.product().personalizable),
  );

  /** El alt dice qué mueble es y de qué material, nunca "foto de producto". */
  readonly alt = computed(() => {
    const p = this.product();
    const material =
      p.category.material === 'tejido'
        ? 'tejido'
        : p.category.material === 'madera'
          ? 'en madera'
          : '';
    return [p.name, material, '—', p.category.name].filter(Boolean).join(' ');
  });
}
