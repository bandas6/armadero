import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen" style="background: var(--lino);">
      <header
        class="sticky top-0 z-30 border-b"
        style="border-color: color-mix(in srgb, var(--musgo) 40%, transparent); background: var(--blanco-taller);"
      >
        <div class="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <a routerLink="/admin" class="font-semibold tracking-wide" style="color: var(--grafito);">
            ARTEMADERO · Panel
          </a>
          <div class="flex items-center gap-3 text-sm">
            <span style="color: var(--texto-suave);">{{ auth.user()?.name }}</span>
            <button type="button" (click)="logout()" class="underline" style="color: var(--verde-guadua);">
              Salir
            </button>
          </div>
        </div>
        <nav class="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-2 text-sm">
          @for (tab of tabs; track tab.path) {
            <a
              [routerLink]="tab.path"
              [routerLinkActiveOptions]="{ exact: tab.exact }"
              routerLinkActive
              #rla="routerLinkActive"
              class="whitespace-nowrap border-b-2 px-3 py-2"
              [style.border-color]="rla.isActive ? 'var(--verde-guadua)' : 'transparent'"
              [style.color]="rla.isActive ? 'var(--grafito)' : 'var(--musgo)'"
              [style.font-weight]="rla.isActive ? '600' : '400'"
            >
              {{ tab.label }}
            </a>
          }
        </nav>
      </header>

      <main class="mx-auto max-w-3xl px-4 py-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayout {
  readonly auth = inject(AuthService);
  private router = inject(Router);

  readonly tabs = [
    { path: '/admin', label: 'Muebles', exact: true },
    { path: '/admin/categorias', label: 'Categorías', exact: false },
    { path: '/admin/cotizaciones', label: 'Cotizaciones', exact: false },
    { path: '/admin/ajustes', label: 'Ajustes', exact: false },
  ];

  constructor() {
    inject(SeoService).setPage({ title: 'Panel', path: '/admin', noindex: true });
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
