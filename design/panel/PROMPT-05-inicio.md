# 05 · Inicio

Referencia: `mockups/inicio.html` · Código: `admin-banner-list.ts`

---

```
Rediseña la pantalla de portada del inicio siguiendo `mockups/inicio.html`. Lee primero
REGLAS-COMUNES.md.

El problema: se administran las piezas que abren el sitio, pero no hay forma de ver cómo
se van a ver juntas. Se edita a ciegas.

## Vista previa de la portada

Arriba, una maqueta pequeña de cómo queda el inicio con lo que hay cargado: la franja, el
hero partido tejido/madera, y los destacados. No tiene que ser interactiva — alcanza con
que muestre la composición.

Es lo primero que uno quiere ver al entrar y hoy hay que abrir el sitio en otra pestaña.

## Lo que falta, arriba

Si una pieza de la portada está incompleta —sin foto, sin texto— va en un bloque al
principio con el botón para resolverlo. La portada es lo que ve todo el que llega.

## Estado y orden

"Se ve en la página" / "Oculto", como en las demás pestañas. Asa de arrastre con la línea
de ayuda: el orden es el orden en que aparecen.

## Las fechas de programación, en claro

Cuando una pieza tiene fecha de inicio o fin, dilo en lenguaje humano: "se publica el 20
de octubre", "se baja sola el 27". Hoy son dos campos de fecha sin consecuencia visible, y
uno no sabe si lo que ve está activo o esperando.

Si la fecha ya pasó, la pieza se muestra en gris con la nota de que ya se bajó.

## Foto desde el celular

`capture="environment"` en el selector, como en las demás pantallas.

## El tope de destacados

Si la portada tiene un máximo de piezas, muéstralo como conteo — "3 de 4" — antes de que
el servidor devuelva el error.
```
