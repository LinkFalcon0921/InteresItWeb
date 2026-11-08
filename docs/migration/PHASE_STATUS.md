# Estado de Fases de Migración (Phase Status)

> **Proyecto:** InteresIt Terminal Financiera  
> **Versión del Plan:** 3.1  
> **Última Actualización:** 2026-11-07  

---

## 1. Tabla de Seguimiento de Fases

| Fase | Identificador | Nombre de Fase | Estado | Fecha de Inicio | Fecha de Cierre |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **0** | `PHASE-00` | Discovery & Legacy Audit | **COMPLETED** | 2026-11-07 | 2026-11-07 |
| **1** | `PHASE-01` | Architecture & Technical Decisions | **COMPLETED** | 2026-11-07 | 2026-11-07 |
| **2** | `PHASE-02` | Project Foundation & Quality Tooling | **COMPLETED** | 2026-11-07 | 2026-11-07 |
| **3** | `PHASE-03` | Domain Migration (Financial Core v2.2) | **COMPLETED** | 2026-11-07 | 2026-11-07 |
| **4** | `PHASE-04` | Application Layer (Use Cases & Ports) | **COMPLETED** | 2026-11-07 | 2026-11-07 |
| **5** | `PHASE-05` | Infrastructure & Adapters | **COMPLETED** | 2026-11-07 | 2026-11-07 |
| **6** | `PHASE-06` | Presentation Layer (Svelte 5 Runes + SMUI) | **COMPLETED** | 2026-11-07 | 2026-11-07 |
| **7** | `PHASE-07` | Feature Migration & DI Composition | **COMPLETED** | 2026-11-07 | 2026-11-07 |
| **8** | `PHASE-08` | CI/CD Approval Pipelines, Lighthouse & Release | **COMPLETED** | 2026-11-07 | 2026-11-07 |
| **9** | `PHASE-09` | Monolith Decommissioning & Legacy Quarantine | **COMPLETED** | 2026-11-07 | 2026-11-07 |
| **10** | `PHASE-10` | Interactive Onboarding & User Guidance (Driver.js) | **ON HOLD** | 2026-11-07 | — |
| **11** | `PHASE-11` | Multi-Portfolio Management (Clean Architecture) | **COMPLETED** | 2026-11-07 | 2026-11-07 |
| **12** | `PHASE-12` | Data Portability & Advanced Exporting | **COMPLETED** | 2026-11-07 | 2026-11-07 |
| **13** | `PHASE-13` | End-to-End Automated Testing (Playwright) | **COMPLETED** | 2026-11-07 | 2026-11-07 |
| **14** | `PHASE-14` | Production Resilience & Client Diagnostics | **COMPLETED** | 2026-11-07 | 2026-11-07 |

---

## 2. Detalle de Estado de Fases Completadas

### FASE 2 — Project Foundation & Quality Tooling
- **Objetivo:** Construir la base técnica ejecutable con herramientas de calidad y compilación estática.
- **Entregables Completados:**
  - [x] Configuración de dependencias en `package.json` con Svelte 5, SvelteKit adapter-static, SMUI 9.x y Vitest.
  - [x] Configuración de SvelteKit con `@sveltejs/adapter-static` (`pages: build`, `assets: build`, `fallback: 404.html`) y alias de arquitectura limpia (`$domain`, `$application`, `$infrastructure`, `$presentation`, `$di`).
  - [x] Configuración estricta de TypeScript 7 en `tsconfig.json`.
  - [x] Compilación y tokens Sass institucionales Excel SAFI en `src/theme/_smui-theme.scss` y `src/theme/dark/_smui-theme.scss`.
  - [x] Control estricto de límites de líneas físicas (`scripts/check-lines.js`).
  - [x] Scripts de calidad operativos: `pnpm check`, `pnpm test`, `pnpm check:lines`, `pnpm build`.
- **Estado:** COMPLETED.

### FASE 3 — Domain Migration (Financial Core v2.2)
- **Objetivo:** Implementar la lógica matemática y reglas financieras en funciones puras y Value Objects inmutables con 100% de cobertura.
- **Entregables Completados:**
  - [x] Value Objects inmutables: `Money`, `InterestRate`, `CalendarDate`, `CutoffDay`.
  - [x] Entidades y Enums del Dominio: `InvestmentScenario`, `PeriodCalculation`, `SimulationResult`, `ScenarioRole`, `ComparisonAdvantage`.
  - [x] Parsers tipados con `Result<T, E>`: `FinancialInputParser`, `SettingsParser`.
  - [x] Errores tipados de dominio: `DomainErrors`.
  - [x] Lógica financiera pura: `finance/simular.ts` (fechas exactas en UTC, base 365, día de corte bancario con clamping mensual, retención fiscal del 10% ley dominicana, omisión condicional de primer corte, proyección de balances y aportes $PMT$).
  - [x] Comparativa combinatorial: `finance/pares.ts` (generación $n(n-1)/2$ y comparación matricial).
  - [x] Suite de caracterización en Vitest (`tests/unit/domain/`) con 43 pruebas unitarias pasando al 100%, validando con exactitud al centavo las referencias oficiales de ADR-004.
- **Estado:** COMPLETED.

### FASE 4 — Application Layer (Use Cases & Ports)
- **Objetivo:** Implementar los casos de uso, DTOs y puertos abstractos de la aplicación.
- **Entregables Completados:**
  - [x] DTOs de entrada y salida: `SimulationInputDTO`, `SimulationOutputDTO`, `PairMatrixDTO`, `SettingsDTO`.
  - [x] Puertos de infraestructura: `SettingsRepositoryPort`, `ReportExportPort`.
  - [x] Caso de uso `CalculateSimulationUseCase`: orquestación multiescenario, detección de líder, cálculo de ventaja monetaria y desglose mensual.
  - [x] Caso de uso `CalculatePairMatrixUseCase`: cálculo de diferencias matriciales de pares y asignación de ventaja por escenario.
  - [x] Casos de uso de configuración: `LoadSettingsUseCase` y `SaveSettingsUseCase` con validación mediante parsers de dominio.
  - [x] Suite de pruebas unitarias (`tests/unit/application/`): 35 pruebas cubriendo los casos de uso con mocks de puertos y validaciones de bordes.
- **Estado:** COMPLETED.

### FASE 5 — Infrastructure & Adapters
- **Objetivo:** Implementar adaptadores de persistencia y servicios externos.
- **Entregables Completados:**
  - [x] `IndexedDBSettingsRepository.ts`: repositorio asíncrono sobre `InteresItDB` con compatibilidad para los datos existentes.
  - [x] `PrintExportAdapter.ts`: adaptador para emisión y visualización del reporte ejecutivo A4 de 2 páginas con estilos `@media print`.
  - [x] Suite de pruebas unitarias y de integración (`tests/unit/infrastructure/`): 15 pruebas cubriendo IndexedDB y el adaptador de impresión.
- **Estado:** COMPLETED.

### FASE 6 — Presentation Layer (Svelte 5 Runes + SMUI 9.x)
- **Objetivo:** Construir la interfaz de usuario completa basada en componentes Svelte Material UI y reactividad de Runes Svelte 5.
- **Entregables Completados:**
  - [x] `financialFormatters.ts`: formateadores de moneda dominicana (DOP / `$`), porcentajes con cifras tabulares, días y diferenciales con signo explícito.
  - [x] `SimulatorState.svelte.ts`: gestor reactivo de estado con Runes (`$state`, `$derived`, `$derived.by`) y desacoplamiento estricto de la lógica financiera.
  - [x] `HeaderSMUI.svelte`: barra institucional superior con identidad InteresIt, botón de menú móvil, toggle de modo oscuro y acciones de guardado y exportación.
  - [x] `QuickChips.svelte`: selector interactivo de incrementos/decrementos numéricos (`-100`, `-50`, `-20`, `+20`, `+50`, `+100`).
  - [x] `DataEntrySMUI.svelte`: formulario institucional para capital inicial, aporte recurrente, fechas de horizonte, día de corte bancario y switches de reglas.
  - [x] `HeroCardSMUI.svelte`: tarjeta Hero en `#004851` con saldo estimado del escenario líder, ganancia neta devengada y píldoras de plazo rápido (`3 m`, `6 m`, `1 año`).
  - [x] `ScenarioCardSMUI.svelte` y `ScenarioListSMUI.svelte`: tarjetas modulares para hasta 20 escenarios de inversión con badge dorado `#F6E7C3` para el líder.
  - [x] `PairComparisonSMUI.svelte`: análisis matricial y banner de ventaja monetaria entre instrumentos.
  - [x] `ProjectionTableSMUI.svelte`: tabla con `DataTable` de SMUI para el desglose mensual del saldo, días del período e intereses netos.
  - [x] `ParametersDrawerSMUI.svelte`: drawer modal accesible con scrim para dispositivos móviles.
  - [x] `ExportDialogSMUI.svelte`: diálogo modal para configuración y descarga de reporte institucional en PDF o impresión.
  - [x] `+page.svelte`: integración visual SPA responsiva de escritorio y móvil conectada con el contenedor de dependencias (`$di`).
  - [x] Suite de pruebas unitarias (`tests/unit/presentation/` y `tests/unit/di/`): 25 pruebas pasando al 100%.
- **Estado:** COMPLETED.

### FASE 7 — Feature Migration & DI Composition
- **Objetivo:** Orquestar el punto de composición central de dependencias (DI Container) y capacidades PWA offline de nivel producción.
- **Entregables Completados:**
  - [x] Contenedor de Inyección de Dependencias (`src/lib/di/Container.ts`): Interfaces `AppContainer`, `AppDependencies`, factoría `createAppContainer(overrides?)`, singleton `getAppContainer()`, helpers reactivos de contexto Svelte 5 (`setContainerContext`, `getContainerContext`) y vinculación limpia con `SimulatorState`.
  - [x] Integración de Contexto en Root Layout (`src/routes/+layout.svelte`): Inicialización del contenedor raíz en el contexto de Svelte 5 para abastecimiento transparente a toda la jerarquía de componentes.
  - [x] Service Worker PWA (`src/service-worker.ts`): Precacheo completo de activos Vite (`build`), recursos estáticos (`files`) y rutas prerenderizadas (`prerendered`), depuración de cachés en activación (`activate`), estrategia cache-first para activos estáticos y network-first con fallback a cache / appShell para navegación, además de manejo de fallos y peticiones externas.
  - [x] Manifiesto PWA (`static/manifest.json`): Definición de metadatos de aplicación (`id: "./"`, `scope: "./"`, `start_url: "./"`, `display: "standalone"`, color temático `#004851` e íconos en formatos webp y png con soporte any y maskable).
  - [x] Suite de pruebas unitarias (`tests/unit/di/Container.test.ts`): 15 pruebas unitarias verificando inyección de dependencias por defecto, cascadas con mocks, reemplazo de casos de uso, ciclo de vida del singleton, acceso y errores de contexto de Svelte 5 y ejecución de simulaciones financieras.
- **Estado:** COMPLETED.

### FASE 8 — CI/CD Approval Pipelines, Lighthouse & Release
- **Objetivo:** Configurar pipelines automatizados en GitHub Actions para Node 24, auditoría Lighthouse y paquete de release.
- **Entregables Completados:**
  - [x] Workflow de Integración Continua: `.github/workflows/ci.yml` ejecutando verificación de líneas (`pnpm check:lines`), comprobación de tipos (`pnpm check`), pruebas unitarias (`pnpm test`) y build estático en Node 24.
  - [x] Workflow de Despliegue a GitHub Pages: `.github/workflows/deploy.yml` automatizando el despliegue a producción de la carpeta `build/` en cada push a `main`.
  - [x] Depuración de workflows heredados: eliminación de `.github/workflows/static.yml` obsoleto.
  - [x] Optimización de metadatos web en `src/app.html`: etiquetas OpenGraph, meta description SEO, `viewport-fit=cover`, tema institucional y hojas de estilo SMUI segregadas por color scheme.
  - [x] Reporte de Auditoría Lighthouse (`docs/release/LIGHTHOUSE_AUDIT_REPORT.md`): Puntuaciones 98-100 en Performance, 100 en Accesibilidad, 100 en Best Practices, 100 en SEO y 100% PWA.
  - [x] Notas de Versión v2.2 (`docs/release/V2_RELEASE_NOTES.md`): balance de modernización y eliminación de deuda técnica.
  - [x] Checklist de Paso a Producción (`docs/release/RELEASE_CHECKLIST.md`): dictamen favorable para lanzamiento.
- **Estado:** COMPLETED.

### FASE 9 — Monolith Decommissioning & Legacy Quarantine
- **Objetivo:** Descomisionar el monolito web original (`index.html`, `sw.js`, `manifest.json`), reubicándolo en la carpeta `legacy/` para su preservación histórica como baseline, asegurando que los pipelines de CI, scripts de calidad y el build estático sean 100% autónomos sin dependencias de archivos raíz heredados.
- **Entregables Completados:**
  - [x] Reubicación del monolito heredado: `index.html` (669 líneas), `sw.js` y `manifest.json` movidos a `legacy/`.
  - [x] Documentación de baseline: `legacy/README.md` documentando el propósito histórico y paridad funcional.
  - [x] Configuración de `scripts/check-lines.js`: exclusión explícita del directorio `legacy/` para concentrar la verificación en el código de producción moderno.
  - [x] Autonomía de compilación y CI: `.github/workflows/ci.yml` y `.github/workflows/deploy.yml` operando de manera 100% independiente con SvelteKit adapter-static.
- **Estado:** COMPLETED.

### FASE 10 — Interactive Onboarding & User Guidance (Driver.js)
- **Objetivo:** Diseñar e integrar un sistema de onboarding interactivo y guía guiada framework-agnostic con `driver.js`.
- **Estado:** ON HOLD (Fase pausada por instrucción directa para desarrollo en línea de trabajo paralela).

### FASE 11 — Multi-Portfolio Management (Clean Architecture)
- **Objetivo:** Implementar la capacidad de gestionar múltiples portafolios de inversión en almacenamiento local IndexedDB bajo Clean Architecture, permitiendo a los usuarios crear, listar, renombrar, alternar y eliminar portafolios completos con persistencia del portafolio activo y aislamiento de escenarios.
- **Entregables Completados:**
  - [x] Modelado y DTOs en Application Layer: `PortfolioDTO`, `PortfolioSummaryDTO`, constantes `DEFAULT_PORTFOLIO_ID`, `DEFAULT_PORTFOLIO_NAME` y `activePortfolioId` en `SettingsDTO`.
  - [x] Casos de uso de portafolios (`src/lib/application/use-cases/`): `ListPortfoliosUseCase`, `LoadPortfolioUseCase`, `SavePortfolioUseCase`, `DeletePortfolioUseCase` y `RenamePortfolioUseCase` con validaciones de unicidad, existencia, límites de caracteres (máx. 100) y regla de portafolio mínimo.
  - [x] Adaptador de persistencia en Infrastructure: `IndexedDBSettingsRepository` con operaciones CRUD sobre el registro `portfolios` en `InteresItDB`, inicialización automática (bootstrap) del portafolio por defecto, preservación de fecha `createdAt` y persistencia de `activePortfolioId`.
  - [x] Contenedor de Inyección de Dependencias (`Container.ts`): Registro e inyección de todos los casos de uso de portafolios en `AppDependencies` y `AppContainer`.
  - [x] Estado reactivo en Presentation: `SimulatorState.svelte.ts` ampliado con `currentPortfolioId`, `currentPortfolioName`, `portfolios`, `isPortfolioDialogOpen`, `switchPortfolio`, `saveCurrentPortfolio`, `createPortfolio`, `renamePortfolio` y `deletePortfolio`.
  - [x] Componentes de interfaz: `PortfolioDialogSMUI.svelte` (modal accesible con atajo Escape via `svelte:window`, mensajes de error semánticos, modo claro/oscuro) y botón de acceso directo `💼 [Nombre Portafolio]` en `HeaderSMUI.svelte`.
  - [x] Pruebas automatizadas: Cobertura completa en `PortfolioUseCases.test.ts`, `IndexedDBSettingsRepository.test.ts` y `SimulatorState.test.ts`. Total acumulado: 143 pruebas pasando al 100% sin contar la Fase 10 (en pausa).
- **Estado:** COMPLETED.

### FASE 12 — Data Portability & Advanced Exporting
- **Objetivo:** Facilitar la portabilidad total de la información financiera y las configuraciones de portafolios del usuario mediante exportación a CSV estandarizado y mecanismos de respaldo/restauración de copias de seguridad en JSON con validación estricta de esquema.
- **Entregables Completados:**
  - [x] Generador CSV de Proyección (`src/lib/domain/export/csvExport.ts`): función de dominio pura `generateProjectionCSV` con encabezados canónicos (`Período, Fecha de Corte, Días, Saldo Inicial, Interés Bruto, Retención Ley 10% (RD), Interés Neto, Aporte Mensual, Saldo Final`), precisión fija a dos decimales y soporte multiescenario.
  - [x] DTO y Parser de Respaldo (`src/lib/application/dtos/BackupDTO.ts` y `src/lib/domain/parsers/BackupParser.ts`): especificación `BACKUP_SCHEMA_VERSION = 1` y parser estricto `BackupParser.parse()` retornando `Result<BackupDTO, ParseInputError>` con validación contra esquemas truncados o corruptos.
  - [x] Casos de Uso de Respaldo (`src/lib/application/use-cases/`): `ExportBackupUseCase` e `ImportBackupUseCase` para exportación atómica de portafolios/configuraciones y restauración segura en el repositorio.
  - [x] Integración en UI (`ExportDialogSMUI.svelte`): diálogo modal con 3 pestañas accesibles (`Reporte PDF`, `Exportar CSV`, `Backup / Restauración`) con selección de escenario para CSV y selector de archivo local para importación.
  - [x] Pruebas automatizadas: 18 pruebas unitarias añadidas en `csvExport.test.ts` y `BackupUseCases.test.ts`. Total Vitest acumulado: 161 pruebas pasando al 100%.
- **Estado:** COMPLETED.

### FASE 13 — End-to-End Automated Testing (Playwright)
- **Objetivo:** Asegurar la integridad funcional de los flujos críticos de la Single Page Application mediante una suite automatizada End-to-End con Playwright navegando la aplicación real construida con Vite y servida en previsualización estática.
- **Entregables Completados:**
  - [x] Configuración de infraestructura E2E (`playwright.config.ts`): integración con `@playwright/test` en Chromium, servidor web preview integrado en el puerto 4173 (`timeout: 60s`).
  - [x] Especificaciones de prueba (`tests/e2e/`):
    - `simulator.spec.ts`: carga institucional, validación de moneda exacta (DOP / `$`), adición y comparativa de escenarios, navegación entre pestañas, diagnóstico de salud, resiliencia offline 100% (`context.setOffline(true)`), operación en drawer móvil (`375x667`), y generación y restauración de simulación mediante enlace Base64 URL-safe (`#sim=...`).
    - `portfolio.spec.ts`: creación de portafolios, alternancia de portafolio activo, renombrado en línea y eliminación de portafolios con actualización reactiva en el encabezado.
    - `data-portability.spec.ts`: descarga y validación de encabezados del archivo CSV mensual, descarga de backup JSON, restauración íntegra y rechazo controlado de archivos de backup corruptos sin caídas de la aplicación.
  - [x] Scripts y CI/CD: script `"test:e2e": "playwright test"` integrado en `package.json` y flujo automatizado en `.github/workflows/ci.yml`.
  - [x] Ejecución: 12 pruebas E2E pasando exitosamente.
- **Estado:** COMPLETED.

### FASE 14 — Production Resilience, Client Diagnostics & QA Remediation
- **Objetivo:** Elevar la resiliencia en tiempo de ejecución del cliente Svelte 5, proveer diagnósticos transparentes sobre el almacenamiento IndexedDB y Service Worker PWA, e implementar capacidades de cálculo avanzado (Inflación de Fisher, Aportes Extraordinarios y Enlace Compartir URL).
- **Entregables Completados:**
  - [x] Error Boundary Svelte 5 (`<svelte:boundary>`): implementado en `src/routes/+page.svelte` con snippet `#snippet failed(error, reset)` y suite unitaria dedicada `tests/unit/presentation/BoundaryRecovery.test.ts` verificando el reinicio a valores seguros estables.
  - [x] Modal de Diagnósticos del Cliente (`DiagnosticsDialogSMUI.svelte`): visualización de estado en tiempo real del Service Worker, cuota y uso de almacenamiento en IndexedDB vía `navigator.storage.estimate()`, versión del sistema (v2.2.0) y sincronización de estado.
  - [x] Ciclo de Vida Multi-Pestaña IndexedDB (`IndexedDBSettingsRepository.ts`): gestión de eventos `onblocked`, `onversionchange`, y método `close()`.
  - [x] Test Harness de Transacciones Reales con `fake-indexeddb`: pruebas de repositorio y contratos de `SettingsRepositoryPort` sin mocks artificiales (`IndexedDBSettingsRepository.test.ts`).
  - [x] Eliminación de Mocks Duplicados: creación de `tests/fakes/FakeSettingsRepository.ts` como doble de prueba canónico tipado.
  - [x] Fortalecimiento de Aserciones: eliminación de chequeos superficiales `toBeDefined()` en favor de valores exactos al centavo (`simular.test.ts:84`, `simular.test.ts:108`, `CalculateSimulationUseCase.test.ts`, `PortfolioUseCases.test.ts`, `SettingsUseCases.test.ts`).
  - [x] Inflación según la Ecuación de Fisher: Value Object `InflationRate`, tasa real $r_{\text{real}} = \frac{1 + r_{\text{nominal}}}{1 + i} - 1$, cálculo de poder adquisitivo deflactado en `simular.ts`, y visualización en `HeroCardSMUI.svelte` y `DataEntrySMUI.svelte`.
  - [x] Aportes Extraordinarios Programados: entidad `AporteExtraordinario`, integración en ciclo de simulación y componente `AportesExtraordinariosSMUI.svelte`.
  - [x] Enlace Compartir en URL Base64 URL-safe: servicio `ShareUrlCodec`, sincronización con `#sim=...`, y pestaña de compartir con copiado rápido en `ExportDialogSMUI.svelte`.
  - [x] Convención Bancaria Oficial: ADR-004 formalizada con base 365 días calendario exactos en `simular.ts` y documentada en `AGENTS.md §1.2`.
- **Estado:** COMPLETED.

---

## 3. Estado del Proyecto y Cierre de Migración
- **Estado Global:** FASES 0 A 9 Y FASES 11, 12, 13, 14 COMPLETADAS (Fase 10 estrictamente en pausa / on hold).
- **Pruebas Automatizadas:** 179 pruebas unitarias pasando al 100% en Vitest (19 archivos de prueba) + 12 pruebas E2E pasando al 100% en Playwright.
- **Calidad de Código:** 0 errores en `svelte-check`, 0 archivos excediendo límites de líneas (máximo 600, alerta 450).
- **Despliegue:** Preparado y verificado para despliegue automatizado en GitHub Pages vía Node 24 y SvelteKit adapter-static con pipeline de CI que incluye Vitest y Playwright.

