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

1. **Hero con foto de fondo y placa de texto.** Ocupa el 82 % del alto de pantalla, con
   tope de 760 px. La foto va de fondo a sangre y **casi limpia**: encima solo lleva una
   sombra suave del 20 al 35 % para dar cohesión, más un degradado que oscurece la base
   donde viven las franjas de material.

   El texto NO se apoya en el velo: va sobre una **placa** oscura semitransparente
   (`#12151799`) con `backdrop-filter: blur(3px)`, filete de 5 px en `--hoja` a la
   izquierda y esquinas asimétricas (recta contra el filete, `--r-bloque` al otro lado).
   Así el contraste queda garantizado en la placa sin oscurecer el resto de la foto. Dentro
   de la placa: antetítulo, titular, subtítulo, las cuatro garantías en cuadrícula 2 × 2
   con su propio fondo, los dos botones con el horario al lado, y la línea de micro-claims
   con puntos verdes.

   **Cuidado con el orden de capas:** la placa y sus contenedores llevan
   `pointer-events:none` y solo los enlaces recuperan `pointer-events:auto`. En el mockup
   eso permite soltar la foto de fondo; en producción evita que la placa bloquee lo que
   tenga debajo.

   En la esquina superior derecha va `marca/guirnalda.png` con su `srcset` a 2x —
   decorativa: `alt=""`, `aria-hidden="true"`, `pointer-events:none`, 198 px de ancho con
   tope del 30 % y separada del borde para que el follaje no se corte.

   Al pie de la banda, el corte **Tejido | Madera** como dos franjas con su filete de
   color, su conteo de categorías y su flecha. Es la primera de las tres apariciones del
   corte y no se puede quitar.

   La foto de fondo debe ser la más limpia que tenga la clienta — una sala o un comedor
   completo, no un primer plano. Al revelarse casi entera, es la única imagen del sitio
   donde la calidad importa de verdad.

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
