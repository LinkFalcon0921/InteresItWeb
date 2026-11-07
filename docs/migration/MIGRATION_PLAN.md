# Plan Estratégico de Migración Incremental (Migration Plan)

> **Proyecto:** InteresIt Terminal Financiera  
> **Versión:** 2.2  
> **Fecha:** 2026-11-07  

---

## 1. Principio Rector

La migración se ejecutará de forma **estrictamente incremental por fases verticales**, donde ninguna fase avanza sin haber validado sus propios criterios de aceptación, pruebas y controles obligatorios (límite de líneas, tipado estricto, build y tests).

El monolito original (`index.html`) se preserva intacto durante las fases 1 a 6 como baseline de comparación y caracterización, y solo se reemplaza en la fase de integración (Fase 7).

---

## 2. Mapa Detallado de Fases

### FASE 1 — Architecture & Technical Decisions
- **Objetivo:** Establecer las reglas arquitectónicas definitivas y documentar ADRs.
- **Prerrequisitos:** FASE 0 completada y aprobada.
- **Actividades:** Redactar documentos de arquitectura, reglas de dependencias, catálogo de módulos, estándares de desarrollo y ADRs.
- **Entregables:** Documentos en `docs/architecture/`, `docs/standards/`, `docs/migration/`, `docs/adr/`.
- **Estrategia de Rollback:** Reversión de commits de documentación mediante Git.

### FASE 2 — Project Foundation & Quality Tooling
- **Objetivo:** Construir la base técnica ejecutable con herramientas de calidad sin migrar funcionalidades aún.
- **Prerrequisitos:** FASE 1 completada y aprobada.
- **Actividades:** Configurar `package.json` con `pnpm 12`, `svelte.config.js` (`adapter-static`), `vite.config.ts`, `tsconfig.json` (strict TS 7), `smui-theme` con Sass, `@fontsource/public-sans`, Vitest y script de líneas físicas (`check:lines`).
- **Entregables:** Proyecto ejecutable, scripts de calidad (`pnpm test`, `pnpm check`, `pnpm check:lines`), configuración CI.
- **Estrategia de Rollback:** `git clean -fd` y `git checkout` al commit base de Fase 1.

### FASE 3 — Domain Migration (Financial Core v2.2)
- **Objetivo:** Implementar la lógica matemática y reglas financieras en funciones puras y Value Objects.
- **Prerrequisitos:** FASE 2 completada y aprobada.
- **Actividades:** Crear `simular.ts` (fechas UTC, base 365, día de corte), `pares.ts` (combinatoria $n(n-1)/2$), Value Objects (`Money`, `InterestRate`, `CutoffDay`, `CalendarDate`), parsers de entrada y suite de pruebas unitarias en Vitest.
- **Entregables:** Módulo `$domain` completo con 100% de cobertura en cálculos financieros.
- **Estrategia de Rollback:** Eliminar carpeta `src/lib/domain/`.

### FASE 4 — Application Layer (Use Cases & Ports)
- **Objetivo:** Implementar los casos de uso y contratos de aplicación.
- **Prerrequisitos:** FASE 3 completada y aprobada.
- **Actividades:** Crear casos de uso (`CalculateSimulationUseCase`, `CalculatePairMatrixUseCase`, `LoadSettingsUseCase`, `SaveSettingsUseCase`), DTOs y puertos de infraestructura (`SettingsRepositoryPort`, `ReportExportPort`).
- **Entregables:** Módulo `$application` probado con stubs/mocks.
- **Estrategia de Rollback:** Eliminar carpeta `src/lib/application/`.

### FASE 5 — Infrastructure & Adapters
- **Objetivo:** Implementar persistencia y adaptadores de servicios externos.
- **Prerrequisitos:** FASE 4 completada y aprobada.
- **Actividades:** Crear `IndexedDBSettingsRepository` nativo (con Promises, retrocompatible con `InteresItDB`) y `PrintExportAdapter` (adaptador de impresión A4).
- **Entregables:** Módulo `$infrastructure` con pruebas de integración.
- **Estrategia de Rollback:** Eliminar carpeta `src/lib/infrastructure/`.

### FASE 6 — Presentation Layer (Svelte 5 Runes + SMUI)
- **Objetivo:** Construir los componentes visuales institucionales con Svelte Material UI y Runes.
- **Prerrequisitos:** FASE 4 y FASE 5 completadas.
- **Actividades:** Crear componentes SMUI modulares (`TopNavBar`, `ParametersDrawer`, `TabNavigation`, `ScenarioCardSMUI`, `ProjectionTableSMUI`, `AmountMatrixTable`, `GuidedSummaryCards`, `ExportSummaryA4`) y store reactivo con Runes en `simuladorState.svelte.ts`.
- **Entregables:** Módulo `$presentation` cumpliendo límite de 450/600 líneas por componente.
- **Estrategia de Rollback:** Eliminar carpeta `src/lib/presentation/`.

### FASE 7 — Feature Migration & DI Composition
- **Objetivo:** Ensamblar la aplicación completa en el Composition Root y activar Service Worker.
- **Prerrequisitos:** FASE 5 y FASE 6 completadas.
- **Actividades:** Ensamblar dependencias en `src/lib/di/Container.ts`, conectar `src/routes/+page.svelte` y configurar `service-worker.ts` para PWA offline.
- **Entregables:** SPA operativa completa en el cliente.
- **Estrategia de Rollback:** Revertir a invocación aislada de componentes.

### FASE 8 — Integration, Lighthouse & Release
- **Objetivo:** Validación global, pruebas de regresión, auditoría y despliegue a GitHub Pages.
- **Prerrequisitos:** FASE 7 completada.
- **Actividades:** Pruebas end-to-end de regresión, auditoría de accesibilidad (Lighthouse score > 90), verificación de líneas físicas y workflow de GitHub Actions (`.github/workflows/deploy.yml`).
- **Entregables:** Release final, informe de calidad y documentación de cierre.
