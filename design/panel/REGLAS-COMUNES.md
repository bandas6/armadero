# Reglas comunes a las ocho pestañas

Léelo antes de los prompts. Son las decisiones que se repiten en todas y no se vuelven a
explicar en cada archivo.

---

## 1. Los tokens ya existen — úsalos, no inventes

`src/styles.css` tiene toda la paleta, los radios y los tamaños. Nada de colores nuevos.

    --hueso      fondo general
    --hueso-alt  fondo de bloques y botones secundarios
    --tinta      texto y bordes fuertes
    --gris       texto secundario
    --tejido     código de material: tejido
    --madera     código de material: madera
    --hoja       acciones, enlaces, "Precio según medidas"
    --alerta     lo que está incompleto o es destructivo

El código de material es funcional, no decorativo: naranja es tejido y azul es madera,
igual en todo el panel y en todo el sitio. No los uses para otra cosa.

## 2. Todo control se toca con el dedo: 44 px

Los `admin-btn--sm` de 36 px se van. En el panel hay filas con cinco y seis botones, y
Vanessa lo usa desde el celular en el local. `min-height: 2.75rem` en cualquier cosa que
se pueda tocar, incluidos los botones de icono, que además llevan `min-width`.

## 3. Nada de `confirm()`, `alert()` ni `prompt()` del navegador

Hoy el panel los usa para confirmar borrados y para pedir contraseñas. Se reemplazan por:

- **Confirmaciones destructivas:** una franja dentro de la propia fila, que dice la
  consecuencia en concreto ("ocultar Butacos también saca 20 muebles de la página") y
  tiene los dos botones ahí mismo.
- **Contraseñas:** un panel en línea, con el valor visible y botón de copiar.

El diálogo del navegador no se puede leer bien en celular, no dice qué se pierde, y en el
caso de la contraseña obliga a escribirla a ciegas.

## 4. El estado se dice en palabras, no en jerga

"Activo / Inactivo" no dice nada. Lo que la dueña necesita saber es si algo **se ve en la
página**:

- "Se ve en la página" con punto verde.
- "Oculto — todavía nadie lo ve".
- "Le falta la foto" cuando eso es lo que impide publicarlo.

Y hay que distinguir dos casos que hoy se ven igual: oculto porque falta una foto, y
oculto teniendo cuatro fotos. Son problemas distintos.

## 5. Una sola acción principal por fila

Hoy tres botones tienen el mismo peso visual y el usuario no sabe cuál es el normal. En
cada fila: **una** acción en verde (`--hoja`), la de estado al lado en secundario, y todo
lo demás — destacar, duplicar, ver en la página, borrar — detrás de un botón `⋯`.

## 6. Los filtros cuentan

Un `<select>` de estados no dice cuántos hay de cada cosa. Se reemplaza por pastillas con
número: `Todos 24 · Les falta foto 3 · Ocultos 5 · Se ven 19`. Así se lee el estado de la
sección de un vistazo, y se ve un límite antes de chocar con él.

## 7. La paginación se ve

Hoy los registros de la página dos desaparecen sin avisar. Al final de cada lista:
"Muebles 1 a 20 de 24" y un botón "Ver los 4 que faltan".

## 8. Responsive de verdad hasta 360 px

El contenido sube de 768 a **1120 px** de ancho máximo: hay tablas y listas que no caben
en 768 y el panel se usa también desde computador.

En las retículas, `repeat(auto-fill, minmax(min(380px, 100%), 1fr))` — con `minmax(380px,
1fr)` a secas la tarjeta no puede bajar de 380 px y aparece scroll horizontal en celular.
Las tiras de miniaturas usan `repeat(3, minmax(0, 1fr))` por lo mismo.

## 9. Cada bloque se guarda solo

Donde hay formularios largos, un botón de guardar por bloque en vez de uno al final.
Cambiar el número de WhatsApp no debería obligar a pasar por las seis preguntas
frecuentes.

## 10. El editor se abre donde estás

Hoy varios formularios se abren en la cabecera de la pantalla: si editas la última fila,
el formulario aparece fuera de la vista y parece que no pasó nada. Se despliega **dentro
de la fila**, con borde `--hoja` marcando cuál estás editando.
