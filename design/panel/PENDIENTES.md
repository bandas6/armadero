# Pendientes

## Campos que le faltan al modelo

**Fecha en que se le quitó el acceso a un usuario.** `AdminUserRow` tiene `active`,
`lastLoginAt` y `createdAt`, pero no guarda cuándo se desactivó a alguien. En el rediseño
de Usuarios la tarjeta dice solo "Sin acceso"; para que diga "sin acceso desde el 3 de
agosto" hay que agregar el campo. No es bloqueante.

**Fecha en que se ocultó un mueble o una categoría.** Mismo caso, mismo efecto: se puede
decir que está oculto, no desde cuándo.

## Datos que faltan del negocio

**Año en que empezó el taller.** Va en el bloque de historia del inicio y en Ajustes. Con
el dato, la sección abre con "Fabricamos desde 2011…", que es lo que hace que un
desconocido se anime a escribir. Sin él, la frase no aparece.

**Dirección del local.** Va en el pie de página y en Ajustes. Hoy dice "Dirección
pendiente de confirmar". Es lo primero que busca quien quiere ir.

**Cuenta de Facebook.** El pie tiene Instagram; el enlace de Facebook apunta hoy a
WhatsApp como sustituto.

## Decisiones de producto por confirmar

**El tope de destacados en el inicio.** El rediseño de Muebles muestra "En el inicio 9 de
9" asumiendo nueve como máximo. Confirma el número real contra el backend.

**Si se muestran precios o solo se invita a cotizar.** Los rediseños muestran ambos casos
conviviendo: precio en firme donde lo hay, "Precio según medidas" donde no. Los precios
que aparecen en los mockups son de ejemplo.

## Lo que queda sin rediseñar

**El formulario de mueble** (`admin-product-form`) — el más largo del panel, con variantes
e imágenes embebidas. Es donde más se puede ganar en facilidad de uso y no se alcanzó a
tocar en esta ronda.
