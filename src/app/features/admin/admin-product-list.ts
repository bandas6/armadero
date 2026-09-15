import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { firstValueFrom } from 'rxjs';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { AdminProductService } from '../../core/services/admin-product.service';
import { AdminCategoryService } from '../../core/services/admin-category.service';
import type { AdminCategory, AdminProductCard } from '../../core/models/admin.model';
import { UndoService } from './undo.service';
import { apiErrorMessage } from './admin-utils';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [RouterLink, FormsModule, CopCurrencyPipe, CdkDropList, CdkDrag],
  templateUrl: './admin-product-list.html',
})
export class AdminProductList {
  private service = inject(AdminProductService);
  private categories = inject(AdminCategoryService);
  private undo = inject(UndoService);

  products = signal<AdminProductCard[]>([]);
  leafCategories = signal<AdminCategory[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  busyId = signal<string | null>(null);

  q = '';
  statusFilter = '';
  /** '' = todo el catálogo; un id = solo esa categoría (y el orden se guarda dentro de ella). */
  categoryFilter = '';

  constructor() {
    this.load();
    this.categories.list().subscribe({
      next: (list) => this.leafCategories.set(list.filter((c) => c.isLeaf)),
      error: () => undefined,
    });
  }

  load() {
    this.loading.set(true);
    this.service
      .list({
        q: this.q || undefined,
        category: this.categoryFilter || undefined,
        active: undefined,
        pageSize: 60,
      })
      .subscribe({
        next: (res) => {
          this.products.set(res.items);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No pudimos cargar los muebles.');
          this.loading.set(false);
        },
      });
  }

  /** Se puede arrastrar cuando la lista es exactamente lo que hay en el servidor. */
  readonly canDrag = computed(() => !this.q && !this.statusFilter);

  private replace(updated: AdminProductCard) {
    this.products.update((list) =>
      list.map((p) => (p._id === updated._id ? { ...p, ...updated } : p)),
    );
  }

  private async setActive(p: AdminProductCard, active: boolean) {
    this.replace((await firstValueFrom(this.service.setActive(p._id, active))) as unknown as AdminProductCard);
  }

  async toggleActive(p: AdminProductCard) {
    if (!p.active && p.imageCount === 0) {
      this.error.set(`"${p.name}" no tiene fotos todavía. Ábrelo y agrega una antes de publicarlo.`);
      return;
    }
    this.error.set(null);
    this.busyId.set(p._id);
    try {
      await this.setActive(p, !p.active);
      // Ocultar es lo que más duele por error: se hace de una y se ofrece deshacer.
      if (p.active) {
        this.undo.offer(`"${p.name}" quedó oculto en la página.`, () => this.setActive(p, true));
      }
    } catch (e: unknown) {
      this.error.set(apiErrorMessage(e, 'No se pudo cambiar el estado.'));
    } finally {
      this.busyId.set(null);
    }
  }

  toggleFeatured(p: AdminProductCard) {
    this.error.set(null);
    this.busyId.set(p._id);
    this.service.setFeatured(p._id, !p.featured).subscribe({
      next: (r) => {
        this.replace(r as unknown as AdminProductCard);
        this.busyId.set(null);
      },
      error: (e) => {
        this.error.set(apiErrorMessage(e, 'No se pudo destacar.'));
        this.busyId.set(null);
      },
    });
  }

  /** Arrastrar para reordenar. Con una categoría elegida, el orden se guarda dentro de ella. */
  drop(event: CdkDragDrop<AdminProductCard[]>) {
    if (event.previousIndex === event.currentIndex) return;
    const list = [...this.products()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.products.set(list);
    this.service
      .reorder(
        list.map((p) => p._id),
        this.categoryFilter ? 'category' : 'all',
      )
      .subscribe({
        error: () => this.error.set('No se pudo guardar el nuevo orden.'),
      });
  }

  /** Respaldo para teclado: mover una posición sin arrastrar. */
  move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= this.products().length) return;
    this.drop({ previousIndex: index, currentIndex: target } as CdkDragDrop<AdminProductCard[]>);
  }

  filtered() {
    const s = this.statusFilter;
    return this.products().filter((p) => {
      if (s === 'oculto') return !p.active;
      if (s === 'publicado') return p.active;
      if (s === 'destacado') return p.featured;
      return true;
    });
  }
}
