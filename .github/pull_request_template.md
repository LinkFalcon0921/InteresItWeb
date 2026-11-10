## Descripción del Cambio
<!-- Resume brevemente qué fase o funcionalidad abarca este Pull Request -->

## Fase de Migración Asociada
- [ ] Fase 2: Project Foundation & Quality Tooling
- [ ] Fase 3: Domain Migration (Financial Core v2.2)
- [ ] Fase 4: Application Layer (Use Cases & Ports)
- [ ] Fase 5: Infrastructure & Adapters (IndexedDB + Print)
- [ ] Fase 6: Presentation Layer (Svelte 5 Runes + SMUI)
- [ ] Fase 7: Feature Migration & DI Composition
- [ ] Fase 8: CI/CD Approval Pipelines, Lighthouse & Release

## Checklist de Calidad Obligatorio
- [ ] **Límite de Líneas:** `pnpm run check:lines` pasa sin errores (>600 líneas) ni advertencias (>450 líneas).
- [ ] **Diagnóstico de Tipos:** `pnpm check` pasa con 0 errores y 0 advertencias bajo TypeScript 7 estricto.
- [ ] **Pruebas Unitarias:** `pnpm test` ejecuta el 100% de la suite con resultado exitoso.
- [ ] **Compilación:** `pnpm run build` genera la SPA estática sin errores en `build/`.
- [ ] **Sin tipos prohibidos:** No se utilizan `any`, castings manuales forzados (`as SomeType`) ni non-null assertions (`!`).

## Verificación Manual Realizada
- [ ] Comprobación visual en desktop y móvil.
- [ ] Verificación de persistencia offline en IndexedDB.
- [ ] Verificación de la compuerta de aprobación en GitHub Actions para producción.
