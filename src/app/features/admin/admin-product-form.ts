import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CatalogService } from '../../core/services/catalog.service';
import { AdminProductService } from '../../core/services/admin-product.service';
import { AdminImageManager } from './admin-image-manager';
import type { CategoryNode } from '../../core/models/catalog.model';
import type {
  AdminImage,
  AdminProduct,
  AdminProductInput,
  AdminVariant,
  CustomizationField,
} from '../../core/models/admin.model';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AdminImageManager],
  templateUrl: './admin-product-form.html',
})
export class AdminProductForm {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalog = inject(CatalogService);
  private service = inject(AdminProductService);

  productId = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  isNew = computed(() => this.productId() === null);

  leafCategories = signal<{ _id: string; name: string; parentName: string }[]>([]);
  images = signal<AdminImage[]>([]);
  active = signal(false);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  notice = signal<string | null>(null);

  /** Fotos elegidas en el formulario de "Nuevo mueble", antes de que exista el producto. */
  pending = signal<{ file: File; url: string }[]>([]);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    category: ['', Validators.required],
    shortDescription: [''],
    description: [''],
    material: [''],
    finish: [''],
    personalizable: [false],
    customizationNotes: [''],
    status: ['MADE_TO_ORDER'],
    featured: [false],
    variants: this.fb.array<FormGroup>([]),
    customFields: this.fb.array<FormGroup>([]),
  });

  get variants(): FormArray<FormGroup> {
    return this.form.controls.variants;
  }

  get customFields(): FormArray<FormGroup> {
    return this.form.controls.customFields;
  }

  constructor() {
    this.catalog.getCategoryTree().subscribe((tree) => {
      this.leafCategories.set(this.flattenLeaves(tree));
    });

    const id = this.productId();
    if (id) {
      const nuevo = this.route.snapshot.queryParamMap.get('nuevo');
      if (nuevo === 'ok') {
        this.notice.set('¡Mueble creado y publicado con sus fotos!');
      } else if (nuevo) {
        this.notice.set('Mueble creado. Ahora agrega sus fotos y publícalo.');
      }
      this.service.get(id).subscribe({
        next: (p) => this.patchFromProduct(p),
        error: () => {
          this.error.set('No encontramos este mueble.');
          this.loading.set(false);
        },
      });
    } else {
      this.addVariant({ name: 'Estándar', isDefault: true });
      this.loading.set(false);
    }
  }

  private flattenLeaves(tree: CategoryNode[]) {
    const out: { _id: string; name: string; parentName: string }[] = [];
    for (const parent of tree) {
      if (parent.children.length) {
        for (const child of parent.children) {
          out.push({ _id: child._id, name: child.name, parentName: parent.name });
        }
      } else {
        out.push({ _id: parent._id, name: parent.name, parentName: '' });
      }
    }
    return out;
  }

  private variantGroup(v: Partial<AdminVariant> = {}): FormGroup {
    return this.fb.nonNullable.group({
      _id: [v._id ?? ''],
      name: [v.name ?? 'Estándar', Validators.required],
      price: [v.price ?? null],
      seats: [v.seats ?? null],
      widthCm: [v.widthCm ?? null],
      heightCm: [v.heightCm ?? null],
      depthCm: [v.depthCm ?? null],
      colorName: [v.colorName ?? ''],
      isDefault: [v.isDefault ?? false],
      active: [v.active ?? true],
    });
  }

  addVariant(v: Partial<AdminVariant> = {}) {
    this.variants.push(this.variantGroup(v));
  }

  removeVariant(i: number) {
    if (this.variants.length <= 1) return;
    this.variants.removeAt(i);
  }

  // --- Campos de personalización (qué puede pedir el cliente) ---
  private customFieldGroup(f: Partial<CustomizationField> = {}): FormGroup {
    return this.fb.nonNullable.group({
      label: [f.label ?? '', Validators.required],
      type: [f.type ?? 'text'],
      required: [f.required ?? false],
      unit: [f.unit ?? ''],
      min: [f.min ?? null],
      max: [f.max ?? null],
      options: [(f.options ?? []).join(', ')],
      hint: [f.hint ?? ''],
    });
  }

  addCustomField(f: Partial<CustomizationField> = {}) {
    this.customFields.push(this.customFieldGroup(f));
  }

  removeCustomField(i: number) {
    this.customFields.removeAt(i);
  }

  /** Botones de plantilla para no partir de cero. */
  addPreset(preset: 'medidas' | 'puestos' | 'color' | 'siNo' | 'texto') {
    if (preset === 'medidas') {
      this.addCustomField({ label: 'Ancho', type: 'number', unit: 'cm' });
      this.addCustomField({ label: 'Alto', type: 'number', unit: 'cm' });
      this.addCustomField({ label: 'Fondo', type: 'number', unit: 'cm' });
    } else if (preset === 'puestos') {
      this.addCustomField({ label: 'Número de puestos', type: 'number' });
    } else if (preset === 'color') {
      const colores = [
        ...new Set(
          this.variants.controls
            .map((v) => String(v.get('colorName')?.value ?? '').trim())
            .filter(Boolean),
        ),
      ];
      this.addCustomField({
        label: 'Color del tejido',
        type: 'select',
        options: colores.length ? colores : ['Miel', 'Natural', 'Gris'],
      });
    } else if (preset === 'siNo') {
      this.addCustomField({ label: '¿…?', type: 'boolean' });
    } else {
      this.addCustomField({ label: 'Detalle', type: 'text' });
    }
  }

  addPending(event: Event) {
    const el = event.target as HTMLInputElement;
    const files = Array.from(el.files ?? []).filter((f) => f.type.startsWith('image/'));
    this.pending.update((list) => [
      ...list,
      ...files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
    el.value = '';
  }

  removePending(i: number) {
    this.pending.update((list) => {
      URL.revokeObjectURL(list[i]?.url);
      return list.filter((_, idx) => idx !== i);
    });
  }

  private patchFromProduct(p: AdminProduct) {
    this.productId.set(p._id);
    this.active.set(p.active);
    this.images.set(p.images ?? []);
    const categoryId = typeof p.category === 'string' ? p.category : p.category?._id;
    this.form.patchValue({
      name: p.name,
      category: categoryId ?? '',
      shortDescription: p.shortDescription ?? '',
      description: p.description ?? '',
      material: p.material ?? '',
      finish: p.finish ?? '',
      personalizable: p.personalizable,
      customizationNotes: p.customizationNotes ?? '',
      status: p.status,
      featured: p.featured,
    });
    this.variants.clear();
    for (const v of p.variants ?? []) this.addVariant(v);
    if (!this.variants.length) this.addVariant({ name: 'Estándar', isDefault: true });

    this.customFields.clear();
    for (const f of p.customizationFields ?? []) this.addCustomField(f);

    this.loading.set(false);
  }

  private buildPayload(): AdminProductInput {
    const raw = this.form.getRawValue();
    const str = (v: unknown) => {
      const s = String(v ?? '').trim();
      return s === '' ? undefined : s;
    };
    const num = (v: unknown) => {
      if (v === null || v === undefined || v === '') return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    const variants: AdminVariant[] = (raw.variants as Record<string, unknown>[]).map((v) => ({
      ...(v['_id'] ? { _id: String(v['_id']) } : {}),
      name: String(v['name'] ?? 'Estándar'),
      price: num(v['price']),
      seats: num(v['seats']),
      widthCm: num(v['widthCm']),
      heightCm: num(v['heightCm']),
      depthCm: num(v['depthCm']),
      colorName: str(v['colorName']),
      isDefault: Boolean(v['isDefault']),
      active: v['active'] === undefined ? true : Boolean(v['active']),
    }));

    const customizationFields: CustomizationField[] = (raw.customFields as Record<string, unknown>[])
      .map((f) => {
        const type = String(f['type'] ?? 'text') as CustomizationField['type'];
        const options =
          type === 'select'
            ? String(f['options'] ?? '')
                .split(',')
                .map((o) => o.trim())
                .filter(Boolean)
            : undefined;
        return {
          label: String(f['label'] ?? '').trim(),
          type,
          required: Boolean(f['required']),
          unit: type === 'number' ? str(f['unit']) : undefined,
          min: type === 'number' ? num(f['min']) : undefined,
          max: type === 'number' ? num(f['max']) : undefined,
          options,
          hint: str(f['hint']),
        } as CustomizationField;
      })
      .filter((f) => f.label);

    return {
      name: raw.name,
      category: raw.category,
      shortDescription: str(raw.shortDescription),
      description: str(raw.description),
      material: str(raw.material),
      finish: str(raw.finish),
      personalizable: raw.personalizable,
      customizationNotes: raw.personalizable ? str(raw.customizationNotes) : undefined,
      customizationFields,
      status: raw.status as AdminProduct['status'],
      featured: raw.featured,
      variants,
    };
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.notice.set(null);
    const payload = this.buildPayload();

    try {
      if (this.isNew()) {
        const created = await firstValueFrom(this.service.create(payload));

        // Sube las fotos elegidas en el formulario y, si hay al menos una, publica.
        const files = this.pending();
        let subidas = 0;
        for (const { file } of files) {
          try {
            const up = await firstValueFrom(this.service.upload(file));
            await firstValueFrom(
              this.service.attachImage(created._id, { url: up.url, publicId: up.publicId }),
            );
            subidas++;
          } catch {
            this.error.set(`Se creó el mueble, pero una foto no se pudo subir. Agrégala desde el editor.`);
          }
        }
        if (subidas > 0) {
          try {
            await firstValueFrom(this.service.setActive(created._id, true));
          } catch {
            /* queda oculto; el editor lo deja publicar */
          }
        }

        this.pending.set([]);
        this.router.navigate(['/admin/productos', created._id], {
          queryParams: { nuevo: subidas > 0 ? 'ok' : 1 },
        });
      } else {
        const updated = await firstValueFrom(this.service.update(this.productId()!, payload));
        this.patchFromProduct(updated);
        this.notice.set('Cambios guardados.');
      }
    } catch (e: unknown) {
      const err = e as { error?: { error?: string; details?: { message: string }[] } };
      this.error.set(
        err?.error?.error ??
          err?.error?.details?.map((d) => d.message).join(' ') ??
          'No pudimos guardar. Revisa los datos.',
      );
    } finally {
      this.saving.set(false);
    }
  }

  async togglePublish() {
    const id = this.productId();
    if (!id) return;
    this.error.set(null);
    try {
      const updated = await firstValueFrom(this.service.setActive(id, !this.active()));
      this.active.set(updated.active);
      this.notice.set(updated.active ? 'Publicado.' : 'Oculto en la página.');
    } catch (e: unknown) {
      const err = e as { error?: { error?: string } };
      this.error.set(err?.error?.error ?? 'No se pudo cambiar el estado.');
    }
  }

  onImagesChanged(p: AdminProduct) {
    this.images.set(p.images ?? []);
    this.active.set(p.active);
  }
}
