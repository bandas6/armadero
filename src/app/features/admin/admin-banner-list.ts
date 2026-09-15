import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { firstValueFrom } from 'rxjs';
import { AdminContentService } from '../../core/services/admin-content.service';
import { AdminProductService } from '../../core/services/admin-product.service';
import type { AdminBanner } from '../../core/models/admin.model';
import { UndoService } from './undo.service';
import { apiErrorMessage, fromDateInput, toDateInput } from './admin-utils';

interface Draft {
  title: string;
  subtitle: string;
  linkUrl: string;
  startsAt: string;
  endsAt: string;
  imageUrl: string;
  imagePublicId: string;
}

const EMPTY: Draft = {
  title: '',
  subtitle: '',
  linkUrl: '',
  startsAt: '',
  endsAt: '',
  imageUrl: '',
  imagePublicId: '',
};

/**
 * Banners del inicio (solo ADMIN). El primero activo y en fecha reemplaza la foto y el
 * texto del hero; los demás quedan en cola. La estructura del home no se toca: un banner
 * cambia la foto y las frases, no las secciones (docs/panel-admin.md).
 */
@Component({
  selector: 'app-admin-banner-list',
  standalone: true,
  imports: [FormsModule, CdkDropList, CdkDrag],
  template: `
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl">Inicio: foto y frase de portada</h1>
      <button type="button" (click)="openNew()" class="admin-btn admin-btn--primary">+ Nuevo</button>
    </div>
    <p class="mt-1 text-sm" style="color: var(--gris);">
      El primero de la lista que esté activo y en fecha es el que se ve. Sin ninguno, el
      inicio usa la foto y el texto de siempre. Arrastra para cambiar el orden.
    </p>

    @if (error()) {
      <p class="mt-3 rounded-sm border px-3 py-2 text-sm" style="border-color: #c98; color: #8c4a34;">{{ error() }}</p>
    }

    @if (editing() !== null) {
      <form class="mt-4 space-y-3 rounded-lg border p-3" style="border-color: var(--linea); background: var(--hueso-alt);" (ngSubmit)="save()">
        <div>
          <label class="admin-label">Foto</label>
          @if (draft.imageUrl) {
            <img [src]="draft.imageUrl" alt="" class="mb-2 block h-32 w-full rounded object-cover" />
          }
          <input type="file" accept="image/*" (change)="upload($event)" [disabled]="uploading()" class="text-sm" />
          <p class="mt-1 text-xs" style="color: var(--gris);">
            La más limpia que tengas: una sala o un comedor completo, horizontal.
            @if (uploading()) { Subiendo… }
          </p>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label for="bt" class="admin-label">Titular (opcional)</label>
            <input id="bt" [(ngModel)]="draft.title" name="title" maxlength="120" class="admin-input" />
          </div>
          <div>
            <label for="bs" class="admin-label">Frase debajo (opcional)</label>
            <input id="bs" [(ngModel)]="draft.subtitle" name="subtitle" maxlength="240" class="admin-input" />
          </div>
          <div>
            <label for="bl" class="admin-label">A dónde lleva (opcional)</label>
            <input id="bl" [(ngModel)]="draft.linkUrl" name="linkUrl" placeholder="/catalogo?material=madera" class="admin-input" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label for="bd1" class="admin-label">Desde</label>
              <input id="bd1" type="date" [(ngModel)]="draft.startsAt" name="startsAt" class="admin-input" />
            </div>
            <div>
              <label for="bd2" class="admin-label">Hasta</label>
              <input id="bd2" type="date" [(ngModel)]="draft.endsAt" name="endsAt" class="admin-input" />
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <button type="submit" [disabled]="busy() || uploading() || !draft.imageUrl" class="admin-btn admin-btn--primary">
            {{ editing() === 'new' ? 'Crear' : 'Guardar' }}
          </button>
          <button type="button" (click)="editing.set(null)" class="admin-btn">Cancelar</button>
        </div>
      </form>
    }

    @if (loading()) {
      <p class="mt-6" style="color: var(--gris);">Cargando…</p>
    } @else {
      <ul class="mt-4 space-y-3" cdkDropList (cdkDropListDropped)="drop($event)">
        @for (b of banners(); track b._id) {
          <li cdkDrag class="flex gap-3 rounded-lg border p-3" style="border-color: var(--linea); background: var(--hueso-alt);" [style.opacity]="b.active ? 1 : 0.6">
            <span cdkDragHandle class="flex cursor-grab items-center px-1 text-lg" style="color: var(--gris);" aria-label="Arrastrar">⋮⋮</span>
            <img [src]="b.imageUrl" alt="" class="h-16 w-24 shrink-0 rounded object-cover" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium">{{ b.title || 'Sin titular (usa el de siempre)' }}</p>
              <p class="truncate text-sm" style="color: var(--gris);">{{ b.subtitle || '—' }}</p>
              <p class="mt-1 text-xs" style="color: var(--gris);">
                {{ b.active ? 'Activo' : 'Apagado' }}
                @if (b.startsAt || b.endsAt) { · {{ toDate(b.startsAt) || '…' }} → {{ toDate(b.endsAt) || '…' }} }
              </p>
              <div class="mt-2 flex gap-2">
                <button type="button" (click)="openEdit(b)" class="admin-btn admin-btn--sm">Editar</button>
                <button type="button" (click)="toggle(b)" [disabled]="busy()" class="admin-btn admin-btn--sm">{{ b.active ? 'Apagar' : 'Encender' }}</button>
              </div>
            </div>
          </li>
        } @empty {
          <li style="color: var(--gris);">Todavía no hay banners. El inicio usa la portada de siempre.</li>
        }
      </ul>
    }
  `,
})
export class AdminBannerList {
  private service = inject(AdminContentService);
  private uploads = inject(AdminProductService);
  private undo = inject(UndoService);

  banners = signal<AdminBanner[]>([]);
  loading = signal(true);
  busy = signal(false);
  uploading = signal(false);
  error = signal<string | null>(null);
  /** null = lista; 'new' = formulario de nuevo; id = editando ese banner. */
  editing = signal<string | null>(null);
  draft: Draft = { ...EMPTY };

  readonly toDate = toDateInput;

  constructor() {
    this.service.listBanners().subscribe({
      next: (list) => {
        this.banners.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar los banners.');
        this.loading.set(false);
      },
    });
  }

  openNew() {
    this.draft = { ...EMPTY };
    this.editing.set('new');
  }

  openEdit(b: AdminBanner) {
    this.draft = {
      title: b.title ?? '',
      subtitle: b.subtitle ?? '',
      linkUrl: b.linkUrl ?? '',
      startsAt: toDateInput(b.startsAt),
      endsAt: toDateInput(b.endsAt),
      imageUrl: b.imageUrl,
      imagePublicId: b.imagePublicId ?? '',
    };
    this.editing.set(b._id);
  }

  async upload(event: Event) {
    const el = event.target as HTMLInputElement;
    const file = el.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.error.set(null);
    try {
      const up = await firstValueFrom(this.uploads.upload(file));
      this.draft.imageUrl = up.url;
      this.draft.imagePublicId = up.publicId;
    } catch (e: unknown) {
      this.error.set(apiErrorMessage(e, 'No se pudo subir la foto.'));
    } finally {
      this.uploading.set(false);
      el.value = '';
    }
  }

  private payload() {
    const d = this.draft;
    return {
      title: d.title.trim(),
      subtitle: d.subtitle.trim(),
      linkUrl: d.linkUrl.trim(),
      imageUrl: d.imageUrl,
      imagePublicId: d.imagePublicId || undefined,
      startsAt: fromDateInput(d.startsAt),
      endsAt: fromDateInput(d.endsAt),
    };
  }

  private replace(row: AdminBanner) {
    this.banners.update((list) => list.map((b) => (b._id === row._id ? row : b)));
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
    this.run(async () => {
      if (id === 'new') {
        const row = await firstValueFrom(this.service.createBanner(this.payload()));
        this.banners.update((list) => [...list, row]);
      } else {
        this.replace(await firstValueFrom(this.service.updateBanner(id, this.payload())));
      }
      this.editing.set(null);
    }, 'No se pudo guardar el banner.');
  }

  toggle(b: AdminBanner) {
    const active = !b.active;
    this.run(async () => {
      this.replace(await firstValueFrom(this.service.setBannerActive(b._id, active)));
      if (!active) {
        this.undo.offer('Banner apagado.', async () => {
          this.replace(await firstValueFrom(this.service.setBannerActive(b._id, true)));
        });
      }
    }, 'No se pudo cambiar el banner.');
  }

  drop(event: CdkDragDrop<AdminBanner[]>) {
    if (event.previousIndex === event.currentIndex) return;
    const list = [...this.banners()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.banners.set(list);
    this.service.reorderBanners(list.map((b) => b._id)).subscribe({
      error: () => this.error.set('No se pudo guardar el nuevo orden.'),
    });
  }
}
