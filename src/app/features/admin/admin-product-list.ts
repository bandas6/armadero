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

/** Tope de destacados del inicio: el mismo que valida la API. */
const FEATURED_LIMIT = 9;

/** Cuántos muebles se muestran antes de pedir "ver los que faltan". */
const PAGE = 20;

type Filtro = 'todos' | 'sin-foto' | 'ocultos' | 'visibles' | 'inicio';

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
  /** El filtro de estado ahora son pastillas con conteo, no un <select>. */
  statusFilter = signal<Filtro>('todos');
  /** '' = todo el catálogo; un id = solo esa categoría (y el orden se guarda dentro de ella). */
  categoryFilter = '';

  /** El bloque de pendientes se cierra y no vuelve en esta sesión. */
  pendingDismissed = signal(false);
  /** Menú "⋯" abierto, por id de mueble. */
  openMenu = signal<string | null>(null);
  /** Cuántos se muestran; "Ver los que faltan" lo sube. */
  shown = signal(PAGE);
  readonly featuredLimit = FEATURED_LIMIT;

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
  readonly canDrag = computed(() => !this.q && this.statusFilter() === 'todos');

  // ---- Conteos: lo que hace que las pastillas digan algo ----

  readonly sinFoto = computed(() => this.products().filter((p) => p.imageCount === 0));
  readonly ocultos = computed(() => this.products().filter((p) => !p.active));
  readonly visibles = computed(() => this.products().filter((p) => p.active));
  readonly destacados = computed(() => this.products().filter((p) => p.featured));

  /** Los que esperan foto, para el bloque de arriba. */
  readonly pendientes = computed(() => (this.pendingDismissed() ? [] : this.sinFoto()));

  readonly visible = computed(() => this.filtered().slice(0, this.shown()));
  readonly faltan = computed(() => Math.max(0, this.filtered().length - this.visible().length));

  setFilter(f: Filtro) {
    this.statusFilter.set(f);
    this.shown.set(PAGE);
  }

  verMas() {
    this.shown.update((n) => n + PAGE);
  }

  toggleMenu(id: string) {
    this.openMenu.update((open) => (open === id ? null : id));
  }

  /**
   * El estado, en palabras. "Activo / Inactivo" no dice nada; lo que importa es si la
   * gente lo ve. Y oculto-sin-foto es un problema distinto de oculto-con-cuatro-fotos.
   */
  estado(p: AdminProductCard): string {
    if (p.active) return 'Se ve en la página';
    if (p.imageCount === 0) return 'Oculto — todavía nadie lo ve';
    const fotos = p.imageCount === 1 ? '1 foto' : `${p.imageCount} fotos`;
    return `Oculto — tiene ${fotos}, pero nadie lo ve`;
  }

  /**
   * Tomar la foto: sube el archivo y lo engancha al mueble. En el celular el
   * `capture="environment"` del input abre la cámara trasera directamente.
   */
  async tomarFoto(p: AdminProductCard, event: Event) {
    const el = event.target as HTMLInputElement;
    const file = el.files?.[0];
    el.value = '';
    if (!file) return;
    this.error.set(null);
    this.busyId.set(p._id);
    try {
      const up = await firstValueFrom(this.service.upload(file));
      await firstValueFrom(this.service.attachImage(p._id, { url: up.url, publicId: up.publicId }));
      this.load();
    } catch (e: unknown) {
      this.error.set(apiErrorMessage(e, 'No se pudo subir la foto.'));
    } finally {
      this.busyId.set(null);
    }
  }

  /**
   * Duplicar: se lee el mueble completo y se crea una copia. Nace oculta, como todo
   * mueble nuevo, para que nadie la vea a medio llenar.
   */
  async duplicar(p: AdminProductCard) {
    this.error.set(null);
    this.busyId.set(p._id);
    this.openMenu.set(null);
    try {
      const full = await firstValueFrom(this.service.get(p._id));
      const categoryId = typeof full.category === 'string' ? full.category : full.category?._id;
      await firstValueFrom(
        this.service.create({
          name: `${full.name} (copia)`,
          category: categoryId ?? '',
          shortDescription: full.shortDescription,
          description: full.description,
          material: full.material,
          finish: full.finish,
          spaceNote: full.spaceNote,
          personalizable: full.personalizable,
          customizationNotes: full.customizationNotes,
          customizationFields: full.customizationFields,
          status: full.status,
          featured: false,
          variants: (full.variants ?? []).map(({ _id, ...v }) => v),
        }),
      );
      this.load();
    } catch (e: unknown) {
      this.error.set(apiErrorMessage(e, 'No se pudo duplicar el mueble.'));
    } finally {
      this.busyId.set(null);
    }
  }

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
    if (!p.featured && this.destacados().length >= FEATURED_LIMIT) {
      this.error.set(
        `Ya hay ${FEATURED_LIMIT} muebles en el inicio. Quita uno antes de agregar otro.`,
      );
      return;
    }
    this.error.set(null);
    this.openMenu.set(null);
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

  readonly filtered = computed(() => {
    switch (this.statusFilter()) {
      case 'sin-foto':
        return this.sinFoto();
      case 'ocultos':
        return this.ocultos();
      case 'visibles':
        return this.visibles();
      case 'inicio':
        return this.destacados();
      default:
        return this.products();
    }
  });
}
