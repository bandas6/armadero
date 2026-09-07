/**
 * La cedula de medidas: el bloque con borde que llevan todas las tarjetas y la ficha.
 *
 * Son dos lineas y el orden importa. Arriba, grande, el dato que el comprador entiende
 * primero: los puestos en salas y comedores, el ancho en lo demas. Abajo, en pequeno, los
 * centimetros en orden ancho × alto × profundidad. Las medidas son contenido principal,
 * nunca letra chica en un acordeon (design/IMPLEMENTACION.md).
 *
 * Un mueble que se fabrica a la medida no deja el bloque vacio: muestra sus medidas de
 * referencia rotuladas como tales ("A la medida · ref. 240 × 75 × 85").
 */

export interface Measurable {
  seats?: number;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
  sizeLabel?: string;
}

export interface MeasureCard {
  /** La linea grande. */
  headline: string;
  /** La linea pequena, o null si no hay nada mas que decir. */
  detail: string | null;
}

/** "240 × 75 × 85", o null si falta alguna de las tres. */
export function dimensions(m: Measurable | null | undefined): string | null {
  if (!m?.widthCm || !m.heightCm || !m.depthCm) return null;
  return `${m.widthCm} × ${m.heightCm} × ${m.depthCm}`;
}

export function measureCard(
  m: Measurable | null | undefined,
  personalizable = false,
): MeasureCard {
  const dims = dimensions(m);

  if (m?.seats) {
    return {
      headline: `${m.seats} ${m.seats === 1 ? 'puesto' : 'puestos'}`,
      detail: dims ? (personalizable ? `A la medida · ref. ${dims}` : dims) : 'A la medida',
    };
  }

  if (m?.widthCm) {
    const rest = dims ? (personalizable ? `A la medida · ref. ${dims}` : dims) : m.sizeLabel ?? null;
    return { headline: `${m.widthCm} cm de ancho`, detail: rest };
  }

  if (personalizable) {
    return { headline: 'A la medida', detail: 'Dinos el espacio que tienes' };
  }

  return { headline: 'Medidas a confirmar', detail: m?.sizeLabel ?? null };
}

/** Una sola linea, para donde no cabe el bloque (carrito, panel, mensajes). */
export function measureLabel(
  m: Measurable | null | undefined,
  personalizable = false,
): string {
  const { headline, detail } = measureCard(m, personalizable);
  return detail ? `${headline} · ${detail}` : headline;
}
