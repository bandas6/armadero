# Prompt para implementar la dirección 03 en el proyecto Angular

Este archivo es para pegar en Claude Code, **dentro del repo**. El mockup elegido es
`design/direccion-03-tejido-o-madera/index.html`. Ábrelo antes de pegar el prompt: es la
referencia visual, no el código a copiar.

---

## Bloque para pegar

```
Implementa el frontend del catálogo siguiendo la dirección de diseño aprobada.

## Referencia visual

`design/direccion-03-tejido-o-madera/index.html` es el mockup aprobado por la clienta.
Ábrelo y léelo completo antes de escribir código. Es HTML estático con estilos en línea:
NO lo copies tal cual al proyecto. Extrae de ahí los valores —colores, tipografías,
tamaños, espaciados, estructura de cada sección— y reescríbelo como componentes Angular
con Tailwind y custom properties, según las convenciones de `CLAUDE.md`.

También son obligatorios: `docs/cliente.md`, `docs/estructura-home.md`,
`docs/brief-diseno.md`, `docs/modelo-datos.md` y los esquemas en `api/src/models/`.

## Sistema visual de la dirección 03

Tokens de color (defínelos como custom properties CSS, no como clases sueltas):

  --hueso    #F7F6F2   fondo general
  --tinta    #191C1E   texto y bordes fuertes
  --tejido   #A8641E   código de material: tejido
  --madera   #3A5A6B   código de material: madera
  --hoja     #42604B   acciones, enlaces, "Precio según medidas"
  --gris     #5E6467   texto secundario

Tipografías (Google Fonts): **Instrument Serif** solo en titulares grandes;
**IBM Plex Sans** en todo lo demás. No introduzcas una tercera familia.

La idea que sostiene el diseño: **el sitio entero está partido en tejido y madera**. Ese
corte aparece en el home como dos mitades, en el catálogo como un conmutador que
reestructura la retícula, y en cada ficha como el enlace a la pieza gemela en el otro
material. No lo degrades a un checkbox más.

## Qué construir

Home, en este orden (está en `docs/estructura-home.md`):

1. Hero partido en dos mitades: Tejido | Madera, cada una con su foto y su acceso.
2. Del muestrario — 9 productos destacados.
3. Lo hacemos nosotros mismos — bloque de historia.
4. Cómo trabajamos — tres pilares con foto propia.
5. ¿Tienes las medidas a mano? — llamado a cotizar con el horario al lado.
6. Preguntas frecuentes — seis, respondidas corto.
7. Pie: local, horario, WhatsApp, Instagram, Facebook.

Catálogo: conmutador tejido/madera de primer nivel, fichas de categoría con conteo,
retícula densa. Las subcategorías sin fotos no se ocultan: se muestran como "las
fabricamos, escríbenos" con enlace a WhatsApp.

Ficha: galería, selector de variantes, cédula de medidas, bloque de la versión gemela en
el otro material, material, garantía, tiempo de fabricación y el botón de cotizar.

## Reglas que no se negocian

- Las medidas son contenido principal. En salas y comedores el número de puestos va
  antes que los centímetros. Orden: ancho × alto × profundidad, en cm.
- "Se fabrica a la medida" y "Precio según medidas" son un caso de primera clase: mismo
  tamaño y peso tipográfico que un precio normal, en --hoja. Nunca un hueco ni un
  "consultar".
- El botón dice "Cotizar por WhatsApp". Nunca "Comprar" ni "Pagar". El horario de
  atención va cerca: lunes a viernes 8:30 a. m. – 5:30 p. m., sábado 7:30 a. m. – 3:00 p. m.
- Precios como valor estimado, formato `$ 3.900.000`, enteros, nunca float. El flete se
  acuerda en la conversación.
- La cotización se persiste en la base de datos ANTES de redirigir a WhatsApp. Sin
  excepción.
- Nunca pedir ni almacenar datos de tarjeta, cédula ni información financiera.

## Fotografía

Las fotos son de celular, tomadas en el andén del local. Toda imagen va recortada a
relación de aspecto fija y ninguna sección puede depender de una foto grande a sangre.
Usa `NgOptimizedImage` en todas, `priority` en la principal de la ficha y `loading="lazy"`
fuera del viewport.

## Piso de calidad

Móvil primero, responsive hasta 360 px. Foco de teclado visible, contraste AA, `alt` real
en cada imagen de producto, `prefers-reduced-motion` respetado. SSR activo, meta tags por
producto y categoría, `Schema.org/Product`. Copy en español de Colombia, tuteo, voz
activa, sin superlativos de agencia. Código en inglés.

## Orden de trabajo

Empieza por los tokens y el layout (header, footer, navegación), sigue con el home, luego
catálogo y por último la ficha. Muéstrame cada pantalla antes de pasar a la siguiente.

Dos datos faltan y no los inventes: el año de fundación del negocio y la dirección del
local. Déjalos marcados como pendientes y pregúntamelos.
```

---

## Nota sobre el mockup

Los espacios de foto del mockup son un componente (`image-slot.js`) que solo sirve para la
presentación: permite arrastrar fotos y verlas en su sitio. En el proyecto real se
reemplaza por `NgOptimizedImage` contra las imágenes de Cloudinary.
