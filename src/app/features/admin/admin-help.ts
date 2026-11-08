import { Component, input } from '@angular/core';

/**
 * Ayuda en el lugar: un "¿Qué es esto?" que despliega dos o tres líneas justo donde nace la
 * duda. No es una ventana emergente: en el celular, desde el taller, un modal tapa el
 * formulario y se cierra sin leerlo. Usa <details>, así que funciona con teclado y lector
 * de pantalla sin código extra.
 *
 *   <app-admin-help>La subcategoría decide si sale en Tejido o en Madera…</app-admin-help>
 */
@Component({
  selector: 'app-admin-help',
  standalone: true,
  template: `
    <details class="admin-help">
      <summary>
        <span class="admin-help__icono" aria-hidden="true">?</span>
        {{ label() }}
      </summary>
      <div class="admin-help__cuerpo"><ng-content /></div>
    </details>
  `,
})
export class AdminHelp {
  readonly label = input('¿Qué es esto?');
}
