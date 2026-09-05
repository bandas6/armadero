import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { IMAGE_LOADER } from '@angular/common';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { catalogImageLoader } from './core/image-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    provideClientHydration(),
    // withFetch: usa fetch en vez de XHR, necesario para que las llamadas HTTP
    // funcionen igual en el servidor (SSR) y en el navegador.
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    { provide: IMAGE_LOADER, useValue: catalogImageLoader },
  ],
};
