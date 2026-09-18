import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AdminCategoryService } from '../../core/services/admin-category.service';
import { AdminProductService } from '../../core/services/admin-product.service';
import type { AdminCategory, AdminCategoryInput, Material } from '../../core/models/admin.model';
import { UndoService } from './undo.service';

interface Draft {
  id: string | null; // null = nueva
  name: string;
  parentId: string | null;
  material: '' | Material;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  slug?: string;
}

@Component({
  selector: 'app-admin-category-list',
  standalone: true,
  imports: [FormsModule, NgTemplateOutlet],
  templateUrl: './admin-category-list.html',
})
export class AdminCategoryList {
  private service = inject(AdminCategoryService);
  private undo = inject(UndoService);
  private products = inject(AdminProductService);

  all = signal<AdminCategory[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  busyId = signal<string | null>(null);
  draft = signal<Draft | null>(null);
  uploading = signal(false);

  /** El bloque de ayuda se cierra y no vuelve en esta sesión. */
  helpDismissed = signal(false);
  /** Categoría cuya franja de "¿ocultar?" está abierta. Reemplaza al confirm(). */
  confirmingHide = signal<string | null>(null);
  dragId = signal<string | null>(null);

  roots = computed(() => this.all().filter((c) => !c.parent));
  childrenOf = (parentId: string) => this.all().filter((c) => c.parent === parentId);

  /** Todas las subcategorías: es el nivel que la gente ve y toca en la página. */
  private children = computed(() => this.all().filter((c) => c.parent));

  readonly resumen = computed(() => {
    const hijas = this.children();
    return {
      total: hijas.length,
      sinFoto: hijas.filter((c) => !c.imageUrl).length,
      sinMuebles: hijas.filter((c) => c.productCount === 0).length,
      ocultas: hijas.filter((c) => !c.active).length,
      tejido: hijas.filter((c) => c.material === 'tejido').length,
      madera: hijas.filter((c) => c.material === 'madera').length,
    };
  });

  /** El color del material, que es funcional y no decorativo. */
  colorMaterial(c: AdminCategory): string {
    if (c.material === 'tejido') return 'var(--tejido)';
    if (c.material === 'madera') return 'var(--madera)';
    return 'var(--linea-fuerte)';
  }

  nombreMaterial(c: AdminCategory): string | null {
    if (c.material === 'tejido') return 'Tejido';
    if (c.material === 'madera') return 'Madera';
    return null;
  }

  /** Lo que se pierde al ocultar, dicho en concreto antes de tocar el botón. */
  consecuenciaDeOcultar(c: AdminCategory): string {
    if (c.productCount === 0) {
      return `Ocultar «${c.name}» la saca de la página. Nadie la va a ver hasta que la vuelvas a mostrar.`;
    }
    const n = c.productCount;
    return (
      `Ocultar «${c.name}» también saca ${n} ${n === 1 ? 'mueble' : 'muebles'} de la página. ` +
      'Nadie los va a ver hasta que la vuelvas a mostrar.'
    );
  }

  onHandleDown(c: AdminCategory, event: PointerEvent) {
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    this.dragId.set(c._id);
  }

  /** Solo se reordena entre hermanas: una subcategoría no puede saltar de padre. */
  onHandleMove(hermanas: AdminCategory[], event: PointerEvent) {
    const id = this.dragId();
    if (!id) return;
    event.preventDefault();
    const el = document
      .elementsFromPoint(event.clientX, event.clientY)
      .find((n) => n instanceof HTMLElement && n.dataset['catId']) as HTMLElement | undefined;
    const overId = el?.dataset['catId'];
    if (!overId || overId === id) return;
    const from = hermanas.findIndex((c) => c._id === id);
    const to = hermanas.findIndex((c) => c._id === overId);
    if (from < 0 || to < 0) return;
    const ids = hermanas.map((c) => c._id);
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    this.applyOrder(ids);
  }

  onHandleUp(hermanas: AdminCategory[]) {
    if (!this.dragId()) return;
    this.dragId.set(null);
    this.service.reorder(hermanas.map((c) => c._id)).subscribe({
      error: () => this.error.set('No se pudo guardar el orden.'),
    });
  }

  onHandleKey(hermanas: AdminCategory[], c: AdminCategory, event: KeyboardEvent) {
    const delta = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
    if (!delta) return;
    event.preventDefault();
    void this.move(hermanas, hermanas.findIndex((x) => x._id === c._id), delta);
  }

  /** Reordena en memoria para que el arrastre se vea moverse antes de guardar. */
  private applyOrder(ids: string[]) {
    const pos = new Map(ids.map((id, i) => [id, i]));
    this.all.update((list) =>
      [...list].sort((a, b) => {
        const pa = pos.get(a._id);
        const pb = pos.get(b._id);
        if (pa === undefined || pb === undefined) return 0;
        return pa - pb;
      }),
    );
  }

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (rows) => {
        this.all.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar las categorías.');
        this.loading.set(false);
      },
    });
  }

  newRoot() {
    this.draft.set(this.blank(null));
  }
  newChild(parentId: string) {
    this.draft.set(this.blank(parentId));
  }
  edit(c: AdminCategory) {
    this.draft.set({
      id: c._id,
      name: c.name,
      parentId: c.parent,
      material: c.material ?? '',
      description: c.description ?? '',
      imageUrl: c.imageUrl ?? '',
      imagePublicId: '',
      slug: c.slug,
    });
  }
  cancel() {
    this.draft.set(null);
  }

  private blank(parentId: string | null): Draft {
    return {
      id: null,
      name: '',
      parentId,
      material: '',
      description: '',
      imageUrl: '',
      imagePublicId: '',
    };
  }

  async onImage(event: Event) {
    const el = event.target as HTMLInputElement;
    const file = el.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    try {
      const up = await firstValueFrom(this.products.upload(file));
      this.draft.update((d) => (d ? { ...d, imageUrl: up.url, imagePublicId: up.publicId } : d));
    } catch {
      this.error.set('No se pudo subir la imagen.');
    } finally {
      this.uploading.set(false);
      el.value = '';
    }
  }

  /** Cambia la foto de una categoría directo desde su fila, sin abrir el editor. */
  async changePhoto(c: AdminCategory, event: Event) {
    const el = event.target as HTMLInputElement;
    const file = el.files?.[0];
    el.value = '';
    if (!file) return;
    this.busyId.set(c._id);
    this.error.set(null);
    try {
      const up = await firstValueFrom(this.products.upload(file));
      await firstValueFrom(
        this.service.update(c._id, { imageUrl: up.url, imagePublicId: up.publicId }),
      );
      this.load();
    } catch (e: unknown) {
      this.error.set((e as { error?: { error?: string } })?.error?.error ?? 'No se pudo subir la foto.');
    } finally {
      this.busyId.set(null);
    }
  }

  async save() {
    const d = this.draft();
    if (!d || !d.name.trim()) return;
    this.error.set(null);

    const payload: AdminCategoryInput = {
      name: d.name.trim(),
      parentId: d.parentId,
      material: d.parentId ? (d.material || null) : null,
      description: d.description.trim() || undefined,
      imageUrl: d.imageUrl || undefined,
      imagePublicId: d.imagePublicId || undefined,
    };
    if (d.id && d.slug) payload.slug = d.slug;

    try {
      if (d.id) await firstValueFrom(this.service.update(d.id, payload));
      else await firstValueFrom(this.service.create(payload));
      this.draft.set(null);
      this.load();
    } catch (e: unknown) {
      this.error.set((e as { error?: { error?: string } })?.error?.error ?? 'No se pudo guardar.');
    }
  }

  /** Mostrar es inocuo y va directo; ocultar pide confirmación en la propia fila. */
  async toggleActive(c: AdminCategory) {
    if (c.active && this.confirmingHide() !== c._id) {
      this.confirmingHide.set(c._id);
      return;
    }
    this.confirmingHide.set(null);
    this.busyId.set(c._id);
    this.error.set(null);
    try {
      await firstValueFrom(this.service.setActive(c._id, !c.active));
      this.load();
      // La confirmación avisa la consecuencia; el deshacer cubre el "sí" apurado.
      if (c.active) {
        this.undo.offer(`"${c.name}" quedó oculta.`, async () => {
          await firstValueFrom(this.service.setActive(c._id, true));
          this.load();
        });
      }
    } catch (e: unknown) {
      this.error.set((e as { error?: { error?: string } })?.error?.error ?? 'No se pudo cambiar.');
    } finally {
      this.busyId.set(null);
    }
  }

  async move(list: AdminCategory[], index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const ids = list.map((c) => c._id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await firstValueFrom(this.service.reorder(ids));
      this.load();
    } catch {
      this.error.set('No se pudo guardar el orden.');
    }
  }
}
