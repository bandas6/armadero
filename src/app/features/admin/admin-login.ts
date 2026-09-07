import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center px-4" style="background: var(--hueso);">
      <div
        class="w-full max-w-sm rounded-sm border p-6"
        style="border-color: var(--linea); background: var(--hueso-alt);"
      >
        <h1 class="text-xl">Panel de Artemadero</h1>
        <p class="mt-1 text-sm" style="color: var(--gris);">Ingresa para administrar el catálogo.</p>

        <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <div>
            <label for="email" class="block text-sm font-medium">Correo</label>
            <input
              id="email"
              type="email"
              autocomplete="username"
              formControlName="email"
              class="mt-1 w-full rounded border px-3 py-2"
              style="border-color: var(--linea-fuerte);"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium">Contraseña</label>
            <input
              id="password"
              type="password"
              autocomplete="current-password"
              formControlName="password"
              class="mt-1 w-full rounded border px-3 py-2"
              style="border-color: var(--linea-fuerte);"
            />
          </div>

          @if (error()) {
            <p class="text-sm" style="color: #8c4a34;">{{ error() }}</p>
          }

          <button
            type="submit"
            [disabled]="submitting()"
            class="w-full rounded px-4 py-2.5 font-medium disabled:opacity-60"
            style="background: var(--hoja); color: #fff;"
          >
            {{ submitting() ? 'Entrando…' : 'Entrar' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class AdminLogin {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    inject(SeoService).setPage({ title: 'Ingresar al panel', path: '/admin/login', noindex: true });
  }

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submitting = signal(false);
  error = signal<string | null>(null);

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    try {
      await this.auth.login(email, password);
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/admin';
      this.router.navigateByUrl(returnUrl);
    } catch {
      this.error.set('Correo o contraseña incorrectos.');
    } finally {
      this.submitting.set(false);
    }
  }
}
