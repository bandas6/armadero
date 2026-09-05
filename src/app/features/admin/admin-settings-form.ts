import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminSettingsService } from '../../core/services/admin-settings.service';

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
    businessHours: [''],
    announcement: [''],
    instagramUrl: [''],
    facebookUrl: [''],
    quoteMessageTemplate: [''],
  });

  constructor() {
    this.service.get().subscribe({
      next: (s) => {
        this.form.patchValue({
          whatsappNumber: s.whatsappNumber,
          businessHours: s.businessHours,
          announcement: s.announcement,
          instagramUrl: s.instagramUrl,
          facebookUrl: s.facebookUrl,
          quoteMessageTemplate: s.quoteMessageTemplate,
        });
        this.whatsappSource.set(s.whatsappSource);
        this.effectiveWhatsapp.set(s.effectiveWhatsapp);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar los ajustes.');
        this.loading.set(false);
      },
    });
  }

  async save() {
    this.saving.set(true);
    this.error.set(null);
    this.saved.set(false);
    try {
      const s = await firstValueFrom(this.service.update(this.form.getRawValue()));
      this.whatsappSource.set(s.whatsappSource);
      this.effectiveWhatsapp.set(s.effectiveWhatsapp);
      this.saved.set(true);
    } catch (e: unknown) {
      this.error.set(
        (e as { error?: { error?: string; details?: { message: string }[] } })?.error?.error ??
          (e as { error?: { details?: { message: string }[] } })?.error?.details
            ?.map((d) => d.message)
            .join(' ') ??
          'No se pudo guardar.',
      );
    } finally {
      this.saving.set(false);
    }
  }
}
