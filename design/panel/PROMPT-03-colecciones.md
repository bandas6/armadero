# 03 · Colecciones

Referencia: `mockups/colecciones.html` · Código: `admin-collection-list.ts`

---

```
Rediseña la pantalla de colecciones siguiendo `mockups/colecciones.html`. Lee primero
REGLAS-COMUNES.md.

El problema: la pantalla no dice qué es una colección ni en qué se diferencia de una
categoría, y es la duda que trae cualquiera que entre acá por primera vez.

## Explica para qué sirve

Un bloque de ayuda arriba, que se puede cerrar:

  "Una colección junta muebles de categorías distintas bajo un tema — «Para la terraza»
  puede tener mecedoras, mesas y lámparas. La categoría dice qué es el mueble; la
  colección, para qué lo quieres."

## Cuántos muebles tiene, y que no quede vacía

Cada colección muestra su conteo. Cuando tiene cero, franja de alerta con la salida:

  "No tiene muebles, así que en la página se ve vacía."  [Agregar muebles]

Una colección vacía publicada es peor que no tenerla.

## Los muebles se ven, no solo se cuentan

Una tira de miniaturas por colección — las primeras cinco o seis y "+4 más". Hoy dice
"9 muebles" y hay que entrar para saber cuáles.

Usa `repeat(auto-fill, minmax(min(56px, 100%), 1fr))` o una fila con `overflow-x` para que
no desborde en celular.

## Estado en palabras y orden por arrastre

Igual que en muebles: "Se ve en la página" / "Oculta — nadie la ve". Y el asa de arrastre
con la línea de ayuda, porque el orden es el que se usa en el sitio.

## El editor en la fila

Nombre, descripción opcional y foto de portada, desplegados dentro de la fila con borde
`--hoja`. No en la cabecera de la pantalla.

## Agregar muebles a la colección

Un buscador dentro del editor, con los muebles ya agregados arriba y la posibilidad de
quitarlos de ahí mismo. Es la acción principal de esta pantalla y hoy exige irse a otra.
```
