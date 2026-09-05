import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, switchMap, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

const ADMIN_PREFIX = `${environment.apiUrl}/admin/`;
const AUTH_PREFIX = `${environment.apiUrl}/admin/auth/`;

/**
 * Pone el `Authorization: Bearer` en las llamadas del panel y, ante un 401, intenta UNA
 * rotación del refresh token y reintenta. Si la rotación falla, manda al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isAdmin = req.url.startsWith(ADMIN_PREFIX);
  const isAuthEndpoint = req.url.startsWith(AUTH_PREFIX);
  if (!isAdmin || isAuthEndpoint) return next(req);

  const auth = inject(AuthService);
  const router = inject(Router);

  const withToken = () => {
    const token = auth.accessToken;
    return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  };

  return next(withToken()).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }
      return from(auth.refresh()).pipe(
        switchMap((ok) => {
          if (!ok) {
            router.navigate(['/admin/login'], {
              queryParams: { returnUrl: router.url },
            });
            return throwError(() => err);
          }
          return next(withToken());
        }),
      );
    }),
  );
};
