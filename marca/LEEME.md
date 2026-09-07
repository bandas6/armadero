# Recortes del aviso — Artemadero

Piezas sacadas de la foto del aviso del local, con fondo transparente, listas para la web.
El logotipo es vector; las hojas y la trenza son fotografía y siguen en PNG.

```
marca/
  logotipo.svg              vector, degradado dorado — el principal, para fondos oscuros
  logotipo-tinta.svg        vector, #191C1E — para fondos claros
  logotipo-mono.svg         vector con fill="currentColor" — hereda el color del CSS
  logotipo.png              607 × 105   respaldo, por si algo no admite SVG
  logotipo-tinta.png        607 × 105   respaldo
  divisor-trenza.png        613 × 41    la trenza completa
  trenza-modulo.png         256 × 41    módulo del centro, repetible en horizontal
  guirnalda.png             208 × 119   el potus con sus bejucos, cuelga de la esquina
  guirnalda-2x.png          416 × 238   la misma, para pantallas retina
  guirnalda-espejo.png      208 × 119   invertida, para la esquina opuesta
  guirnalda-espejo-2x.png   416 × 238
```

## Por qué es una guirnalda y no una esquina de hojas

El primer recorte abarcaba toda la esquina del aviso: la mata de arriba más las hojas que
bajan por el borde derecho. Se veía mal, y al ampliar el original se entendió por qué —
tres razones distintas:

1. **Entraba un pedazo del marco de madera** por arriba a la izquierda, un listón café
   que no tenía nada que ver con el follaje.
2. **Las hojas del borde derecho están cortadas** por el marco vertical del propio aviso.
   En el letrero eso no se nota porque el marco las remata; recortadas quedaban medias
   hojas flotando.
3. **El centro quedaba vacío.** Medido por filas: de la 0 a la 118 hay entre 110 y 153
   píxeles de follaje por fila; de la 120 a la 145, cero; y de ahí abajo entre 7 y 21 —
   restos. Como pieza suelta se leía como fragmentos, no como una planta.

Así que me quedé con las filas 0 a 118, que es la mata densa con los bucles del bejuco, y
descarté el resto. Cuelga de la esquina superior derecha y se lee como una sola planta.
Además recuperé los bejucos, que el primer recorte casi había borrado: son finos y de tono
café olivo, y el filtro de verdor no los veía. Ahora entran por brillo medio y calidez,
excluyendo la franja donde viven el logotipo y la trenza —que son del mismo café pero
mucho más claros—, y con un margen de 30 px alrededor del follaje para que los bucles
sueltos sobrevivan.

Lleva además una máscara de enfoque suave, ponderada por el alfa, que levanta las venas
de las hojas sin ensuciar el borde.

## El logotipo ya es vector

Lo tracé del recorte: saqué el contorno con marching squares sobre el canal alfa —que da
precisión de subpíxel, no el borde escalonado de los píxeles—, simplifiqué con
Douglas-Peucker y ajusté curvas cúbicas, marcando como esquina dura todo vértice que gira
más de 62°. Así las astas quedan rectas, las curvas suaves y las puntas de los remates
afiladas en vez de redondeadas.

Pesa 22 KB, son 16 contornos con `fill-rule="evenodd"` (los contrapunzones de la A, la e,
la a, la d y la o salen solos) y escala a cualquier tamaño sin pixelarse. El degradado
dorado está muestreado del aviso en cinco paradas.

`logotipo-mono.svg` usa `currentColor`: hereda el color del texto que lo contiene, así
sirve para hover, modo oscuro y el favicon sin mantener archivos aparte.

Sombra por CSS, no incrustada:

```css
.marca img { filter: drop-shadow(2px 3px 4px rgba(0,0,0,.45)); }
```

## Cómo se hicieron

El aviso es un JPEG de 1280 px sobre pizarra oscura. Para cada pieza estimé el fondo
local con un filtro de mínimos, saqué el alfa de la diferencia de brillo y **descontaminé
el borde**: los píxeles semitransparentes traían mezclada la pizarra, y eso es lo que
produce el halo sucio cuando pones el recorte sobre un fondo claro. Ahora el color del
borde es el de la letra o el de la hoja, no una mezcla.

El logotipo lleva además un filtro de calidez, porque la pizarra tiene motas claras
grises que pasaban el umbral de brillo y ensuciaban el contorno. Las hojas usan verdor, y
el bejuco entra solo donde toca follaje — así el tallo se conserva sin arrastrar la cola
del logotipo, que está al lado y es del mismo tono café.

## Límites

**La guirnalda mide 208 px de ancho en el original.** El archivo `-2x` es un reescalado
de buena calidad y aguanta bien hasta unos 300 px de ancho en pantalla; más allá se
ablanda. No hay forma de sacar detalle que la foto no tenga: ampliar no agrega venas, las
inventa.

**No la dibujé a mano.** Podría trazar una guirnalda vectorial y quedaría nítida a
cualquier tamaño, pero al lado de fotos reales de muebles se leería como clipart y le
quitaría credibilidad a la página. Prefiero una foto real pequeña que un dibujo grande.

**El logotipo es vector, pero trazado sobre una foto.** Escala sin pérdida, y a tamaño de
encabezado o de titular se ve impecable. Lo que el trazo no puede arreglar es que las
letras del aviso son físicas y en relieve: conserva mínimas irregularidades de contorno
que a pantalla completa se notan. No son dientes de píxel, son la forma real del letrero.

**Las hojas y la trenza no se pueden vectorizar.** Son fotografía: venas, brillos y
degradados. Trazarlas daría manchas planas de color, peores que el PNG. Ahí el límite no
es la técnica, es la resolución de la fuente.

**Vale la pena pedirle a Vanessa el arte original del aviso** en AI, PSD o PNG en alta.
Ahí las hojas y el logotipo están en capas aparte y a resolución completa, y estos
recortes se reemplazan por algo impecable. Es la mejora más grande disponible y no cuesta
trabajo de diseño, solo pedirlo.

## Lo que apliqué a la dirección 03

**Encabezado:** el logotipo en tinta reemplaza el texto "Artemadero". Alto fijo de 32 px,
ancho automático, envuelto en el enlace a la home con `alt="Artemadero"`.

**Hero:** las hojas con bejuco en la esquina superior derecha, sobre la mitad de "Madera".
Van decorativas — `alt=""`, `aria-hidden="true"`, `pointer-events:none` — a 206 px y con
tope del 38 % del ancho para que en móvil no se coman el titular.

**Pie:** lo pasé a fondo oscuro. Es un cambio deliberado y vale explicarlo: el dorado del
logotipo está hecho para pizarra oscura y sobre el hueso `#F7F6F2` de la dirección 03 no
alcanza contraste AA. Con el pie oscuro entra el dorado de verdad, la trenza debajo del
logotipo repite la composición del aviso, y la página cierra con peso. El encabezado se
queda claro con la versión en tinta.

**La trenza va una sola vez.** Es una textura fuerte; repetida en cada sección se vuelve
ruido y le quita fuerza al corte tejido/madera, que es el diferenciador del sitio.

## Más ideas, en orden de lo que más aporta

1. **El dorado como cuarto color, solo para el precio cerrado.** La dirección 03 ya usa
   naranja para tejido, azul para madera y verde para "Precio según medidas". Un dorado
   `#E2A96F` reservado a los precios en firme cierra el sistema: el comprador aprende que
   dorado es cifra y verde es conversación. Nada más lleva dorado.

2. **La trenza como separador del catálogo tejido / catálogo madera.** Un único módulo
   repetido en horizontal justo en el punto donde el catálogo cambia de material. Es el
   corte del negocio marcado con la textura del negocio, y no cuesta una foto nueva.

3. **Las hojas en el vacío del catálogo de madera.** Las subcategorías sin fotos hoy
   muestran un recuadro punteado. Con `hojas-espejo.png` en su esquina, ese espacio pasa
   de hueco a decisión.

4. **El favicon, de la A del logotipo.** Recortada del PNG en tinta. Es lo único del
   logotipo que se lee a 32 px, y ahorra mantener un archivo aparte.

5. **La bajada, en tipografía, no en imagen.** "MUEBLES CAMPESTRES Y TEJIDOS" la extraje y
   la descarté: es texto y como imagen no se selecciona, no la lee un buscador y no se
   adapta al ancho del móvil. En IBM Plex Sans con mucho espaciado entre letras da igual
   de bien y sí funciona como contenido.

6. **La foto del ambiente del aviso, en el bloque de historia.** La mitad izquierda del
   aviso ya es una foto de sala tejida bien iluminada. Es de las pocas imágenes limpias que
   hay; sirve mejor ahí que otra foto de andén.

## Una corrección al LEEME anterior

El documento que venía con el zip dice que la dirección elegida usa Fraunces. No es así:
la 03 usa **Instrument Serif** en titulares e **IBM Plex Sans** en el resto. La
recomendación de fondo sigue valiendo —no cambies la tipografía del sitio por la del
aviso, deja el logotipo como imagen— pero la fuente a la que hay que rimar es Instrument
Serif, no Fraunces.
