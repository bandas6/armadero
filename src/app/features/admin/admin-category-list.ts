import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminCategoryService } from '../../core/services/admin-category.service';
import { AdminProductService } from '../../core/services/admin-product.service';
import type { AdminCategory, AdminCategoryInput, Material } from '../../core/models/admin.model';

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
  imports: [FormsModule],
  templateUrl: './admin-category-list.html',
})
export class AdminCategoryList {
  private service = inject(AdminCategoryService);
  private products = inject(AdminProductService);

  all = signal<AdminCategory[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  busyId = signal<string | null>(null);
  draft = signal<Draft | null>(null);
  uploading = signal(false);

  roots = computed(() => this.all().filter((c) => !c.parent));
  childrenOf = (parentId: string) => this.all().filter((c) => c.parent === parentId);

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

  async toggleActive(c: AdminCategory) {
    if (c.active) {
      const affected = c.productCount;
      const msg =
        affected > 0
          ? `Ocultar "${c.name}" también oculta ${affected} mueble(s) del sitio. ¿Continuar?`
          : `¿Ocultar "${c.name}" del sitio?`;
      if (!confirm(msg)) return;
    }
    this.busyId.set(c._id);
    this.error.set(null);
    try {
      await firstValueFrom(this.service.setActive(c._id, !c.active));
      this.load();
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
