export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  // Origen de las fotos servidas por la API (/fotos/...). En producción la web y la API
  // van al mismo origen, así que queda vacío. Ver Fase 6 (CDN).
  filesUrl: 'http://localhost:3000',
  // Dominio del sitio, solo como respaldo para canonical/og:url en SSR cuando no se
  // puede leer el host del request. En prod se pone el dominio real.
  siteUrl: 'http://localhost:4200',
};
