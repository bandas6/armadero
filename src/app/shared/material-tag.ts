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
        class="rounded-pastilla inline-block text-[11px] tracking-[0.1em]"
        [style.background]="background()"
        [style.padding]="grande() ? '4px 11px' : '3px 9px'"
        style="color: #fff;"
        >{{ label() }}</span
      >
    }
  `,
})
export class MaterialTag {
  material = input<Material | 'ambos' | null | undefined>();
  /** En la ficha la etiqueta va un punto mas grande que en las tarjetas. */
  grande = input(false);

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
