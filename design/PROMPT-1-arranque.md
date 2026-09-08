# Prompt 1 de 4 — Arranque: tokens, layout, encabezado y pie

Pega el bloque completo en la terminal, dentro del repo. Antes de pegarlo, copia las
carpetas `design/` y `marca/` a la raíz del proyecto.

---

```
Vamos a implementar el frontend del catálogo de Artemadero siguiendo la dirección de
diseño ya aprobada por la clienta. Este es el primer paso de cuatro: tokens de diseño,
layout base, encabezado y pie. No construyas todavía el home, el catálogo ni la ficha.

## Lee primero

Obligatorios, en este orden:

- `design/direccion-03-tejido-o-madera/index.html` — el mockup aprobado. Ábrelo y léelo
  completo. Es HTML estático con estilos en línea: NO lo copies tal cual. Extrae de ahí
  los valores y reescríbelos como componentes Angular con Tailwind y custom properties.
- `CLAUDE.md` — convenciones del proyecto, stack y reglas de negocio.
- `docs/cliente.md` — quién es la clienta, categorías reales, pendientes.
- `docs/brief-diseno.md` — dirección visual, tono y anti-patrones.
- `docs/estructura-home.md` — secciones del home (lo usarás en el prompt 2).
- `marca/LEEME.md` — los recortes del aviso y dónde va cada pieza.

## Tokens de color

Defínelos como custom properties CSS en el ámbito raíz, no como clases de Tailwind
sueltas. Luego expónlos a Tailwind por configuración para poder usarlos como utilidades.

  --hueso    #F7F6F2   fondo general
  --tinta    #191C1E   texto y bordes fuertes
  --tejido   #A8641E   código de material: tejido
  --madera   #3A5A6B   código de material: madera
  --hoja     #42604B   acciones, enlaces, "Precio según medidas"
  --gris     #5E6467   texto secundario

El código de material es funcional, no decorativo: naranja identifica tejido y azul
identifica madera, en toda la aplicación y siempre igual. Verde es para acciones y para
"Precio según medidas". No inventes colores nuevos ni uses estos para otra cosa.

## Tipografía

Dos familias de Google Fonts, ninguna más:

- **Instrument Serif** — solo titulares grandes (h1, h2 de sección).
- **IBM Plex Sans** — todo lo demás: texto, interfaz, cifras, etiquetas.

Cárgalas con `display=swap` y precarga la conexión a Google Fonts.

## Escala de suavizado (radios)

El mockup usa tres niveles y nada más. Defínelos como tokens y no inventes valores
intermedios:

  --r-bloque   12px   bloques grandes: historia, llamado a cotizar, preguntas, cédula de ficha
  --r-pieza    10px   fotos, tarjetas de pilar, garantías del hero
  --r-control   8px   botones, cédulas de medidas pequeñas
  pastilla    999px   solo lo que se selecciona: chips de filtro, etiquetas de material,
                      selectores de variante, conmutador tejido/madera

Todo contenedor con foto lleva su radio más `overflow:hidden`, para que la imagen siga la
esquina. **La retícula de tarjetas del catálogo se queda cuadrada** a propósito: es lo que
le da densidad y orden a fotos irregulares.

## Recursos de marca

Están en `marca/`. Cópialos a la carpeta de assets del proyecto.

- **Encabezado:** `logotipo-tinta.svg`, alto fijo de 32 px y ancho automático, envuelto en
  el enlace a la home con `alt="Artemadero"`.
- **Pie:** `logotipo.svg` (el dorado) sobre fondo oscuro `--tinta`, con
  `trenza-modulo.png` repetido en horizontal justo debajo. El dorado no alcanza contraste
  AA sobre el hueso, por eso el pie va oscuro y el encabezado claro. Es deliberado.
- **Favicon:** recórtalo de la A del logotipo en tinta.
- `logotipo-mono.svg` usa `currentColor`: hereda el color del texto que lo contiene.

La sombra del logotipo va por CSS, no incrustada:

    filter: drop-shadow(2px 3px 4px rgba(0,0,0,.45));

## Qué construir en este paso

1. Configuración de Tailwind con los tokens y las dos familias tipográficas.
2. Hoja de estilos global: reset, custom properties, `@font-face` o el enlace a Fonts,
   estilos por defecto de `a` y `a:hover` con los colores de la paleta, y foco visible.
3. Componente de encabezado: logotipo, navegación (Inicio, Catálogo), y el botón "Cotizar
   por WhatsApp". Sticky arriba, fondo `--hueso` con borde inferior sutil.
4. Componente de pie: fondo `--tinta`, logotipo dorado, trenza, dirección del local,
   horario de atención, WhatsApp, Instagram y Facebook.
5. El esqueleto de rutas: home, catálogo, ficha de producto, y el panel de administración
   como ruta perezosa protegida por guard.

## Reglas que aplican desde ya

- El botón de acción se llama **"Cotizar por WhatsApp"**. Nunca "Comprar" ni "Pagar".
  Cerca de él va el horario de atención: lunes a viernes 8:30 a. m. – 5:30 p. m., sábado
  7:30 a. m. – 3:00 p. m.
- Número de WhatsApp: +57 316 254 2637. Los enlaces van a `wa.me` con mensaje prellenado.
- Copy de interfaz en español de Colombia, tuteo, voz activa, sin superlativos de agencia.
  Código en inglés.
- Móvil primero. Responsive hasta 360 px de ancho.
- Foco de teclado visible, contraste AA, `prefers-reduced-motion` respetado.
- SSR activo desde el principio: el SEO es crítico en este proyecto.

## Dos datos que faltan

La **dirección del local** y el **año de fundación** del negocio no los tenemos. No los
inventes: déjalos como constantes marcadas con un comentario `PENDIENTE` y avísame al
terminar para que los pregunte a la clienta.

Cuando termines, muéstrame el encabezado y el pie renderizados antes de que sigamos con
el home.
```
