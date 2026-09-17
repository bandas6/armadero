# 02 · Categorías

Referencia: `mockups/categorias.html` · Código: `admin-category-list.{ts,html}`

---

```
Rediseña la pantalla de categorías siguiendo `mockups/categorias.html`. Lee primero
REGLAS-COMUNES.md.

El problema: la pantalla muestra la lista, pero no responde la pregunta que uno trae al
entrar — ¿qué le falta a mi catálogo?

## El corte tejido/madera se tiene que ver

Es el eje de todo el negocio y hoy aparece como una pastilla gris en minúsculas.

Cada subcategoría lleva un filete de 5 px a la izquierda con el color de su material:
`--tejido` naranja, `--madera` azul, `--linea-fuerte` gris cuando no tiene material. Y el
nombre del material escrito en su propio color.

El código funcional ya existe en el sitio público; acá solo se aplica igual.

## Resumen arriba

Pastillas con conteo: 16 subcategorías · Sin foto propia 4 · Sin muebles 2 · Ocultas 1 ·
Tejido 7 · Madera 5.

## Jerarquía real de dos niveles

Hoy el tipo de mueble y la subcategoría se ven como tarjetas parecidas. El tipo pasa a ser
un encabezado de sección con línea gruesa (`border-bottom: 2px solid var(--tinta)`), su
conteo al lado y sus acciones a la derecha. Las subcategorías van debajo como filas.

Así se entiende de una que el tipo agrupa y que la foto vive en la subcategoría.

## Explica dónde va la foto

Un bloque de ayuda arriba, que se puede cerrar:

  "El catálogo tiene dos niveles: el tipo de mueble agrupa, y la subcategoría es la que la
  gente ve y toca en la página. Por eso la foto va en la subcategoría; si no le pones una,
  el sitio toma la de uno de sus muebles."

Es la confusión más común de esta pantalla y hoy hay que deducirla.

## Sin foto propia, con su salida

Cuando la subcategoría no tiene foto, franja de alerta al pie de la fila:

  "Está usando la foto de un mueble. Ponle una propia y decides tú qué se ve en el
  catálogo."  [Subir foto]

## El editor se abre en la fila

Hoy el formulario de edición se monta en la cabecera de la pantalla. Si editas una
subcategoría de Decoración, el formulario queda fuera de la vista. Pásalo a desplegarse
dentro de la fila, con `border: 2px solid var(--hoja)`.

Dentro del editor: nombre, material, descripción opcional con la nota de que se ve arriba
de la retícula, y la foto con `capture="environment"`.

## Ocultar, con la consecuencia

El `confirm()` se va. En su lugar, franja en la fila:

  "Ocultar «Butacos» también saca 20 muebles de la página. Nadie los va a ver hasta que la
  vuelvas a mostrar."   [Ocultar de todos modos] [Cancelar]

El aviso ya existía en el código; solo hay que sacarlo del diálogo del navegador.

## Arrastrar también las subcategorías

La API ya soporta `categories/reorder`, pero hoy solo los tipos se pueden mover. Agrega el
asa a las subcategorías.

## Guadua

Es una línea transversal: no tiene subcategorías propias, sus muebles viven en Sala,
Comedor y las demás. Hoy se ve como una categoría rota con "Sin subcategorías". Dale su
propio texto explicándolo.

## Agregar subcategoría

Un botón "+ Agregar subcategoría a Butacos" al pie de cada grupo, con borde punteado. Hoy
hay que ir a otra parte de la pantalla.
```
