# ADR-002: Adopción de Svelte Material UI (SMUI 9.x) y Sass Theming

## Estado
Aceptado

## Contexto
El producto requiere una apariencia sobria, formal e institucional inspirada en fondos de inversión dominicanos (Excel SAFI). Tras evaluar shadcn-svelte y Tailwind, el equipo técnico decidió utilizar **Svelte Material UI (SMUI)** para aprovechar componentes corporativos basados en Material Design Web con soporte nativo de microinteracciones accesibles (elevation, ripple, outlined inputs, drawers modales).

## Decisión
1. Adoptar **Svelte Material UI (SMUI 9.x)** (`svelte-material-ui`, `@smui/*`) para los componentes de presentación.
2. Compilar los tokens de diseño institucional (`#004851` Teal, `#5E6B6A` Pizarra, `#F6E7C3` Oro) mediante Sass y `smui-theme` en `src/theme/_smui-theme.scss`.
3. Adoptar `@fontsource/public-sans` con la directiva `font-variant-numeric: tabular-nums` para alineación monetaria en tablas y tarjetas.

## Consecuencias
### Positivas
- Componentes altamente probados, accesibles y consistentes (`TopAppBar`, `Drawer`, `Card`, `DataTable`, `TabBar`, `Chips`, `LinearProgress`, `Textfield`, `Snackbar`).
- Cumplimiento estricto de las reglas de aislamiento del repositorio (Svelte 5 / SvelteKit).
- La lógica de negocio permanece 100% desacoplada en el Domain Layer.

### Negativas / Mitigaciones
- SMUI requiere preprocesador de Sass (`sass`) y compilación de temas vía `smui-theme`. Se añade al pipeline de build en `package.json` mediante el script `smui-theme compile`.
