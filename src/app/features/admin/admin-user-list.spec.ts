import { generarClave, revisarClave, MIN_CLAVE } from './admin-user-list';
import { fechaHumana, haceCuanto } from './admin-utils';

/**
 * Las dos piezas del rediseño de Usuarios que se pueden equivocar en silencio: la
 * contraseña que se genera (si sale corta, el API la rechaza después de que Vanessa ya
 * se la pasó a la persona) y las fechas en palabras.
 */
describe('Contraseña generada', () => {
  it('siempre pasa el mínimo que exige el API', () => {
    for (let i = 0; i < 200; i++) {
      expect(generarClave().length).toBeGreaterThanOrEqual(MIN_CLAVE);
    }
  });

  it('no repite la misma palabra dos veces', () => {
    for (let i = 0; i < 200; i++) {
      const [a, b] = generarClave().split('-');
      expect(a).not.toBe(b);
    }
  });

  it('se puede dictar por teléfono: solo letras sin tilde, cifras y guiones', () => {
    for (let i = 0; i < 200; i++) {
      expect(generarClave()).toMatch(/^[a-z]+-[a-z]+-\d{3}$/);
    }
  });

  it('dice en positivo cuando sirve, y cuánto falta cuando no', () => {
    expect(revisarClave('mimbre-roble-742')).toEqual({
      sirve: true,
      texto: 'Sirve: tiene 16 caracteres.',
    });
    expect(revisarClave('corta').sirve).toBe(false);
    expect(revisarClave('corta').texto).toContain('3 caracteres');
    expect(revisarClave('').texto).toContain('al menos 8');
  });
});

describe('Fechas en palabras', () => {
  const ahora = new Date('2026-09-17T15:00:00');

  it('dice el día y el mes, y el año solo cuando no es este', () => {
    expect(fechaHumana('2026-07-28T10:00:00', ahora)).toBe('28 de julio');
    expect(fechaHumana('2025-07-28T10:00:00', ahora)).toBe('28 de julio de 2025');
    expect(fechaHumana(null, ahora)).toBeNull();
  });

  it('cuenta por días de calendario, no por múltiplos de 24 horas', () => {
    expect(haceCuanto('2026-09-17T14:30:00', ahora)).toBe('hace un momento');
    expect(haceCuanto('2026-09-17T02:00:00', ahora)).toBe('hoy');
    expect(haceCuanto('2026-09-16T23:00:00', ahora)).toBe('ayer');
    expect(haceCuanto('2026-09-15T10:00:00', ahora)).toBe('hace 2 días');
  });

  it('cuando ya es lejano, deja de contar días y da la fecha', () => {
    expect(haceCuanto('2026-07-28T10:00:00', ahora)).toBe('28 de julio');
  });
});
