/**
 * Etiqueta de medidas que el comprador entiende: en salas y comedores el numero de
 * puestos va antes que los centimetros (docs/convenciones de CLAUDE.md). Un producto
 * personalizable no muestra medidas fijas.
 */
export function measureLabel(input: {
  personalizable?: boolean;
  seats?: number;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
}): string {
  if (input.personalizable) return 'Se fabrica a la medida';

  const dims =
    input.widthCm && input.heightCm && input.depthCm
      ? `${input.widthCm} × ${input.heightCm} × ${input.depthCm} cm`
      : null;

  if (input.seats && dims) return `${input.seats} puestos · ${dims}`;
  if (input.seats) return `${input.seats} puestos`;
  return dims ?? 'Medidas a confirmar';
}
