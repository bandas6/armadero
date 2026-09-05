import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Deja pasar solo con sesión. Espera el intento inicial de restaurar sesión (cookie de
 * refresh) antes de decidir, para no mandar al login a alguien que sí tiene sesión.
 */
export const adminGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.ready;
  if (auth.isAuthenticated()) return true;

  return router.parseUrl(`/admin/login?returnUrl=${encodeURIComponent(state.url)}`);
};
