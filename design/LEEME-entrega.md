# Artemadero — paquete de implementación

Todo lo que necesita el agente de terminal para construir el frontend del catálogo con la
dirección de diseño aprobada.

## Qué hay aquí

```
LEEME.md                          este archivo — empieza aquí
PROMPT-1-arranque.md              tokens, layout, encabezado y pie
PROMPT-2-home.md                  las siete secciones del home
PROMPT-3-catalogo.md              retícula, conmutador tejido/madera, filtros
PROMPT-4-ficha.md                 galería, variantes, medidas, cotización
PENDIENTES.md                     datos que faltan — no dejar que la IA los invente

design/
  README.md                       comparación de las tres direcciones
  direccion-03-tejido-o-madera/   ← LA APROBADA, referencia visual
  direccion-01-puestos/           descartadas, quedan como respaldo
  direccion-02-a-la-medida/
  image-slot.js                   solo para los mockups, no va al proyecto

marca/
  logotipo.svg / -tinta / -mono   vector, listo para producción
  guirnalda.png  (+2x, espejo)    hojas del aviso, esquina del hero
  trenza-modulo.png               textura repetible
  LEEME.md                        dónde va cada pieza y a qué tamaño
```

## Cómo usar los prompts

Son cuatro, en orden. **Uno por sesión, no los pegues todos de una.** Cada uno asume que
el anterior quedó funcionando y revisado.

1. Copia la carpeta `design/` y la carpeta `marca/` a la raíz del repo.
2. Abre `design/direccion-03-tejido-o-madera/index.html` en el navegador y míralo. Es la
   referencia visual: el agente va a leerlo, pero tú también deberías.
3. Pega `PROMPT-1-arranque.md` completo en la terminal, dentro del repo.
4. Revisa el resultado, córrelo, arregla lo que haga falta.
5. Solo entonces sigue con el 2, y así.

Si el agente se desvía del mockup, no discutas: dile "vuelve a
`design/direccion-03-tejido-o-madera/index.html`, sección X, y sigue esos valores".

## Lo que el mockup es y lo que no es

**Es** la referencia de jerarquía, orden de secciones, tamaños relativos de tipografía,
paleta, y sobre todo el tratamiento de tres cosas: las medidas, el corte tejido/madera y
"Precio según medidas".

**No es** el código a copiar. Está en HTML estático con estilos en línea porque tenía que
abrirse con doble clic en el computador de la clienta. La traducción a componentes Angular
con Tailwind es parte del trabajo.

**No define** estados de carga, paginación real, validación de formularios, comportamiento
del carrito ni errores de red. Eso se resuelve en la implementación.

## El detalle que sostiene el diseño

El sitio entero está partido en **tejido** y **madera**. No es un filtro más: es cómo la
clienta entiende su negocio y lo que ningún competidor hace. Aparece tres veces:

- en el home, como dos mitades;
- en el catálogo, como un conmutador que reestructura la retícula;
- en cada ficha, como el enlace a la pieza gemela en el otro material.

Si en la implementación eso termina siendo un checkbox en una barra lateral, se perdió el
diseño.
