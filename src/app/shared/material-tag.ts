import { Component, computed, input } from '@angular/core';
import type { Material } from '../core/models/catalog.model';

/**
 * La etiqueta de material. Naranja es tejido y azul es madera, siempre, en toda la
 * aplicacion: es un codigo funcional, no un adorno (design/IMPLEMENTACION.md).
 *
 * Las categorias que no se parten por material —Camas, Nocheros, Mesas de centro,
 * Guadua— no llevan etiqueta: se omite en vez de inventarle un material al mueble.
 * "Las dos" (en --hoja) es para lo que existe en ambos, como el pilar "A la medida".
 */
@Component({
  selector: 'app-material-tag',
  standalone: true,
  template: `
    @if (label()) {
      <span
        class="inline-block px-[7px] py-[2px] text-[11px] tracking-[0.1em]"
        [style.background]="background()"
        style="color: #fff;"
        >{{ label() }}</span
      >
    }
  `,
})
export class MaterialTag {
  material = input<Material | 'ambos' | null | undefined>();

  readonly label = computed(() => {
    switch (this.material()) {
      case 'tejido':
        return 'TEJIDO';
      case 'madera':
        return 'MADERA';
      case 'ambos':
        return 'LAS DOS';
      default:
        return null;
    }
  });

  readonly background = computed(() => {
    switch (this.material()) {
      case 'tejido':
        return 'var(--tejido)';
      case 'madera':
        return 'var(--madera)';
      default:
        return 'var(--hoja)';
    }
  });
}
