# Rediseño del panel — los ocho cambios

Un archivo por pestaña, en el orden del menú. Cada uno lista solo lo que cambia respecto
a lo que hay hoy en el repositorio, con el porqué.

```
PROMPT-01-muebles.md
PROMPT-02-categorias.md
PROMPT-03-colecciones.md
PROMPT-04-cotizaciones.md
PROMPT-05-inicio.md
PROMPT-06-envios.md
PROMPT-07-ajustes.md
PROMPT-08-usuarios.md
REGLAS-COMUNES.md        aplican a las ocho — léelo primero
PENDIENTES.md            datos que faltan y campos que le faltan al modelo

mockups/                 los ocho rediseños, se abren con doble clic
```

## Cómo usarlos

Empieza por `REGLAS-COMUNES.md`: son ocho decisiones que se repiten en todas las
pestañas, y tenerlas claras evita repetirlas en cada prompt.

Después, **un prompt por sesión**, en orden. Cada uno se pega completo en la terminal,
dentro del repo. Revisa y corre antes de seguir con el siguiente.

Los mockups de `mockups/` son la referencia visual. Están en HTML con estilos en línea
para que abran sin instalar nada; **no son el código a copiar**: los valores salen de
`src/styles.css`, que ya los tiene todos.

## Qué NO cambia

Ningún color, tipografía, radio ni espaciado nuevo. Todo sale de los tokens que ya
existen en `src/styles.css`. La cabecera del panel se queda como está en
`admin-layout.ts`: fondo claro, logotipo en tinta.

Tampoco cambia el backend. Todos los rediseños funcionan con los endpoints y modelos
actuales, salvo dos campos anotados en `PENDIENTES.md`.
