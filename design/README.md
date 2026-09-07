# Artemadero — tres direcciones de diseño

Mockups de presentación para Vanessa. Mismo contenido, mismos productos y mismos precios
en las tres: lo único que cambia es el diseño.

Cada archivo es una sola página con las tres pantallas que deciden la venta —
**Home**, **Catálogo** y **Ficha de producto** — enlazadas desde el menú superior.

```
design/
  direccion-01-puestos/index.html            abre con doble clic
  direccion-02-a-la-medida/index.html
  direccion-03-tejido-o-madera/index.html
  image-slot.js                             lo usan las tres, no borrar
```

## Las fotos las pones tú

Cada espacio de foto es un recuadro rotulado que dice qué va ahí ("Mecedora Buga — foto
del andén, con carro al fondo"). **Arrastra la foto encima y se queda guardada** en ese
navegador. No hay fotos de banco de imágenes: el sitio se ve con los muebles reales o no
se ve. Vale la pena poner a propósito una o dos fotos del andén para comprobar que el
diseño las aguanta — están previstas.

## Lo que es igual en las tres

- El botón dice **Cotizar por WhatsApp** y abre el chat con un mensaje ya escrito que
  nombra el mueble. No hay carrito, ni "Comprar", ni "Añadir".
- **Precio según medidas** es un estado normal y visible, no un hueco ni un "consultar".
  Los que sí tienen precio lo muestran completo.
- Medidas en centímetros, en orden ancho × alto × profundidad, como contenido principal.
- El horario de atención aparece junto al botón, para que nadie escriba a medianoche
  esperando respuesta.
- Se puede pedir en otra medida, otro tejido u otro acabado: se dice con todas las letras.
- Las categorías sin fotos aún (butacos de madera, espejos de madera) se muestran como
  "los fabricamos, escríbenos", nunca como una casilla vacía.

## Comparación

| | 01 · Puestos | 02 · A la medida | 03 · Tejido o madera |
|---|---|---|---|
| **Idea** | La medida que el comprador entiende primero: cuánta gente se sienta | La ficha no vende un producto, abre un pedido | El corte del catálogo es la estructura del sitio |
| **Rasgo distintivo** | Diagrama de puestos: un punto por silla, y en la ficha un plano con la mesa y las seis sillas alrededor | Panel que redacta el WhatsApp en vivo mientras eliges tejido, puestos y acabado | Home partido en dos mitades y catálogo con conmutador que reestructura la retícula |
| **Cómo trata el precio variable** | "Precio según medidas" en verde, al mismo tamaño que un precio normal | Es el centro: el panel explica qué falta para dar el número, con rango orientativo | Cédula con borde: puestos grande arriba, centímetros debajo, precio o "según medidas" |
| **Densidad** | Alta — 4 columnas, tarjeta con marco sólido | Media — 3 columnas, mucho aire alrededor del panel | Alta en catálogo, dos bloques grandes en home |
| **Peso de la foto** | Contenida, cuadrada, con marco | Media, 4:3, la carga la lleva el panel | Contenida, cuadrada, mucha estructura alrededor |
| **Color** | Verde monte y cal, amarillo señal solo en marcas de medida | Índigo y papel, teal para todo lo de pedido | Hueso y tinta, naranja tejido / azul madera como código |
| **Tipografía** | Archivo Narrow en versalitas + Source Sans 3 | Bricolage Grotesque + Public Sans | Instrument Serif + IBM Plex Sans |

## Cuándo favorece cada una

**01 · Puestos** — si lo que más preguntan por WhatsApp es "¿de cuántos puestos es?". Ese
dato pasa a ser lo primero que se ve en cada tarjeta, y la ficha lo dibuja. Es la más
densa y la que mejor tolera fotos irregulares, porque el marco y la retícula ordenan.
Los productos sin puestos (lámparas, espejos, mecedoras) llevan la cota de ancho.

**02 · A la medida** — si el negocio es sobre todo pedido personalizado y el problema real
es que la gente escribe sin decir qué necesita. El panel obliga a armar el mensaje
completo antes de enviarlo, así que las conversaciones llegan con material, medida y
acabado ya definidos. Menos producto por pantalla; más calidad de conversación.

**03 · Tejido o madera** — si el corte que más usa la clienta al hablar es "eso lo tenemos
tejido y en madera". El sitio entero se organiza así, y cada ficha ofrece la versión
gemela en el otro material. Es la que mejor comunica el tamaño real del catálogo (9
categorías tejidas contra 3 en madera) sin que la línea corta se vea rota.

## Notas técnicas

- HTML autocontenido, sin build ni instalación: se abre con doble clic. Estilos en línea;
  fuentes desde Google Fonts.
- Responsive hasta 360 px, foco de teclado visible, áreas de toque de 44 px como mínimo,
  `prefers-reduced-motion` respetado, recorte fijo en cada foto para que el layout no
  salte al cargar.
- Los filtros y los selectores de variante son estáticos: son mockups de presentación.
- Enlaces de WhatsApp a +57 316 254 2637, con mensaje prellenado por producto.

## Pendiente de confirmar con Vanessa

Logo, si quiere mostrar precios o dejar todo en "según medidas", cuáles fotos son de
piezas propias y cuáles de referencia, y los precios — los de los mockups son
provisionales y están marcados como tales.

Los mockups anteriores, hechos antes de recibir el brief y con otra marca, quedaron
archivados en `archivo-espiga/`.
