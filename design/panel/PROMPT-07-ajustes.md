# 07 · Ajustes

Referencia: `mockups/ajustes.html` · Código: `admin-settings-form.{ts,html}`

---

```
Rediseña los ajustes del sitio siguiendo `mockups/ajustes.html`. Lee primero
REGLAS-COMUNES.md.

Es la pantalla más delicada del panel: el número de WhatsApp apaga el botón de cotizar de
todo el sitio, y la plantilla es el mensaje que recibe cada cliente. Hoy es un solo
formulario largo con un botón de guardar al final.

## Seis bloques, cada uno con su guardar

WhatsApp · Horario · Local y redes · Mensaje de cotización · Preguntas frecuentes ·
Franja y año. Con una navegación de anclas arriba.

Cambiar el número no debería obligar a pasar por las seis preguntas frecuentes.

## WhatsApp primero, con su estado

Es lo único que puede dejar el sitio sin forma de contacto. Va arriba, con borde
`--hoja`, y muestra el estado en claro:

  ● El botón de cotizar está funcionando

Con un botón "Probarlo" que abre el chat como lo abriría un cliente, y la advertencia de
lo que pasa si queda vacío: el botón de cotizar se apaga en todo el sitio.

El `+57` va fijo por fuera del input.

## La plantilla se ve armada

Al lado del textarea, el mensaje como llega a WhatsApp — burbuja de chat, con una
cotización real de ejemplo. Hoy uno escribe `{items}` a ciegas.

Los marcadores pasan a pastillas con nombre en español: "nombre", "ciudad", "los muebles",
"lo que pidió a la medida", "su nota", "código". Se tocan para insertarlos donde está el
cursor. Y la nota de que si un dato viene vacío, esa línea no se manda.

## El horario deja de ser texto libre

Cuatro `input type="time"`: lunes a viernes y sábado, apertura y cierre. Debajo, cómo se
lee en la página. Hoy es un campo de texto donde cabe cualquier cosa y aparece en tres
lugares del sitio.

## Instagram y Facebook con el dominio fijo

`instagram.com/` por fuera del campo, se escribe solo el usuario.

## Preguntas frecuentes en acordeón

Son seis y hoy están los seis pares pregunta/respuesta abiertos, lo que hace la pantalla
interminable. Pásalas a `<details>` cerrados, con el número y la pregunta en el resumen.

Con la nota de que son seis fijas, van al final del inicio, y contestarlas bien baja el
trabajo del chat. La de envíos lleva un enlace a la pestaña de Envíos.

## Franja y año

El aviso de la franja superior, con vista previa de cómo se ve encima del menú y la nota
de que vacío = sin franja.

El año en que empezó el taller, con lo que se pierde por no tenerlo: sin él, el bloque de
historia del inicio no abre con "Fabricamos desde 2011…", que es lo que hace que un
desconocido se anime a escribir.

Igual con la dirección del local: marcada como lo que falta, explicando que es lo primero
que busca quien quiere ir.
```
