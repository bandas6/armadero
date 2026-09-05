import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { AdminProductService } from '../../core/services/admin-product.service';
import type { AdminProductCard } from '../../core/models/admin.model';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [RouterLink, FormsModule, CopCurrencyPipe],
  templateUrl: './admin-product-list.html',
})
export class AdminProductList {
  private service = inject(AdminProductService);

  products = signal<AdminProductCard[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  busyId = signal<string | null>(null);

  q = '';
  statusFilter = '';

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.service
      .list({ q: this.q || undefined, active: undefined, pageSize: 60 })
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

  private replace(updated: AdminProductCard) {
    this.products.update((list) => list.map((p) => (p._id === updated._id ? { ...p, ...updated } : p)));
  }

  toggleActive(p: AdminProductCard) {
    if (!p.active && p.imageCount === 0) {
      this.error.set(`"${p.name}" no tiene fotos todavía. Ábrelo y agrega una antes de publicarlo.`);
      return;
    }
    this.error.set(null);
    this.busyId.set(p._id);
    this.service.setActive(p._id, !p.active).subscribe({
      next: (r) => {
        this.replace(r as unknown as AdminProductCard);
        this.busyId.set(null);
      },
      error: (e) => {
        this.error.set(e?.error?.error ?? 'No se pudo cambiar el estado.');
        this.busyId.set(null);
      },
    });
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
        this.error.set(e?.error?.error ?? 'No se pudo destacar.');
        this.busyId.set(null);
      },
    });
  }

  move(index: number, delta: number) {
    const list = [...this.products()];
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    this.products.set(list);
    this.service.reorder(list.map((p) => p._id)).subscribe({
      error: () => this.error.set('No se pudo guardar el nuevo orden.'),
    });
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
