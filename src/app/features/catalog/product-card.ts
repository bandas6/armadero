import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import type { ProductCard as ProductCardModel } from '../../core/models/catalog.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, CopCurrencyPipe],
  template: `
    @let p = product();
    <article
      class="flex flex-col overflow-hidden rounded-sm border bg-[var(--blanco-taller)]"
      style="border-color: color-mix(in srgb, var(--musgo) 40%, transparent);"
    >
      <a [routerLink]="['/producto', p.slug]" class="relative block aspect-[4/3] overflow-hidden">
        @if (p.primaryImageUrl) {
          <img
            [ngSrc]="p.primaryImageUrl"
            [alt]="p.name"
            fill
            [priority]="priority()"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            class="object-cover"
          />
        } @else {
          <span class="flex h-full w-full items-center justify-center text-sm" style="color: var(--texto-suave);">
            Foto pronto
          </span>
        }
      </a>
      <div class="flex flex-1 flex-col p-4">
        <p class="font-mono-precio text-xs uppercase tracking-wide" style="color: var(--texto-suave);">
          {{ p.category.name }}
        </p>
        <h3 class="mt-1 text-lg">
          <a [routerLink]="['/producto', p.slug]" class="hover:underline">{{ p.name }}</a>
        </h3>
        @if (p.shortDescription) {
          <p class="mt-1 text-sm" style="color: color-mix(in srgb, var(--grafito) 80%, transparent);">
            {{ p.shortDescription }}
          </p>
        }
        <div class="mt-3 font-mono-precio">
          @if (p.hasPrice) {
            <p style="color: var(--ocre-cana);">
              @if (p.priceTo && p.priceTo !== p.priceFrom) { Desde }{{ p.priceFrom | copCurrency }}
            </p>
          } @else {
            <p style="color: var(--ocre-cana);">Precio según medidas</p>
            <p class="text-xs" style="color: var(--texto-suave);">Se fabrica a la medida</p>
          }
        </div>
      </div>
    </article>
  `,
})
export class ProductCard {
  product = input.required<ProductCardModel>();
  priority = input(false);
}
