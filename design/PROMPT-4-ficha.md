# Prompt 4 de 4 — Ficha de producto y cotización

Requiere el catálogo hecho y revisado. Este es el paso donde se cierra la venta: la parte
más delicada del proyecto.

---

```
Ahora la ficha de producto y el flujo de cotización, siguiendo
`design/direccion-03-tejido-o-madera/index.html`.

## La ficha

De arriba abajo, como en el mockup:

1. **Migas de pan** — Catálogo · Tipo · Subcategoría.
2. **Galería** — foto principal en relación de aspecto fija más una tira de miniaturas.
   Usa `repeat(3, minmax(0, 1fr))` o equivalente en la tira: con `1fr` a secas las
   miniaturas se desbordan en móvil.
3. **Etiqueta de material** y nombre en Instrument Serif.
4. **Descripción** — precisa, describiendo el mueble. Sin lenguaje de agencia.
5. **Cédula de medidas** — el bloque con borde y las cifras grandes: ancho, alto, fondo, y
   el alto del asiento cuando aplica. Debajo, la nota práctica de espacio que necesita.
6. **La versión gemela en el otro material** — bloque con foto pequeña, nombre, medidas,
   precio y enlace. Es una de las tres apariciones del corte tejido/madera y le da sentido
   al catálogo entero. Cuando un producto no tenga gemelo, omite el bloque limpiamente.
7. **Selector de variantes** — tela del cojín, acabado, tejido. Funcional: cambia la foto
   y el mensaje de cotización.
8. **Precio** — o "Precio según medidas" en `--hoja`. Como valor estimado. Debajo, que el
   flete se acuerda por WhatsApp.
9. **Tabla de datos** — material, tiempo de fabricación, garantía, personalización.
10. **Botón "Cotizar por WhatsApp"** con el horario de atención justo debajo.

## El flujo de cotización — la regla más importante del proyecto

Lee `docs/modelo-datos.md` y `api/src/services/quote.service.ts` antes de escribir esto.

El usuario navega, arma un carrito o selecciona un producto, llena un formulario mínimo
—nombre, ciudad, nota opcional— y el sistema lo redirige a WhatsApp con un mensaje
prearmado que contiene los productos, referencias, cantidades, total estimado y el código
de cotización.

**Antes de redirigir, la cotización se guarda en la base de datos.** Ese registro es la
única visibilidad del embudo de ventas. Nunca redirijas a WhatsApp sin haber persistido
primero. Si el guardado falla, no redirijas: muestra el error y ofrece reintentar.

Consecuencias:

- El teléfono no es obligatorio en el formulario: WhatsApp ya lo entrega.
- Nunca pidas ni almacenes datos de tarjeta, cédula ni información financiera.
- El botón se llama "Cotizar por WhatsApp". Nunca "Pagar" ni "Comprar".
- Valida la entrada con Zod en la ruta pública.

## Carrito

Signals más persistencia en `localStorage`. Un panel o página que liste lo agregado con
cantidades, el total estimado —marcado como estimado— y el paso al formulario.

Cuando un producto es personalizable y no tiene precio, el total no puede quedar roto:
muestra el subtotal de lo que sí tiene precio y una línea que diga cuántos ítems se cotizan
según medidas.

## Rendimiento e indexación

- `NgOptimizedImage` en todas las imágenes, con `priority` en la principal de la ficha.
- Transformaciones de tamaño por CDN. Es el principal riesgo de rendimiento del sitio: un
  catálogo de muebles vive de fotos pesadas.
- Meta tags por producto y datos estructurados `Schema.org/Product` con `offers.price` y
  `availability`. Para los productos sin precio fijo, modela la oferta de forma que no
  declare un precio falso.
- Sitemap generado.

## Piso de calidad

Móvil primero, responsive hasta 360 px — la mayoría del tráfico llega por celular y
termina en WhatsApp, que es una app móvil. Áreas de toque de 44 px mínimo. Foco visible,
contraste AA, `alt` obligatorio y descriptivo en imágenes de producto,
`prefers-reduced-motion` respetado.

Cuando termines, muéstrame la ficha completa y hazme una prueba del flujo de cotización de
punta a punta: que la cotización quede en la base de datos y que el mensaje de WhatsApp
salga bien armado.
```
