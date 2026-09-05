import { Component, computed, effect, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { CustomizationAnswer, CustomizationField } from '../../core/models/product.model';

/**
 * Dibuja los campos de personalización que el admin configuró para un mueble
 * (número con unidad, lista, sí/no, texto) + un "Otros detalles" libre.
 * Lo usan la ficha de producto y el carrito. La pantalla lee `collect()` al enviar.
 */
@Component({
  selector: 'app-customization-fields',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="space-y-3">
      @for (f of fields(); track f.label) {
        <div>
          <label class="block text-sm font-medium">
            {{ f.label }}
            @if (f.required) { <span style="color: var(--ocre-cana);">*</span> }
          </label>

          @switch (f.type) {
            @case ('number') {
              <div class="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  [min]="f.min ?? null"
                  [max]="f.max ?? null"
                  [ngModel]="get(f.label)"
                  (ngModelChange)="set(f.label, $event)"
                  class="w-32 rounded border px-3 py-2"
                  style="border-color: var(--musgo);"
                />
                @if (f.unit) { <span class="text-sm" style="color: var(--texto-suave);">{{ f.unit }}</span> }
              </div>
            }
            @case ('select') {
              <select
                [ngModel]="get(f.label)"
                (ngModelChange)="set(f.label, $event)"
                class="mt-1 w-full rounded border px-3 py-2"
                style="border-color: var(--musgo); background: var(--blanco-taller);"
              >
                <option value="">Elige…</option>
                @for (o of f.options ?? []; track o) { <option [value]="o">{{ o }}</option> }
              </select>
            }
            @case ('boolean') {
              <label class="mt-1 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  class="h-4 w-4"
                  [ngModel]="get(f.label) === 'Sí'"
                  (ngModelChange)="set(f.label, $event ? 'Sí' : '')"
                />
                Sí
              </label>
            }
            @default {
              <input
                type="text"
                [ngModel]="get(f.label)"
                (ngModelChange)="set(f.label, $event)"
                class="mt-1 w-full rounded border px-3 py-2"
                style="border-color: var(--musgo);"
              />
            }
          }

          @if (f.hint) { <p class="mt-1 text-xs" style="color: var(--texto-suave);">{{ f.hint }}</p> }
          @if (touched() && f.required && !get(f.label).trim()) {
            <p class="mt-1 text-xs" style="color: #8c4a34;">Este dato es obligatorio.</p>
          }
        </div>
      }

      <div>
        <label class="block text-sm font-medium">Otros detalles (opcional)</label>
        <textarea
          rows="2"
          [ngModel]="otros()"
          (ngModelChange)="otros.set($event)"
          placeholder="Cualquier otro cambio o pedido especial"
          class="mt-1 w-full rounded border px-3 py-2"
          style="border-color: var(--musgo);"
        ></textarea>
      </div>
    </div>
  `,
})
export class CustomizationFields {
  fields = input<CustomizationField[]>([]);
  initial = input<CustomizationAnswer[]>([]);

  private values = signal<Record<string, string>>({});
  readonly otros = signal('');
  readonly touched = signal(false);

  constructor() {
    effect(() => {
      const src = this.initial();
      const map: Record<string, string> = {};
      for (const a of src) {
        if (a.label === 'Otros detalles') this.otros.set(a.value);
        else map[a.label] = a.value;
      }
      this.values.set(map);
    });
  }

  get(label: string): string {
    return this.values()[label] ?? '';
  }
  set(label: string, v: unknown) {
    this.values.update((m) => ({ ...m, [label]: String(v ?? '') }));
  }

  readonly invalid = computed(() =>
    this.fields().some((f) => f.required && !this.get(f.label).trim()),
  );

  markTouched() {
    this.touched.set(true);
  }

  /** Respuestas a enviar en la cotización. Solo campos con valor. */
  collect(): CustomizationAnswer[] {
    const out: CustomizationAnswer[] = [];
    for (const f of this.fields()) {
      const v = this.get(f.label).trim();
      if (v) out.push({ label: f.label, value: v });
    }
    const o = this.otros().trim();
    if (o) out.push({ label: 'Otros detalles', value: o });
    return out;
  }
}
