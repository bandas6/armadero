import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { firstValueFrom } from 'rxjs';
import { AdminContentService } from '../../core/services/admin-content.service';
import { AdminProductService } from '../../core/services/admin-product.service';
import type { AdminCollection, AdminProductCard } from '../../core/models/admin.model';
import { UndoService } from './undo.service';
import { apiErrorMessage } from './admin-utils';

interface Draft {
  name: string;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  products: string[];
}

const EMPTY: Draft = { name: '', description: '', imageUrl: '', imagePublicId: '', products: [] };

/**
 * Colecciones / ambientes: "Sala nórdica", "Comedor para 6". Una selección de muebles con
 * nombre y foto propios. El orden del arreglo de productos manda en la página pública, así
 * que los elegidos también se arrastran.
 */
@Component({
  selector: 'app-admin-collection-list',
  standalone: true,
  imports: [FormsModule, CdkDropList, CdkDrag],
  template: `
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl">Colecciones</h1>
      <button type="button" (click)="openNew()" class="admin-btn admin-btn--primary">+ Nueva</button>
    </div>
    <p class="mt-1 text-sm" style="color: var(--gris);">
      Ambientes armados con varios muebles: "Sala para la finca", "Comedor para 6". Se ven en
      el inicio y tienen su propia página.
    </p>

    @if (error()) {
      <p class="mt-3 rounded-sm border px-3 py-2 text-sm" style="border-color: #c98; color: #8c4a34;">{{ error() }}</p>
    }

    @if (editing() !== null) {
      <form class="mt-4 space-y-3 rounded-lg border p-3" style="border-color: var(--linea); background: var(--hueso-alt);" (ngSubmit)="save()">
        <div>
          <label for="cn" class="admin-label">Nombre</label>
          <input id="cn" [(ngModel)]="draft.name" name="name" required maxlength="80" class="admin-input" />
        </div>
        <div>
          <label for="cd" class="admin-label">Descripción (opcional)</label>
          <textarea id="cd" [(ngModel)]="draft.description" name="description" rows="2" maxlength="600" class="admin-input text-sm"></textarea>
        </div>
        <div>
          <label class="admin-label">Foto (opcional)</label>
          @if (draft.imageUrl) {
            <img [src]="draft.imageUrl" alt="" class="mb-2 block h-32 w-full rounded object-cover" />
          }
          <input type="file" accept="image/*" (change)="upload($event)" [disabled]="uploading()" class="text-sm" />
          @if (uploading()) { <span class="text-xs" style="color: var(--gris);">Subiendo…</span> }
        </div>

        <div>
          <label class="admin-label">Muebles de la colección ({{ draft.products.length }})</label>
          <p class="mb-2 text-xs" style="color: var(--gris);">Arrastra para ordenarlos; así salen en la página.</p>
          <ul class="space-y-1" cdkDropList (cdkDropListDropped)="dropProduct($event)">
            @for (id of draft.products; track id) {
              <li cdkDrag class="flex items-center gap-2 rounded border px-2 py-1 text-sm" style="border-color: var(--linea); background: #fff;">
                <span cdkDragHandle class="cursor-grab" style="color: var(--gris);" aria-label="Arrastrar">⋮⋮</span>
                <span class="flex-1 truncate">{{ nameOf(id) }}</span>
                <button type="button" (click)="removeProduct(id)" class="admin-btn admin-btn--sm">Quitar</button>
              </li>
            }
          </ul>
          <div class="mt-2 flex gap-2">
            <input [(ngModel)]="pickerQuery" name="pickerQuery" placeholder="Buscar mueble para agregar" class="admin-input" />
          </div>
          @if (pickerQuery.trim()) {
            <ul class="mt-1 max-h-48 space-y-1 overflow-y-auto rounded border p-1" style="border-color: var(--linea); background: #fff;">
              @for (p of candidates(); track p._id) {
                <li>
                  <button type="button" (click)="addProduct(p._id)" class="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-[var(--hueso)]">
                    {{ p.name }} <span class="text-xs" style="color: var(--gris);">· {{ p.category?.name }}</span>
                  </button>
                </li>
              } @empty {
                <li class="px-2 py-1 text-sm" style="color: var(--gris);">Nada con ese nombre.</li>
              }
            </ul>
          }
        </div>

        <div class="flex gap-2">
          <button type="submit" [disabled]="busy() || uploading() || !draft.name.trim()" class="admin-btn admin-btn--primary">
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
        @for (c of collections(); track c._id) {
          <li cdkDrag class="flex gap-3 rounded-lg border p-3" style="border-color: var(--linea); background: var(--hueso-alt);" [style.opacity]="c.active ? 1 : 0.6">
            <span cdkDragHandle class="flex cursor-grab items-center px-1 text-lg" style="color: var(--gris);" aria-label="Arrastrar">⋮⋮</span>
            @if (c.imageUrl) {
              <img [src]="c.imageUrl" alt="" class="h-16 w-16 shrink-0 rounded object-cover" />
            } @else {
              <span class="flex h-16 w-16 shrink-0 items-center justify-center rounded text-[0.65rem]" style="background: var(--hueso); color: var(--gris);">Sin foto</span>
            }
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium">{{ c.name }}</p>
              <p class="text-xs" style="color: var(--gris);">
                {{ c.products.length }} {{ c.products.length === 1 ? 'mueble' : 'muebles' }} · {{ c.active ? 'Publicada' : 'Oculta' }} · /coleccion/{{ c.slug }}
              </p>
              <div class="mt-2 flex gap-2">
                <button type="button" (click)="openEdit(c)" class="admin-btn admin-btn--sm">Editar</button>
                <button type="button" (click)="toggle(c)" [disabled]="busy()" class="admin-btn admin-btn--sm">{{ c.active ? 'Ocultar' : 'Publicar' }}</button>
              </div>
            </div>
          </li>
        } @empty {
          <li style="color: var(--gris);">Todavía no hay colecciones.</li>
        }
      </ul>
    }
  `,
})
export class AdminCollectionList {
  private service = inject(AdminContentService);
  private products = inject(AdminProductService);
  private undo = inject(UndoService);

  collections = signal<AdminCollection[]>([]);
  catalog = signal<AdminProductCard[]>([]);
  loading = signal(true);
  busy = signal(false);
  uploading = signal(false);
  error = signal<string | null>(null);
  editing = signal<string | null>(null);
  draft: Draft = { ...EMPTY, products: [] };
  pickerQuery = '';

  private byId = computed(() => new Map(this.catalog().map((p) => [p._id, p])));

  constructor() {
    this.service.listCollections().subscribe({
      next: (list) => {
        this.collections.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar las colecciones.');
        this.loading.set(false);
      },
    });
    this.loadCatalog();
  }

  /** Todo el catálogo para el buscador: el API entrega máximo 60 por página, así que se pagina. */
  private async loadCatalog() {
    const all: AdminProductCard[] = [];
    try {
      for (let page = 1; page < 50; page++) {
        const res = await firstValueFrom(this.products.list({ page, pageSize: 60 }));
        all.push(...res.items);
        if (all.length >= res.total || res.items.length === 0) break;
      }
    } catch {
      this.error.set('No pudimos cargar la lista de muebles para el buscador.');
    }
    this.catalog.set(all);
  }

  nameOf(id: string): string {
    return this.byId().get(id)?.name ?? 'Mueble';
  }

  candidates(): AdminProductCard[] {
    const q = this.pickerQuery.trim().toLowerCase();
    const chosen = new Set(this.draft.products);
    return this.catalog()
      .filter((p) => !chosen.has(p._id) && p.name.toLowerCase().includes(q))
      .slice(0, 12);
  }

  openNew() {
    this.draft = { ...EMPTY, products: [] };
    this.pickerQuery = '';
    this.editing.set('new');
  }

  openEdit(c: AdminCollection) {
    this.draft = {
      name: c.name,
      description: c.description ?? '',
      imageUrl: c.imageUrl ?? '',
      imagePublicId: c.imagePublicId ?? '',
      products: [...c.products],
    };
    this.pickerQuery = '';
    this.editing.set(c._id);
  }

  addProduct(id: string) {
    this.draft.products = [...this.draft.products, id];
    this.pickerQuery = '';
  }

  removeProduct(id: string) {
    this.draft.products = this.draft.products.filter((p) => p !== id);
  }

  dropProduct(event: CdkDragDrop<string[]>) {
    const list = [...this.draft.products];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.draft.products = list;
  }

  async upload(event: Event) {
    const el = event.target as HTMLInputElement;
    const file = el.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.error.set(null);
    try {
      const up = await firstValueFrom(this.products.upload(file));
      this.draft.imageUrl = up.url;
      this.draft.imagePublicId = up.publicId;
    } catch (e: unknown) {
      this.error.set(apiErrorMessage(e, 'No se pudo subir la foto.'));
    } finally {
      this.uploading.set(false);
      el.value = '';
    }
  }

  private replace(row: AdminCollection) {
    this.collections.update((list) => list.map((c) => (c._id === row._id ? row : c)));
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
    const d = this.draft;
    const payload = {
      name: d.name.trim(),
      description: d.description.trim(),
      imageUrl: d.imageUrl,
      imagePublicId: d.imagePublicId || undefined,
      products: d.products,
    };
    this.run(async () => {
      if (id === 'new') {
        const row = await firstValueFrom(this.service.createCollection(payload));
        this.collections.update((list) => [...list, row]);
      } else {
        this.replace(await firstValueFrom(this.service.updateCollection(id, payload)));
      }
      this.editing.set(null);
    }, 'No se pudo guardar la colección.');
  }

  toggle(c: AdminCollection) {
    const active = !c.active;
    this.run(async () => {
      this.replace(await firstValueFrom(this.service.setCollectionActive(c._id, active)));
      if (!active) {
        this.undo.offer(`"${c.name}" quedó oculta.`, async () => {
          this.replace(await firstValueFrom(this.service.setCollectionActive(c._id, true)));
        });
      }
    }, 'No se pudo cambiar la colección.');
  }

  drop(event: CdkDragDrop<AdminCollection[]>) {
    if (event.previousIndex === event.currentIndex) return;
    const list = [...this.collections()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.collections.set(list);
    this.service.reorderCollections(list.map((c) => c._id)).subscribe({
      error: () => this.error.set('No se pudo guardar el nuevo orden.'),
    });
  }
}
