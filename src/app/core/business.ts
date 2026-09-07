/**
 * Datos del negocio que la interfaz repite en varias pantallas. Viven aqui y no
 * copiados en cada plantilla: el horario aparece cinco veces y el numero de WhatsApp,
 * seis.
 *
 * Cuando la API trae el dato en /api/settings (horario, redes, enlace de contacto), ese
 * gana: la clienta lo edita desde el panel. Lo de aqui es el respaldo para el primer
 * render y para SSR cuando la API no responde.
 */

/** Internacional sin +, como lo pide wa.me. */
export const WHATSAPP_NUMBER = '573162542637';

/** El mismo numero como lo lee una persona. */
export const WHATSAPP_DISPLAY = '+57 316 254 2637';

// Las abreviaturas llevan espacio duro entre "a." y "m." para que la hora no se parta en
// dos lineas en la columna angosta del pie.
export const BUSINESS_HOURS_WEEKDAY = 'Lunes a viernes: 8:30 a. m. – 5:30 p. m.';
export const BUSINESS_HOURS_SATURDAY = 'Sábado: 7:30 a. m. – 3:00 p. m.';

/**
 * Una linea, para poner debajo de un boton de cotizar. Empieza en minuscula a proposito:
 * siempre va dentro de una frase ("Contestamos de lunes a viernes...").
 */
export const BUSINESS_HOURS =
  'de lunes a viernes de 8:30 a. m. a 5:30 p. m., y sábados de 7:30 a. m. a 3:00 p. m.';

export const CITY = 'Cali, Valle del Cauca';

/**
 * PENDIENTE — falta preguntarle a la clienta la direccion del local. No inventar una:
 * va en el pie y en los datos estructurados del negocio. Ver docs/pendientes-diseno.md.
 */
export const STORE_ADDRESS: string | null = null;
export const STORE_ADDRESS_FALLBACK = 'Dirección pendiente de confirmar';

/**
 * PENDIENTE — falta el año de fundacion. "Fabricamos desde 2011" es lo que sostiene el
 * bloque de historia del home; sin el dato el bloque funciona, pero mejora mucho con el.
 * Ver docs/pendientes-diseno.md.
 */
export const FOUNDING_YEAR: number | null = null;

/** Enlace a wa.me con el mensaje ya escrito. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** El mensaje generico: "quiero cotizar un mueble". */
export const WHATSAPP_GENERIC_URL = whatsappUrl('Hola Artemadero, quiero cotizar un mueble.');
