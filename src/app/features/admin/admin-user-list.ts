import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AdminContentService } from '../../core/services/admin-content.service';
import type { AdminRole, AdminUserRow } from '../../core/models/admin.model';
import { UndoService } from './undo.service';
import { apiErrorMessage } from './admin-utils';

interface Draft {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}

const EMPTY: Draft = { name: '', email: '', password: '', role: 'EDITOR' };

/**
 * Usuarios del panel (solo ADMIN). Dos roles, sin vocabulario técnico en pantalla:
 * "Administra todo" y "Carga muebles y fotos". Nadie se borra: se le quita el acceso.
 */
@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl">Usuarios</h1>
      <button type="button" (click)="showNew.set(!showNew())" class="admin-btn admin-btn--primary">
        {{ showNew() ? 'Cancelar' : '+ Nueva persona' }}
      </button>
    </div>
    <p class="mt-1 text-sm" style="color: var(--gris);">
      Quien administra todo también entra a Ajustes, Inicio, Envíos y Usuarios. Quien carga
      muebles y fotos solo ve Muebles, Categorías, Colecciones y Cotizaciones.
    </p>

    @if (error()) {
      <p class="mt-3 rounded-sm border px-3 py-2 text-sm" style="border-color: #c98; color: #8c4a34;">{{ error() }}</p>
    }

    @if (showNew()) {
      <form class="mt-4 space-y-3 rounded-lg border p-3" style="border-color: var(--linea); background: var(--hueso-alt);" (ngSubmit)="create()">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label for="nn" class="admin-label">Nombre</label>
            <input id="nn" [(ngModel)]="draft.name" name="name" required class="admin-input" />
          </div>
          <div>
            <label for="ne" class="admin-label">Correo</label>
            <input id="ne" [(ngModel)]="draft.email" name="email" type="email" required class="admin-input" />
          </div>
          <div>
            <label for="np" class="admin-label">Contraseña (mín. 8)</label>
            <input id="np" [(ngModel)]="draft.password" name="password" type="password" autocomplete="new-password" required minlength="8" class="admin-input" />
          </div>
          <div>
            <label for="nr" class="admin-label">Qué puede hacer</label>
            <select id="nr" [(ngModel)]="draft.role" name="role" class="admin-input">
              <option value="EDITOR">Carga muebles y fotos</option>
              <option value="ADMIN">Administra todo</option>
            </select>
          </div>
        </div>
        <button type="submit" [disabled]="busy()" class="admin-btn admin-btn--primary">Crear</button>
      </form>
    }

    @if (loading()) {
      <p class="mt-6" style="color: var(--gris);">Cargando…</p>
    } @else {
      <ul class="mt-4 space-y-3">
        @for (u of users(); track u._id) {
          <li class="rounded-lg border p-3" style="border-color: var(--linea); background: var(--hueso-alt);" [style.opacity]="u.active ? 1 : 0.6">
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="font-medium">
                  {{ u.name }}
                  @if (u._id === me()) { <span class="text-xs font-normal" style="color: var(--gris);">(tú)</span> }
                </p>
                <p class="text-sm" style="color: var(--gris);">{{ u.email }}</p>
                <p class="mt-1 text-xs" style="color: var(--gris);">
                  {{ u.role === 'ADMIN' ? 'Administra todo' : 'Carga muebles y fotos' }}
                  · {{ u.active ? 'Con acceso' : 'Sin acceso' }}
                  @if (u.lastLoginAt) { · Última entrada {{ u.lastLoginAt.slice(0, 10) }} }
                </p>
              </div>
              <div class="flex flex-wrap gap-2">
                <select
                  [ngModel]="u.role"
                  (ngModelChange)="setRole(u, $event)"
                  [disabled]="busy() || u._id === me()"
                  class="admin-input"
                  style="width: auto; padding: 0.3rem 0.5rem; font-size: 0.8rem;"
                  aria-label="Qué puede hacer"
                >
                  <option value="EDITOR">Carga muebles y fotos</option>
                  <option value="ADMIN">Administra todo</option>
                </select>
                <button type="button" (click)="resetPassword(u)" [disabled]="busy()" class="admin-btn admin-btn--sm">Nueva contraseña</button>
                <button type="button" (click)="toggleActive(u)" [disabled]="busy() || u._id === me()" class="admin-btn admin-btn--sm">
                  {{ u.active ? 'Quitar acceso' : 'Dar acceso' }}
                </button>
              </div>
            </div>
          </li>
        }
      </ul>
    }
  `,
})
export class AdminUserList {
  private auth = inject(AuthService);
  private service = inject(AdminContentService);
  private undo = inject(UndoService);

  users = signal<AdminUserRow[]>([]);
  loading = signal(true);
  busy = signal(false);
  error = signal<string | null>(null);
  showNew = signal(false);
  draft: Draft = { ...EMPTY };

  me = () => this.auth.user()?.id ?? '';

  constructor() {
    this.load();
  }

  load() {
    this.service.listUsers().subscribe({
      next: (list) => {
        this.users.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar los usuarios.');
        this.loading.set(false);
      },
    });
  }

  private replace(row: AdminUserRow) {
    this.users.update((list) => list.map((u) => (u._id === row._id ? row : u)));
  }

  private async run(fn: () => Promise<void>, fallback: string) {
    this.busy.set(true);
    this.error.set(null);
    try {
      await fn();
    } catch (e: unknown) {
      this.error.set(apiErrorMessage(e, fallback));
    } finally {
      this.busy.set(false);
    }
  }

  create() {
    if (!this.draft.name || !this.draft.email || this.draft.password.length < 8) {
      this.error.set('Nombre, correo y una contraseña de al menos 8 caracteres.');
      return;
    }
    this.run(async () => {
      const row = await firstValueFrom(this.service.createUser(this.draft));
      this.users.update((list) => [...list, row]);
      this.draft = { ...EMPTY };
      this.showNew.set(false);
    }, 'No se pudo crear el usuario.');
  }

  setRole(u: AdminUserRow, role: AdminRole) {
    this.run(async () => {
      this.replace(await firstValueFrom(this.service.updateUser(u._id, { role })));
    }, 'No se pudo cambiar el rol.');
  }

  toggleActive(u: AdminUserRow) {
    const active = !u.active;
    this.run(async () => {
      this.replace(await firstValueFrom(this.service.updateUser(u._id, { active })));
      if (!active) {
        this.undo.offer(`${u.name} ya no tiene acceso.`, async () => {
          this.replace(await firstValueFrom(this.service.updateUser(u._id, { active: true })));
        });
      }
    }, 'No se pudo cambiar el acceso.');
  }

  resetPassword(u: AdminUserRow) {
    const password = prompt(`Contraseña nueva para ${u.name} (mínimo 8 caracteres):`);
    if (password === null) return;
    if (password.length < 8) {
      this.error.set('La contraseña necesita al menos 8 caracteres.');
      return;
    }
    this.run(async () => {
      this.replace(await firstValueFrom(this.service.updateUser(u._id, { password })));
    }, 'No se pudo cambiar la contraseña.');
  }
}
