import type { ImageLoaderConfig } from '@angular/common';

/**
 * Loader de `NgOptimizedImage`. Las fotos de producto se guardan como URLs completas de
 * Cloudinary; este loader les inyecta la transformación de entrega (formato y calidad
 * automáticos + límite de ancho por el `width` que pide NgOptimizedImage). Cualquier otra
 * URL (las `/fotos/...` locales) se devuelve sin tocar.
 */
export function catalogImageLoader(config: ImageLoaderConfig): string {
  const src = config.src;
  const marker = '/image/upload/';
  const i = src.indexOf(marker);
  if (!src.includes('res.cloudinary.com') || i === -1) return src;

  const after = i + marker.length;
  const rest = src.slice(after).replace(/^v\d+\//, ''); // quita el /vNNN/ redundante
  const tx = ['f_auto', 'q_auto', 'c_limit'];
  if (config.width) tx.push(`w_${config.width}`);
  return `${src.slice(0, after)}${tx.join(',')}/${rest}`;
}
