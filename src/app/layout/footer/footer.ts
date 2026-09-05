import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { of, catchError } from 'rxjs';
import { CatalogService } from '../../core/services/catalog.service';
import type { SiteSettings } from '../../core/models/catalog.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    @let s = settings();
    <footer class="mt-16 border-t" style="border-color: color-mix(in srgb, var(--musgo) 40%, transparent); background: var(--blanco-taller);">
      <div class="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-3" style="color: var(--texto-suave);">
        <div>
          <p class="text-base font-semibold" style="color: var(--grafito);">ARTEMADERO</p>
          <p class="mt-2">Muebles campestres y tejidos, fabricados a la medida en Cali.</p>
        </div>

        <nav aria-label="Navegación del sitio">
          <p class="font-medium" style="color: var(--grafito);">El sitio</p>
          <ul class="mt-2 space-y-1">
            <li><a routerLink="/catalogo" class="hover:underline">Catálogo</a></li>
            <li><a routerLink="/" fragment="categorias" class="hover:underline">Categorías</a></li>
            <li><a routerLink="/" fragment="taller" class="hover:underline">Nuestro taller</a></li>
            <li><a routerLink="/" fragment="preguntas" class="hover:underline">Preguntas frecuentes</a></li>
          </ul>
        </nav>

        <div>
          <p class="font-medium" style="color: var(--grafito);">Contacto</p>
          <p class="mt-2">Cali, Valle del Cauca</p>
          <p class="mt-1">{{ s?.businessHours || 'Lunes a viernes 8:30 a. m. – 5:30 p. m. · Sábado 7:30 a. m. – 3:00 p. m.' }}</p>
          @if (s?.whatsappContactUrl) {
            <p class="mt-2"><a [href]="s!.whatsappContactUrl" class="underline">Escríbenos por WhatsApp</a></p>
          }
          <p class="mt-2 flex gap-4">
            @if (s?.instagramUrl) { <a [href]="s!.instagramUrl" class="underline">Instagram</a> }
            @if (s?.facebookUrl) { <a [href]="s!.facebookUrl" class="underline">Facebook</a> }
          </p>
        </div>
      </div>
      <p class="mx-auto max-w-6xl border-t px-4 py-4 text-xs" style="border-color: color-mix(in srgb, var(--musgo) 25%, transparent); color: var(--texto-suave);">
        Precios de referencia, sujetos a confirmación por WhatsApp. El flete se acuerda en la conversación.
      </p>
    </footer>
  `,
})
export class Footer {
  private catalog = inject(CatalogService);

  readonly settings = toSignal(
    this.catalog.getSettings().pipe(catchError(() => of(null as SiteSettings | null))),
    { initialValue: null as SiteSettings | null },
  );
}
