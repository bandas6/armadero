import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { AdminContentService } from '../../core/services/admin-content.service';
import type { AdminShippingZone } from '../../core/models/admin.model';
import { UndoService } from './undo.service';
import { apiErrorMessage } from './admin-utils';

interface Draft {
  city: string;
  cost: string;
  estimatedDays: string;
  notes: string;
}

const EMPTY: Draft = { city: '', cost: '', estimatedDays: '', notes: '' };

/**
 * Zonas de envío (solo ADMIN): flete informativo por ciudad. Es una guía para el cliente
 * en la ficha y el carrito; el valor final se sigue acordando por WhatsApp.
 */
@Component({
  selector: 'app-admin-shipping-list',
  standalone: true,
  imports: [FormsModule, CopCurrencyPipe],
  template: `
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl">Envíos</h1>
      <button type="button" (click)="openNew()" class="admin-btn admin-btn--primary">+ Ciudad</button>
    </div>
    <p class="mt-1 text-sm" style="color: var(--gris);">
      Flete aproximado por ciudad. El sitio lo muestra como "desde" y aclara que se confirma
      por WhatsApp. Sin ciudades, el sitio solo dice que el flete se acuerda en el chat.
    </p>

    @if (error()) {
      <p class="mt-3 rounded-sm border px-3 py-2 text-sm" style="border-color: #c98; color: #8c4a34;">{{ error() }}</p>
    }

    @if (editing() !== null) {
      <form class="mt-4 space-y-3 rounded-lg border p-3" style="border-color: var(--linea); background: var(--hueso-alt);" (ngSubmit)="save()">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label for="zc" class="admin-label">Ciudad</label>
            <input id="zc" [(ngModel)]="draft.city" name="city" required maxlength="80" class="admin-input" />
          </div>
          <div>
            <label for="zp" class="admin-label">Flete desde (COP)</label>
            <input id="zp" [(ngModel)]="draft.cost" name="cost" inputmode="numeric" required placeholder="80000" class="admin-input" />
          </div>
          <div>
            <label for="zd" class="admin-label">Días aprox. (opcional)</label>
            <input id="zd" [(ngModel)]="draft.estimatedDays" name="estimatedDays" inputmode="numeric" class="admin-input" />
          </div>
        </div>
        <div>
          <label for="zn" class="admin-label">Nota (opcional)</label>
          <input id="zn" [(ngModel)]="draft.notes" name="notes" maxlength="240" placeholder="Hasta la puerta, sin subir escaleras" class="admin-input" />
        </div>
        <div class="flex gap-2">
          <button type="submit" [disabled]="busy()" class="admin-btn admin-btn--primary">{{ editing() === 'new' ? 'Agregar' : 'Guardar' }}</button>
          <button type="button" (click)="editing.set(null)" class="admin-btn">Cancelar</button>
        </div>
      </form>
    }

    @if (loading()) {
      <p class="mt-6" style="color: var(--gris);">Cargando…</p>
    } @else {
      <ul class="mt-4 space-y-2">
        @for (z of zones(); track z._id) {
          <li class="flex flex-wrap items-center gap-3 rounded-lg border p-3" style="border-color: var(--linea); background: var(--hueso-alt);" [style.opacity]="z.active ? 1 : 0.6">
            <div class="min-w-0 flex-1">
              <p class="font-medium">{{ z.city }}</p>
              <p class="text-sm" style="color: var(--gris);">
                Desde {{ z.cost | copCurrency }}
                @if (z.estimatedDays) { · {{ z.estimatedDays }} {{ z.estimatedDays === 1 ? 'día' : 'días' }} }
                @if (z.notes) { · {{ z.notes }} }
                @if (!z.active) { · Oculta }
              </p>
            </div>
            <div class="flex gap-2">
              <button type="button" (click)="openEdit(z)" class="admin-btn admin-btn--sm">Editar</button>
              <button type="button" (click)="toggle(z)" [disabled]="busy()" class="admin-btn admin-btn--sm">{{ z.active ? 'Ocultar' : 'Mostrar' }}</button>
            </div>
          </li>
        } @empty {
          <li style="color: var(--gris);">Sin ciudades todavía.</li>
        }
      </ul>
    }
  `,
})
export class AdminShippingList {
  private service = inject(AdminContentService);
  private undo = inject(UndoService);

  zones = signal<AdminShippingZone[]>([]);
  loading = signal(true);
  busy = signal(false);
  error = signal<string | null>(null);
  editing = signal<string | null>(null);
  draft: Draft = { ...EMPTY };

  constructor() {
    this.service.listShippingZones().subscribe({
      next: (list) => {
        this.zones.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar las zonas.');
        this.loading.set(false);
      },
    });
  }

  openNew() {
    this.draft = { ...EMPTY };
    this.editing.set('new');
  }

  openEdit(z: AdminShippingZone) {
    this.draft = {
      city: z.city,
      cost: String(z.cost),
      estimatedDays: z.estimatedDays != null ? String(z.estimatedDays) : '',
      notes: z.notes ?? '',
    };
    this.editing.set(z._id);
  }

  private replace(row: AdminShippingZone) {
    this.zones.update((list) => list.map((z) => (z._id === row._id ? row : z)));
  }

  private async run(fn: () => Promise<void>, fallback: string) {
    this.busy.set(true);
    this.error.set(null);
    try {
      await fn();
    } catch (e: unknown) {
      this.error.set(apiErrorMessage(e, fallback));
    } finally {
      this.busy.set(false);
    }
  }

  save() {
    const id = this.editing();
    if (!id) return;
    const cost = Number(String(this.draft.cost).replace(/\D/g, ''));
    if (!this.draft.city.trim() || !Number.isFinite(cost)) {
      this.error.set('Ciudad y flete en pesos, sin puntos ni decimales.');
      return;
    }
    const days = this.draft.estimatedDays.trim();
    const payload = {
      city: this.draft.city.trim(),
      cost,
      estimatedDays: days ? Number(days) : null,
      notes: this.draft.notes.trim(),
    };
    this.run(async () => {
      if (id === 'new') {
        const row = await firstValueFrom(this.service.createShippingZone(payload));
        this.zones.update((list) => [...list, row].sort((a, b) => a.city.localeCompare(b.city)));
      } else {
        this.replace(await firstValueFrom(this.service.updateShippingZone(id, payload)));
      }
      this.editing.set(null);
    }, 'No se pudo guardar la ciudad.');
  }

  toggle(z: AdminShippingZone) {
    const active = !z.active;
    this.run(async () => {
      this.replace(await firstValueFrom(this.service.setShippingZoneActive(z._id, active)));
      if (!active) {
        this.undo.offer(`${z.city} quedó oculta.`, async () => {
          this.replace(await firstValueFrom(this.service.setShippingZoneActive(z._id, true)));
        });
      }
    }, 'No se pudo cambiar la ciudad.');
  }
}
