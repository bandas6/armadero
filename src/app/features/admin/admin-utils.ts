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
