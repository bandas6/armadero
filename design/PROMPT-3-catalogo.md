# Prompt 3 de 4 — El catálogo

Requiere el home hecho y revisado.

---

```
Ahora el catálogo, siguiendo `design/direccion-03-tejido-o-madera/index.html`. Ábrelo en
la sección de catálogo antes de empezar.

## El conmutador tejido / madera

Es lo más importante de esta pantalla y no es un filtro cualquiera.

- Va de **primer nivel**, arriba de la retícula, visible sin desplazarse. Nunca un
  checkbox en una barra lateral: es una petición explícita de la clienta y el eje de todo
  el catálogo.
- **Reestructura la retícula**, no solo la filtra: en "tejido" se muestran las nueve
  categorías con fotos; en "madera", las tres que tienen fotos más las tres pendientes.
- Estado activo con el color del material: `--tejido` o `--madera`.
- El estado va en la URL como parámetro, para que se pueda compartir el enlace y para que
  el SSR lo renderice bien.

## Las categorías

Son de dos niveles: tipo de mueble → material. Las reales del negocio:

  Sala        → Salas tejidas · Salas rústicas · Mesas de centro
  Mecedoras   → Mecedoras tejidas · Mecedoras de madera
  Comedor     → Comedores tejidos · Comedores rústicos
  Butacos     → Butacos tejidos · Butacos de madera
  Alcoba      → Camas · Camarotes · Nocheros
  Decoración  → Lámparas tejidas · Espejos tejidos · Espejos de madera
  Guadua      → línea transversal, atraviesa las demás

Cada ficha de categoría muestra su conteo de productos.

## Categorías sin fotos — el caso que hay que diseñar

Las subcategorías "de madera" todavía no tienen fotos. **No las oculte s y no dejes un
recuadro vacío.** Se muestran con borde punteado, el texto "las fabricamos, escríbenos" y
un enlace directo a WhatsApp con mensaje prellenado nombrando esa categoría. Así el
espacio pasa de hueco a decisión.

Opcional y recomendado: `marca/guirnalda-espejo.png` en la esquina de ese recuadro, con
las mismas reglas de decoración que en el hero.

## Filtros

Visibles, en una fila densa arriba de la retícula. Los del mockup: categoría, puestos,
rango de precio, "se fabrica a la medida", entrega inmediata. Funcionales esta vez, con el
estado en la URL.

Incluye el estado vacío: cuando un filtro no devuelve nada, un mensaje que ofrezca ampliar
el rango o ver toda la categoría, con enlace. El texto está en el mockup.

## Retícula

Densa, con las tarjetas iguales a las del muestrario del home: foto cuadrada, etiqueta de
material, nombre en Instrument Serif, cédula de medidas con borde, precio o "Precio según
medidas".

Paginación o carga progresiva — decídelo tú, pero que funcione con SSR y que la URL
refleje la página.

## Reglas

- Las medidas son contenido principal, nunca letra chica en un acordeón. En salas y
  comedores el número de puestos va **antes** que los centímetros. Orden: ancho × alto ×
  profundidad, en cm.
- "Se fabrica a la medida" y "Precio según medidas" son un caso de primera clase: mismo
  tamaño y peso tipográfico que un precio normal, en `--hoja`.
- Meta tags por categoría y datos estructurados. El SEO es crítico.
- Móvil primero: en 360 px la retícula baja a una columna y el conmutador sigue visible.

Cuando termines, muéstrame el catálogo en los dos estados del conmutador, y el caso de una
categoría sin fotos.
```
