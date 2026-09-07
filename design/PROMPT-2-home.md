# Prompt 2 de 4 — El home

Requiere que el prompt 1 esté hecho y revisado: tokens, layout, encabezado y pie
funcionando.

---

```
Ahora el home, siguiendo `design/direccion-03-tejido-o-madera/index.html` y
`docs/estructura-home.md`. Vuelve a abrir el mockup: los valores de espaciado y los
tamaños relativos de tipografía salen de ahí.

## Contexto de por qué el home es así

La estructura viene de un competidor que le gustó al desarrollador, ya traducida a este
negocio en `docs/estructura-home.md`. Ese documento manda. Dos ajustes sobre el original
son obligatorios y están ya resueltos en el mockup:

1. **La grilla de categorías no es plana.** Es tipo de mueble → tejido o madera. Ese corte
   es el diferenciador de Artemadero y ningún competidor lo tiene.
2. **Varios productos muestran "Precio según medidas"** en vez de una cifra. Tiene que
   verse resuelto y deliberado, no como un hueco donde faltó el dato.

## Las siete secciones, en orden

1. **Hero partido en dos mitades: Tejido | Madera.** Cada mitad con su texto, su foto en
   relación de aspecto fija y su acceso al catálogo filtrado. La mitad de tejido lleva un
   filete `--tejido`; la de madera, uno `--madera`. En la esquina superior derecha va
   `marca/guirnalda.png` con su `srcset` a 2x — decorativa: `alt=""`,
   `aria-hidden="true"`, `pointer-events:none`, 208 px de ancho con tope del 38 % y
   separada del borde para que el follaje no se corte. En móvil las mitades se apilan.

2. **Del muestrario** — nueve productos destacados. Cada tarjeta: foto cuadrada, etiqueta
   de material (naranja o azul), nombre en Instrument Serif, categoría, y la cédula de
   medidas con borde: el dato grande arriba (puestos, o el ancho si no aplica) y los
   centímetros debajo. Luego el precio, o "Precio según medidas" en `--hoja`. Cierra con
   "Ver todo el catálogo" centrado.

3. **Lo hacemos nosotros mismos** — bloque de historia. Texto y foto del taller, a dos
   columnas. Construye la confianza que hace falta para que alguien escriba por WhatsApp.

4. **Cómo trabajamos** — tres pilares, cada uno con foto propia: tejido a mano, madera y
   guadua, a la medida. Tres, no cuatro, y nunca con iconos genéricos de stock: se notan.

5. **¿Tienes las medidas a mano?** — llamado a cotizar. Foto a un lado, titular y botón al
   otro, con el horario de atención inmediatamente debajo del botón.

6. **Preguntas frecuentes** — seis, respondidas en dos líneas cada una. Son las dudas que
   hoy se resuelven por WhatsApp; contestarlas antes baja el trabajo del chat. El texto
   exacto está en el mockup.

7. **Pie** — ya lo hiciste en el paso anterior.

## Fotografía

Las fotos de la clienta son de celular, tomadas en el andén del local, con carros y avisos
al fondo. Esto condiciona el diseño y ya está resuelto en el mockup: **toda imagen va
recortada a relación de aspecto fija y ninguna sección depende de una foto grande a
sangre.** No cambies eso por una foto a pantalla completa.

Usa `NgOptimizedImage` en todas. `loading="lazy"` fuera del viewport. Las fotos van a
Cloudinary con transformaciones de tamaño por CDN; en el mockup hay un componente
`image-slot.js` que es solo para la presentación y no va al proyecto.

`alt` real y descriptivo en cada imagen de producto — el nombre del mueble y su material,
no "foto de producto".

## Datos

Los nueve productos del muestrario están en el mockup con sus nombres, categorías,
medidas y precios. Móntalos como datos de siembra (`api/src/seed/`) siguiendo los esquemas
de `api/src/models/`, no como texto fijo en la plantilla.

Los precios son provisionales: la clienta todavía no los ha dado. Se muestran como valor
estimado, formato `$ 3.900.000`, enteros, nunca float.

Cuando termines, muéstrame el home completo en escritorio y en 360 px antes de seguir con
el catálogo.
```
