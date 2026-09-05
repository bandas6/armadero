import { RenderMode, ServerRoute } from '@angular/ssr';

// El sitio público se renderiza en el servidor (SEO). El panel (/admin) va tras
// autenticación y no tiene valor SEO: se sirve como cáscara de cliente.
export const serverRoutes: ServerRoute[] = [
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
