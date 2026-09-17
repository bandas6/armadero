import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SeoService } from '../../core/services/seo.service';
import { UndoService } from './undo.service';

interface Tab {
  path: string;
  label: string;
  exact: boolean;
  /** Solo lo ve el ADMIN. El EDITOR carga muebles, fotos, categorías y colecciones. */
  adminOnly?: boolean;
}

const TABS: Tab[] = [
  { path: '/admin', label: 'Muebles', exact: true },
  { path: '/admin/categorias', label: 'Categorías', exact: false },
  { path: '/admin/colecciones', label: 'Colecciones', exact: false },
  { path: '/admin/cotizaciones', label: 'Cotizaciones', exact: false },
  { path: '/admin/banners', label: 'Inicio', exact: false, adminOnly: true },
  { path: '/admin/envios', label: 'Envíos', exact: false, adminOnly: true },
  { path: '/admin/ajustes', label: 'Ajustes', exact: false, adminOnly: true },
  { path: '/admin/usuarios', label: 'Usuarios', exact: false, adminOnly: true },
];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen" style="background: var(--hueso);">
      <header
        class="sticky top-0 z-30 border-b"
        style="border-color: var(--linea); background: var(--hueso-alt);"
      >
        <div class="mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-4 py-3">
          <a
            routerLink="/admin"
            class="inline-flex items-center font-semibold tracking-wide"
            style="color: var(--tinta); min-height: 2.75rem;"
          >
            ARTEMADERO · Panel
          </a>
          <div class="flex items-center gap-3 text-sm">
            <a
              routerLink="/admin/cuenta"
              class="inline-flex items-center underline"
              style="color: var(--gris); min-height: 2.75rem;"
            >
              {{ auth.user()?.name }}
            </a>
            <button
              type="button"
              (click)="logout()"
              class="inline-flex cursor-pointer items-center px-2 underline"
              style="color: var(--hoja); min-height: 2.75rem;"
            >
              Salir
            </button>
          </div>
        </div>
        <nav class="mx-auto flex max-w-[1120px] gap-1 overflow-x-auto px-2 text-sm">
          @for (tab of tabs(); track tab.path) {
            <a
              [routerLink]="tab.path"
              [routerLinkActiveOptions]="{ exact: tab.exact }"
              routerLinkActive
              #rla="routerLinkActive"
              class="inline-flex min-h-11 items-center whitespace-nowrap border-b-2 px-3"
              [style.border-color]="rla.isActive ? 'var(--hoja)' : 'transparent'"
              [style.color]="rla.isActive ? 'var(--tinta)' : 'var(--linea-fuerte)'"
              [style.font-weight]="rla.isActive ? '600' : '400'"
            >
              {{ tab.label }}
            </a>
          }
        </nav>
      </header>

      <main class="mx-auto max-w-[1120px] px-4 py-6">
        <router-outlet />
      </main>

      <!-- Aviso de "deshacer": fijo abajo, visible mientras dura la oferta. -->
      @if (undo.current(); as offer) {
        <div
          role="status"
          class="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm shadow-lg"
          style="background: var(--tinta); color: var(--hueso);"
        >
          <span>{{ offer.message }}</span>
          <button
            type="button"
            (click)="undo.run()"
            [disabled]="undo.busy()"
            class="min-h-11 shrink-0 rounded px-3 font-semibold underline disabled:opacity-60"
            style="color: #fff;"
          >
            Deshacer
          </button>
        </div>
      }
    </div>
  `,
})
export class AdminLayout {
  readonly auth = inject(AuthService);
  readonly undo = inject(UndoService);
  private router = inject(Router);

  readonly tabs = computed(() => {
    const role = this.auth.user()?.role;
    return TABS.filter((t) => !t.adminOnly || role === 'ADMIN');
  });

  constructor() {
    inject(SeoService).setPage({ title: 'Panel', path: '/admin', noindex: true });
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
