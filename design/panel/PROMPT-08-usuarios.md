# 08 · Usuarios

Referencia: `mockups/usuarios.html` · Código: `admin-user-list.ts`

---

```
Rediseña la pantalla de usuarios siguiendo `mockups/usuarios.html`. Lee primero
REGLAS-COMUNES.md.

El `prompt()` del navegador para pedir la contraseña es la interacción más frágil del
panel: obliga a escribirla a ciegas, no se puede copiar, y en celular apenas se ve.

## La contraseña, en un panel en línea

Se genera una que ya cumple los requisitos, se muestra visible (`type="text"`, es una
credencial que hay que pasarle a otra persona, no la propia), con botón de copiar y un
botón para generar otra. Debajo, la validación en positivo: "Sirve: tiene 16 caracteres".

Y la advertencia que hoy no está: cópiala antes de crear la cuenta, después no se puede
ver de nuevo, solo cambiar.

Con la nota de cómo se entrega: se la pasas por WhatsApp o en persona, y la puede cambiar
después desde su propia cuenta.

## El rol deja de ser un `<select>`

Dos permisos, explicados por lo que dejan hacer y no por su nombre:

- **Administra todo** — las ocho pestañas. Puede cambiar el número de WhatsApp, los
  precios de envío, la portada y quién más entra al panel.
- **Carga muebles y fotos** — Muebles, Categorías, Colecciones y Cotizaciones. No puede
  tocar Ajustes, Inicio, Envíos ni Usuarios.

Arriba de la lista, los dos como tarjetas con su color (`--tinta` y `--madera`). En la
fila de cada persona, dos botones visibles en vez de un desplegable. Al crear a alguien,
dos radios con la explicación al lado de cada uno — no un párrafo arriba que hay que
recordar mientras se elige.

"Dar acceso a alguien" en vez de "Nuevo usuario": dice qué hace.

## Fechas en lenguaje humano

`2026-09-12` pasa a "entró hace 2 días", "última entrada, 28 de julio". La fecha ISO no le
dice nada a nadie.

## Tu propia fila explica sus límites

La API impide que te quites el acceso o te bajes el permiso a ti misma. Hoy eso aparece
como un error después de intentarlo; ponlo como nota en la fila:

  "No puedes quitarte el acceso ni bajarte el permiso a ti misma, para que el panel no
  quede sin nadie que lo administre."

Con la etiqueta "Eres tú" al lado del nombre.

## Quitar el acceso, sin susto

"Quitarle el acceso" en vez de "Desactivar", con la aclaración de que no se borra nada de
lo que cargó. Quien ya no tiene acceso se queda en la lista, en gris, con el botón
"Devolverle el acceso".

## Un campo que le falta al modelo

`AdminUserRow` no guarda cuándo se desactivó a alguien, así que la tarjeta solo puede
decir "Sin acceso". Para que diga "sin acceso desde el 3 de agosto" hay que agregar el
campo. No es bloqueante — está anotado en PENDIENTES.md.
```
