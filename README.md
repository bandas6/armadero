# Web

Frontend del catálogo de Artemadero: Angular con SSR, Tailwind y la API de
`armadero-api`.

## La dirección de diseño

El sitio sigue la **Dirección 03 — "Tejido o madera"**, aprobada por la clienta. La
referencia visual es `design/direccion-03-tejido-o-madera/index.html`: ábrelo en el
navegador antes de tocar una pantalla. Los cuatro prompts de implementación
(`design/PROMPT-1-arranque.md` … `PROMPT-4-ficha.md`) explican cada pantalla y las reglas
que no se negocian.

La idea que lo sostiene: **el sitio entero está partido en tejido y madera**, y ese corte
aparece tres veces —el hero del home en dos mitades, el conmutador del catálogo, y el
enlace a la pieza gemela en cada ficha—. Si termina siendo un checkbox en una barra
lateral, se perdió el diseño.

Los tokens de color y las dos familias tipográficas viven en `src/styles.css`. El código
de material es funcional: naranja es tejido y azul es madera, siempre.

## Datos que faltan

Están marcados como `PENDIENTE` en `src/app/core/business.ts` y listados en
`docs/pendientes-diseno.md`: la **dirección del local**, el **año de fundación** y las
cuentas de **Instagram y Facebook**. No hay que inventarlos.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
