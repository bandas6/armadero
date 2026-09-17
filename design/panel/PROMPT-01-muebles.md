# 01 · Muebles

Referencia: `mockups/muebles.html` · Código: `admin-product-list.{ts,html}`

---

```
Rediseña el listado de muebles del panel siguiendo `mockups/muebles.html`. Lee primero
REGLAS-COMUNES.md: las decisiones de tokens, tamaños de toque y estados aplican acá.

El problema de la pantalla actual: muestra los datos, pero no dice qué hacer. Hay tres
muebles sin foto que nadie puede ver en la página, y para encontrarlos hay que leer las
etiquetas de cada tarjeta una por una.

## Lo pendiente sube al principio

Un bloque arriba de la lista: "3 muebles esperan una foto", con los tres listados y un
botón directo en cada uno. Debajo, la razón: sin foto no se pueden publicar, así que hoy
nadie los ve.

El bloque se puede cerrar y no vuelve a aparecer en esa sesión. Cuando no hay muebles
pendientes, no se renderiza.

## Los filtros pasan a pastillas con conteo

El `<select>` de estado se va. En su lugar: Todos 24 · Les falta foto 3 · Ocultos 5 · Se
ven en la página 19 · En el inicio 9 de 9.

Esa última importa: hay un máximo de nueve destacados en el inicio, y hoy el usuario se
entera cuando el servidor le devuelve el error. Verlo antes evita el choque.

## El estado, en palabras

Reemplaza "Activo / Inactivo" por:

- punto verde + "Se ve en la página", y si además está destacado, "Destacado en el inicio";
- círculo vacío + "Oculto — todavía nadie lo ve";
- cuando tiene fotos pero está oculto: "Oculto — tiene 4 fotos, pero nadie lo ve". Es un
  caso distinto al de arriba y hoy se ven idénticos.

## La falta de foto deja de ser una etiqueta

Hoy es un `<span>` que dice "sin fotos". Pásalo a una franja al pie de la tarjeta, con
fondo de alerta, el diagnóstico y la salida:

  "Le falta la foto. Es lo único que falta para poder publicarlo."  [Tomar la foto]

El botón abre el selector de archivo con `capture="environment"`, para que desde el
celular abra la cámara.

## Una acción principal

Editar en verde. Al lado, la de estado — "Ocultar" o "Publicar" según corresponda. Todo
lo demás en el `⋯`: destacar en el inicio, duplicar, ver en la página, quitar.

El botón que hoy dice "Quitar" no aclara si borra el mueble o lo saca del inicio. Sea lo
que sea, el rótulo tiene que decirlo.

## Paginación visible

"Muebles 1 a 20 de 24" + "Ver los 4 que faltan" al final de la lista.

## Reordenar

El asa de arrastre a la izquierda de cada tarjeta, con `touch-action: none` y
`cursor: grab`, más la línea de ayuda arriba: "Arrastra un mueble para cambiar el orden en
que aparece en el catálogo". Hoy se puede arrastrar pero nada lo dice.

## Deshacer

Al ocultar o publicar, un aviso abajo: "«Mecedora Palmira» quedó oculta en la página" con
botón Deshacer, unos segundos. Evita el susto de haber tocado el botón equivocado.
```
