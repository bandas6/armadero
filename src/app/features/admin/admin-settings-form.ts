import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminSettingsService } from '../../core/services/admin-settings.service';
import type { AdminFaq, AdminSettings } from '../../core/models/admin.model';
import { apiErrorMessage } from './admin-utils';

/** Las preguntas frecuentes son seis: se edita el texto, no la cantidad. */
const FAQ_COUNT = 6;

@Component({
  selector: 'app-admin-settings-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-settings-form.html',
})
export class AdminSettingsForm {
  private fb = inject(FormBuilder);
  private service = inject(AdminSettingsService);

  loading = signal(true);
  saving = signal(false);
  saved = signal(false);
  error = signal<string | null>(null);
  whatsappSource = signal<'panel' | 'env' | 'none'>('none');
  effectiveWhatsapp = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    whatsappNumber: [''],
    hoursWeekday: [''],
    hoursSaturday: [''],
    announcement: [''],
    instagramUrl: [''],
    facebookUrl: [''],
    storeAddress: [''],
    // '' = sin dato. Se convierte a número o null al guardar.
    foundingYear: [''],
    faqs: this.fb.array<FormGroup>([]),
    quoteMessageTemplate: [''],
  });

  get faqs(): FormArray<FormGroup> {
    return this.form.controls.faqs;
  }

  constructor() {
    this.service.get().subscribe({
      next: (s) => {
        this.patch(s);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar los ajustes.');
        this.loading.set(false);
      },
    });
  }

  private patch(s: AdminSettings) {
    this.form.patchValue({
      whatsappNumber: s.whatsappNumber,
      hoursWeekday: s.hoursWeekday,
      hoursSaturday: s.hoursSaturday,
      announcement: s.announcement,
      instagramUrl: s.instagramUrl,
      facebookUrl: s.facebookUrl,
      storeAddress: s.storeAddress,
      foundingYear: s.foundingYear ? String(s.foundingYear) : '',
      quoteMessageTemplate: s.quoteMessageTemplate,
    });
    this.faqs.clear();
    const list: AdminFaq[] = s.faqs?.length === FAQ_COUNT ? s.faqs : [];
    for (let i = 0; i < FAQ_COUNT; i++) {
      const f = list[i] ?? { q: '', a: '' };
      this.faqs.push(
        this.fb.nonNullable.group({
          q: [f.q, [Validators.required, Validators.maxLength(120)]],
          a: [f.a, [Validators.required, Validators.maxLength(400)]],
        }),
      );
    }
    this.whatsappSource.set(s.whatsappSource);
    this.effectiveWhatsapp.set(s.effectiveWhatsapp);
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Las seis preguntas necesitan pregunta y respuesta.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.saved.set(false);
    const raw = this.form.getRawValue();
    const year = raw.foundingYear.trim();
    try {
      const s = await firstValueFrom(
        this.service.update({
          ...raw,
          foundingYear: year ? Number(year) : null,
          faqs: raw.faqs as AdminFaq[],
        }),
      );
      this.patch(s);
      this.saved.set(true);
    } catch (e: unknown) {
      this.error.set(apiErrorMessage(e, 'No se pudo guardar.'));
    } finally {
      this.saving.set(false);
    }
  }
}
