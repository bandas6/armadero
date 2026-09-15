import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AdminContentService } from '../../core/services/admin-content.service';
import { apiErrorMessage } from './admin-utils';

/** Mi cuenta: cambiar la propia contraseña sin pasar por `npm run create-admin`. */
@Component({
  selector: 'app-admin-account',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h1 class="text-xl">Mi cuenta</h1>
    <p class="mt-1 text-sm" style="color: var(--gris);">
      {{ auth.user()?.name }} · {{ auth.user()?.email }} ·
      {{ auth.user()?.role === 'ADMIN' ? 'Administra todo' : 'Carga muebles y fotos' }}
    </p>

    <h2 class="mt-6 text-base font-semibold">Cambiar la contraseña</h2>

    @if (error()) {
      <p class="mt-3 rounded-sm border px-3 py-2 text-sm" style="border-color: #c98; color: #8c4a34;">
        {{ error() }}
      </p>
    }
    @if (done()) {
      <p class="mt-3 rounded-sm border px-3 py-2 text-sm" style="border-color: var(--hoja); color: var(--hoja);">
        Contraseña cambiada. Vuelve a entrar con la nueva.
      </p>
    }

    <form class="mt-3 max-w-sm space-y-4" [formGroup]="form" (ngSubmit)="save()">
      <div>
        <label for="cur" class="admin-label">Contraseña actual</label>
        <input id="cur" type="password" autocomplete="current-password" formControlName="currentPassword" class="admin-input" />
      </div>
      <div>
        <label for="new" class="admin-label">Contraseña nueva</label>
        <input id="new" type="password" autocomplete="new-password" formControlName="newPassword" class="admin-input" />
        <p class="mt-1 text-xs" style="color: var(--gris);">Mínimo 8 caracteres.</p>
      </div>
      <div>
        <label for="rep" class="admin-label">Repite la nueva</label>
        <input id="rep" type="password" autocomplete="new-password" formControlName="repeat" class="admin-input" />
      </div>
      <button type="submit" [disabled]="saving()" class="admin-btn admin-btn--primary">
        {{ saving() ? 'Guardando…' : 'Cambiar contraseña' }}
      </button>
    </form>
  `,
})
export class AdminAccount {
  readonly auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private service = inject(AdminContentService);
  private router = inject(Router);

  saving = signal(false);
  done = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    repeat: ['', Validators.required],
  });

  async save() {
    const { currentPassword, newPassword, repeat } = this.form.getRawValue();
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Llena los tres campos; la nueva necesita al menos 8 caracteres.');
      return;
    }
    if (newPassword !== repeat) {
      this.error.set('La contraseña nueva no coincide en los dos campos.');
      return;
    }
    this.saving.set(true);
    try {
      await firstValueFrom(this.service.changePassword(currentPassword, newPassword));
      this.done.set(true);
      this.form.reset();
      // El API cerró todas las sesiones (incluida esta): a la pantalla de entrada.
      setTimeout(async () => {
        await this.auth.logout();
        this.router.navigate(['/admin/login']);
      }, 1500);
    } catch (e: unknown) {
      this.error.set(apiErrorMessage(e, 'No se pudo cambiar la contraseña.'));
    } finally {
      this.saving.set(false);
    }
  }
}
