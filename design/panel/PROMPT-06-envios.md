# 06 · Envíos

Referencia: `mockups/envios.html` · Código: `admin-shipping-list.ts`

---

```
Rediseña la pantalla de envíos siguiendo `mockups/envios.html`. Lee primero
REGLAS-COMUNES.md.

El problema: los datos son una tabla de precios — ciudad, flete, días — pero se muestran
como una frase corrida por fila ("Desde $ 90.000 · 2 días · hasta la puerta"). Comparar
Palmira con Buga, que es lo único que uno hace acá, obliga a leer renglón por renglón.

## Tabla de verdad

Cuatro columnas: Ciudad · Flete desde · Llega en · acciones. Las cifras alineadas a la
derecha y `font-variant-numeric: tabular-nums` en el `body`, para que los dígitos queden
en columna y se puedan comparar de un vistazo.

## Agrupar por región

Dos tablas: "Valle del Cauca" y "Otros departamentos". Los fletes cercanos y los lejanos
son dos escalas de precio distintas; mezclarlos hace ruido.

## Cali marcada

Es la ciudad del taller y la referencia de todas las demás. Fondo distinto y la nota
"donde está el taller". En una lista alfabética se pierde entre las otras.

## El campo de plata acepta lo que uno escribe

Hoy el error dice "sin puntos ni decimales", que es enseñarle al usuario a esquivar el
campo. El `$` va fijo por fuera del input y los puntos de mil se ponen solos mientras
escribe.

Igual con los días: el "días" va por fuera del campo, así no hay que adivinar si se
escribe el número solo.

## Se ve qué lee el comprador

Toda la pantalla existe para producir una frase en la ficha de producto, y hoy no hay
forma de saber cómo queda. Arriba, el texto tal cual sale:

  "Envío a Palmira: desde $ 90.000. Llega en 2 días aproximadamente, hasta la puerta. El
  valor exacto lo acordamos por WhatsApp según el tamaño del mueble."

Con la nota de que el sitio detecta la ciudad del comprador.

## Y qué pasa con las ciudades que faltan

Un bloque al final con el mensaje que ven las ciudades sin tarifa cargada:

  "Enviamos a todo el país. El flete lo acordamos por WhatsApp según la ciudad y el tamaño
  del mueble."

Así se sabe que no es obligatorio tener todas cargadas y que nada queda vacío.

## La nota, con ejemplos

El campo de nota opcional lleva las frases más usadas como sugerencia: "hasta la puerta",
"entrega en terminal", "no incluye subir escaleras". Sirve para aclarar hasta dónde llega
el flete.

## Ocultas

Una ciudad oculta se muestra en gris con la nota "oculta, no se ve en la página" y el botón
"Mostrar", no se esconde de la tabla.
```
