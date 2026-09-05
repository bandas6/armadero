import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AdminProductService } from '../../core/services/admin-product.service';
import type { AdminImage, AdminProduct } from '../../core/models/admin.model';

@Component({
  selector: 'app-admin-image-manager',
  standalone: true,
  template: `
    <section class="mt-8">
      <h2 class="text-lg">Fotos</h2>
      <p class="text-sm" style="color: var(--texto-suave);">
        La primera foto es la que se ve en el catálogo. No se puede publicar un mueble sin fotos.
      </p>

      <label
        class="mt-3 flex cursor-pointer items-center justify-center rounded-sm border border-dashed px-4 py-6 text-sm"
        style="border-color: var(--verde-guadua); color: var(--verde-guadua);"
      >
        {{ uploading() ? 'Subiendo ' + progress() : 'Tomar o elegir fotos' }}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          class="hidden"
          (change)="onFiles($event)"
          [disabled]="uploading()"
        />
      </label>

      @if (error()) {
        <p class="mt-2 text-sm" style="color: #8c4a34;">{{ error() }}</p>
      }

      <ul class="mt-4 grid grid-cols-3 gap-3">
        @for (img of images(); track img._id; let i = $index) {
          <li class="rounded-sm border p-1" style="border-color: color-mix(in srgb, var(--musgo) 35%, transparent);">
            <div class="relative aspect-square overflow-hidden rounded-sm">
              <img [src]="img.url" [alt]="img.alt || 'Foto del mueble'" class="h-full w-full object-cover" />
              @if (img.isPrimary) {
                <span class="absolute left-1 top-1 rounded-sm px-1 text-[0.6rem]" style="background: var(--ocre-cana); color: #fff;">Principal</span>
              }
            </div>
            <div class="mt-1 flex items-center justify-between gap-1 text-[0.65rem]">
              <button type="button" (click)="move(i, -1)" [disabled]="i === 0 || busy()" class="disabled:opacity-30" aria-label="Mover antes">←</button>
              @if (!img.isPrimary) {
                <button type="button" (click)="setPrimary(img)" [disabled]="busy()" class="underline" style="color: var(--verde-guadua);">Principal</button>
              }
              <button type="button" (click)="remove(img)" [disabled]="busy()" class="underline" style="color: #8c4a34;">Borrar</button>
              <button type="button" (click)="move(i, 1)" [disabled]="i === images().length - 1 || busy()" class="disabled:opacity-30" aria-label="Mover después">→</button>
            </div>
          </li>
        } @empty {
          <li class="col-span-3 text-sm" style="color: var(--texto-suave);">Todavía no hay fotos.</li>
        }
      </ul>
    </section>
  `,
})
export class AdminImageManager {
  private service = inject(AdminProductService);

  productId = input.required<string>();
  initialImages = input<AdminImage[]>([]);
  changed = output<AdminProduct>();

  private _images = signal<AdminImage[]>([]);
  images = computed(() => [...this._images()].sort((a, b) => a.position - b.position));

  uploading = signal(false);
  busy = signal(false);
  error = signal<string | null>(null);
  progress = signal('');

  constructor() {
    effect(() => {
      this._images.set(this.initialImages() ?? []);
    });
  }

  private apply(product: AdminProduct) {
    this._images.set(product.images ?? []);
    this.changed.emit(product);
  }

  async onFiles(event: Event) {
    const el = event.target as HTMLInputElement;
    const files = Array.from(el.files ?? []);
    if (!files.length) return;
    this.uploading.set(true);
    this.error.set(null);
    try {
      for (let i = 0; i < files.length; i++) {
        this.progress.set(`${i + 1}/${files.length}`);
        const uploaded = await firstValueFrom(this.service.upload(files[i]));
        const product = await firstValueFrom(
          this.service.attachImage(this.productId(), {
            url: uploaded.url,
            publicId: uploaded.publicId,
          }),
        );
        this.apply(product);
      }
    } catch (e: unknown) {
      this.error.set(this.msg(e, 'No pudimos subir una de las fotos.'));
    } finally {
      this.uploading.set(false);
      this.progress.set('');
      el.value = '';
    }
  }

  async setPrimary(img: AdminImage) {
    this.busy.set(true);
    try {
      this.apply(await firstValueFrom(this.service.setPrimaryImage(this.productId(), img._id)));
    } finally {
      this.busy.set(false);
    }
  }

  async remove(img: AdminImage) {
    if (!confirm('¿Borrar esta foto? No se puede deshacer.')) return;
    this.busy.set(true);
    this.error.set(null);
    try {
      this.apply(await firstValueFrom(this.service.removeImage(this.productId(), img._id)));
    } catch (e: unknown) {
      this.error.set(this.msg(e, 'No se pudo borrar la foto.'));
    } finally {
      this.busy.set(false);
    }
  }

  async move(index: number, delta: number) {
    const list = [...this.images()];
    const t = index + delta;
    if (t < 0 || t >= list.length) return;
    [list[index], list[t]] = [list[t], list[index]];
    this._images.set(list.map((img, i) => ({ ...img, position: i })));
    this.busy.set(true);
    try {
      this.apply(
        await firstValueFrom(
          this.service.reorderImages(this.productId(), list.map((img) => img._id)),
        ),
      );
    } finally {
      this.busy.set(false);
    }
  }

  private msg(e: unknown, fallback: string): string {
    return (e as { error?: { error?: string } })?.error?.error ?? fallback;
  }
}
