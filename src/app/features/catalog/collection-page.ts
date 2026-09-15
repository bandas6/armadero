import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { of, catchError, map, switchMap } from 'rxjs';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { ProductCard } from './product-card';
import type { CollectionDetail } from '../../core/models/catalog.model';

type State =
  | { status: 'loading' }
  | { status: 'ready'; collection: CollectionDetail }
  | { status: 'missing' };

/**
 * Un ambiente: la selección de muebles que Vanessa armó en el panel, con su foto y su
 * texto. Las tarjetas son las mismas del catálogo, en el orden que ella les dio.
 */
@Component({
  selector: 'app-collection-page',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, ProductCard],
  template: `
    @switch (state().status) {
      @case ('loading') {
        <section class="mx-auto max-w-[1360px] px-5 pt-15">
          <p style="color: var(--gris);">Cargando…</p>
        </section>
      }
      @case ('missing') {
        <section class="mx-auto max-w-[1360px] px-5 pt-15">
          <h1 class="font-display m-0 leading-none" style="font-size: clamp(34px, 5vw, 56px);">
            No encontramos esta colección
          </h1>
          <p class="mt-3 text-[17px]" style="color: var(--tinta-suave);">
            Puede que ya no esté publicada.
            <a routerLink="/catalogo">Mira todo el catálogo</a>.
          </p>
        </section>
      }
      @case ('ready') {
        @let c = collection();
        <section class="mx-auto max-w-[1360px] px-5 pt-15 mb-12">
          <nav aria-label="Migas de pan" class="mb-4 text-[14px]" style="color: var(--gris);">
            <a routerLink="/" style="color: var(--gris);">Inicio</a> ·
            <a routerLink="/catalogo" style="color: var(--gris);">Catálogo</a> ·
            <span>{{ c!.name }}</span>
          </nav>

          <div class="mb-8 grid items-center gap-6" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
            <div>
              <h1 class="font-display m-0 mb-2 leading-none" style="font-size: clamp(34px, 5vw, 56px);">
                {{ c!.name }}
              </h1>
              @if (c!.description) {
                <p class="m-0 max-w-[56ch] text-[17px] leading-relaxed" style="color: var(--tinta-suave);">
                  {{ c!.description }}
                </p>
              }
              <p class="mt-3 text-[15px]" style="color: var(--gris);">
                {{ c!.products.length }} {{ c!.products.length === 1 ? 'mueble' : 'muebles' }} ·
                Medidas en cm, ancho × alto × profundidad
              </p>
            </div>
            @if (c!.imageUrl) {
              <div class="rounded-pieza relative aspect-[4/3] w-full overflow-hidden" style="border: 1px solid var(--linea);">
                <img [ngSrc]="c!.imageUrl" [alt]="c!.name" fill priority sizes="(max-width: 640px) 100vw, 50vw" class="object-cover" />
              </div>
            }
          </div>

          @if (c!.products.length) {
            <div class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
              @for (product of c!.products; track product._id) {
                <app-product-card [product]="product" [dense]="true" [priority]="$index < 4" />
              }
            </div>
          } @else {
            <p style="color: var(--gris);">
              Esta colección todavía no tiene muebles publicados.
              <a routerLink="/catalogo">Mira todo el catálogo</a>.
            </p>
          }
        </section>
      }
    }
  `,
})
export class CollectionPage {
  private route = inject(ActivatedRoute);
  private catalog = inject(CatalogService);
  private seo = inject(SeoService);

  readonly state = toSignal(
    this.route.paramMap.pipe(
      map((p) => p.get('slug') ?? ''),
      switchMap((slug) =>
        this.catalog.getCollection(slug).pipe(
          map((collection): State => ({ status: 'ready', collection })),
          catchError(() => of<State>({ status: 'missing' })),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as State },
  );

  readonly collection = () => {
    const s = this.state();
    return s.status === 'ready' ? s.collection : null;
  };

  constructor() {
    effect(() => {
      const s = this.state();
      if (s.status === 'ready') {
        this.seo.setPage({
          title: s.collection.name,
          description:
            s.collection.description ??
            `${s.collection.name}: muebles tejidos y de madera de Artemadero, en Cali.`,
          path: `/coleccion/${s.collection.slug}`,
          image: s.collection.imageUrl ?? undefined,
        });
      } else if (s.status === 'missing') {
        this.seo.setPage({ title: 'Colección no encontrada', path: '/catalogo', noindex: true });
      }
    });
  }
}
