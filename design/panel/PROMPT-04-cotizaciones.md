# 04 · Cotizaciones

Referencia: `mockups/cotizaciones.html` · Código: `admin-quote-list.{ts,html}`,
`admin-quote-detail.ts`

---

```
Rediseña la lista y el detalle de cotizaciones siguiendo `mockups/cotizaciones.html`. Lee
primero REGLAS-COMUNES.md.

Esta pantalla es el único registro del embudo de ventas del negocio. Hoy es una lista
plana ordenada por fecha, con un desplegable de estado, y no distingue lo urgente de lo
ya cerrado.

## De lista a cola de trabajo

Arriba: "5 personas esperan respuesta", con la más vieja marcada — "hace 2 días" en color
de alerta — y el botón de escribirle directo en cada fila. Un enlace al final del bloque
para ver el resto.

## WhatsApp en cada fila

Todo el negocio cierra por WhatsApp. Hoy hay que entrar al detalle para conseguir el
enlace; ponlo en la lista, con el mensaje ya armado y el código de cotización dentro.

## El estado deja de ser un `<select>`

Un desplegable en un dato de embudo se cambia por accidente al hacer scroll y nadie se
entera. Pásalo a:

- una pastilla que muestra el estado actual, con color: `--tinta` por atender, `--madera`
  contactada, `--hoja` ganada, gris punteado la que no siguió;
- y para cambiarlo, botones con el nombre de lo que pasó: "Se volvió venta", "No siguió".
  No "estado: won".

## Agrupar por día

Encabezados "Hoy", "Ayer", y de ahí en adelante la fecha. Una lista de 16 filas iguales no
deja ver qué llegó hoy.

## "Según medidas" se ve distinto de un precio

El modelo ya trae `hasCustomItems` y hoy no se muestra. Cuando la cotización tiene ítems
personalizables, en vez de la cifra va "Según medidas" en `--hoja`, con la nota "hay que
hablar con él". Son las que necesitan conversación, no un número.

## Lo que el cliente escribió sube a la lista

Hoy está enterrado en el detalle. Es lo que te dice si la conversación va a ser fácil o
larga — ponlo en la fila, sobre fondo distinto, entre comillas.

## Las cifras dicen algo

Tres bloques arriba, con comparación y no solo el número:

- 14 cotizaciones este mes — 3 más que en agosto
- 6 se volvieron venta — de 14, casi la mitad
- $ 18,4 M en cotizaciones ganadas — este mes, valor estimado

## Lo que más piden

Barras horizontales en vez de números al margen, y la razón de para qué sirve mirarlo:
saber qué vale la pena tener listo o destacar en el inicio.

## El detalle

- El botón de WhatsApp muestra el número y de dónde salió ("lo dejó ella"), y avisa que al
  enviar el mensaje la cotización pasa a "Contactada".
- Los ítems muestran medidas, puestos y SKU, no solo el nombre: es lo que necesitas para
  responder.
- La nota interna dice explícitamente "solo la ves tú y el equipo del panel; la clienta
  nunca la lee". Hoy no queda claro y es información sensible.
- El precio va siempre como valor estimado, con el flete aparte.
```
