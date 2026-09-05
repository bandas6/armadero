// TODO(despliegue): reemplazar por los valores reales en producción (ver docs/despliegue.md).
export const environment = {
  production: true,
  apiUrl: '/api',
  filesUrl: '',
  // TODO(despliegue): el dominio real, ej. 'https://artemadero.co'. Se usa como respaldo
  // para canonical/og:url en SSR; en la práctica el host del request suele bastar.
  siteUrl: '',
};
