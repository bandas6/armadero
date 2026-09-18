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

// Horario de respaldo hasta que llega /api/settings (Vanessa lo edita en el panel). Las
// abreviaturas llevan espacio duro entre "a." y "m." para que la hora no se parta en dos
// lineas en la columna angosta del pie.
export const HOURS_WEEKDAY = '8:30 a. m. – 5:30 p. m.';
export const HOURS_SATURDAY = '7:30 a. m. – 3:00 p. m.';

/**
 * Una linea, para poner debajo de un boton de cotizar. Empieza en minuscula a proposito:
 * siempre va dentro de una frase ("Contestamos de lunes a viernes...").
 */
export const BUSINESS_HOURS =
  'de lunes a viernes de 8:30 a. m. a 5:30 p. m., y sábados de 7:30 a. m. a 3:00 p. m.';

export const CITY = 'Cali, Valle del Cauca';

/**
 * La direccion del local y el año de fundacion viven en Ajustes del panel
 * (settings.storeAddress / settings.foundingYear). Mientras no esten, el pie muestra este
 * texto y el bloque de historia se arma sin el año.
 */
export const STORE_ADDRESS_FALLBACK = 'Dirección pendiente de confirmar';

/** Enlace a wa.me con el mensaje ya escrito. */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** El mensaje generico: "quiero cotizar un mueble". */
export const WHATSAPP_GENERIC_URL = whatsappUrl('Hola Artemadero, quiero cotizar un mueble.');

/**
 * La portada de siempre: la foto y las frases con las que abre el inicio cuando no hay
 * ninguna portada encendida en el panel.
 *
 * Vive aqui, y no suelta en home.html, porque el panel la muestra tal cual en el bloque
 * "Si no hay ninguna portada encendida": si estuviera copiada en dos sitios, el panel
 * acabaria ensenando una portada que ya no es la que sale.
 */
export const PORTADA_POR_DEFECTO = {
  eyebrow: 'Muebles campestres y tejidos · Cali',
  title: 'Lo tejemos y lo armamos aquí mismo.',
  subtitle:
    'Taller propio. Casi todo se fabrica con las medidas de tu espacio, en el tejido y el ' +
    'acabado que escojas.',
  /** Relativa a filesUrl: la sirve la API junto con el resto de las fotos. */
  photoPath: '/fotos/salas-tejidas/salas-tejidas-03.webp',
  alt: 'Sala tejida en fibra natural con mesa de centro, en el local de Artemadero',
} as const;
