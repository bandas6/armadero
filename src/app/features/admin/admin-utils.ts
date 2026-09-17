/** Mensaje legible de un error HTTP del API (error de dominio o detalles de Zod). */
export function apiErrorMessage(e: unknown, fallback: string): string {
  const err = e as { error?: { error?: string; details?: { message: string }[] } };
  return (
    err?.error?.error ??
    err?.error?.details?.map((d) => d.message).join(' ') ??
    fallback
  );
}

/** "2026-09-14T…" -> "2026-09-14" para un <input type="date">, o ''. */
export function toDateInput(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : '';
}

/** Lo contrario: '' -> null (borra la fecha). */
export function fromDateInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

// ---- Fechas en palabras ----
//
// "2026-09-12" no le dice nada a nadie (design/panel/REGLAS-COMUNES.md §4 y
// design/panel/PROMPT-08-usuarios.md). En el panel las fechas se leen, no se calculan.

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** "28 de julio", y con el año cuando no es el que corre: "28 de julio de 2025". */
export function fechaHumana(iso: string | null | undefined, ahora = new Date()): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const base = `${d.getDate()} de ${MESES[d.getMonth()]}`;
  return d.getFullYear() === ahora.getFullYear() ? base : `${base} de ${d.getFullYear()}`;
}

/**
 * Cuánto hace de algo, dicho como se dice hablando: "hace un momento", "ayer",
 * "hace 2 días" y, cuando ya es lejano, la fecha. Devuelve null si nunca pasó.
 */
export function haceCuanto(iso: string | null | undefined, ahora = new Date()): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  const minutos = Math.floor((ahora.getTime() - d.getTime()) / 60000);
  if (minutos < 60) return 'hace un momento';

  // Por días de calendario, no por múltiplos de 24 h: a las 2 a. m. "ayer" es ayer.
  const dia = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dias = Math.round((dia(ahora) - dia(d)) / 86400000);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias < 30) return `hace ${dias} días`;
  return fechaHumana(iso, ahora);
}
