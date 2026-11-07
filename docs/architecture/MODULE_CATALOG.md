# Catálogo de Módulos (Module Catalog v3.1)

> **Proyecto:** InteresIt Terminal Financiera  
> **Versión:** 3.1  
> **Fecha:** 2026-11-07  

---

## 1. Módulos del Domain Layer (`$domain`)

### 1.1. `finance/simular.ts`
- **Propósito:** Función pura principal de proyección temporal de interés con fechas reales de calendario.
- **Entrada:** `SimularParams` (`tasa: number`, `capital: number`, `aporte: number`, `desde: string`, `hasta: string`, `corte: number`, `omitirPrimero: boolean`, `aplicarImpuestoRD: boolean`).
- **Salida:** `SimulacionResultado` (`saldoFinal: number`, `interesTotal: number`, `totalAportado: number`, `totalInvertido: number`, `periodos: PeriodoDetalle[]`).
- **Restricciones:** Operaciones en UTC, base 365, clamping automático a fin de mes para días de corte, retención fiscal dominicana (10% Ley 253-12), cero efectos secundarios.

### 1.2. `finance/pares.ts`
- **Propósito:** Algoritmo combinatorial que genera todos los pares únicos sin repetición $n(n-1)/2$ para la comparativa de escenarios.
- **Entrada:** `T[]` (colección de escenarios).
- **Salida:** `[T, T][]` (colección de parejas ordenadas).

### 1.3. `value-objects/`
- **`Money`:** Encapsula importes monetarios no negativos ($\ge 0$), redondeo bancario exacto a 2 posiciones decimales y operaciones aritméticas seguras.
- **`InterestRate`:** Encapsula tasas nominales anuales ($\ge 0$ y $\le 1000$).
- **`CalendarDate`:** Encapsula fechas en formato estricto ISO `YYYY-MM-DD` interpretadas en UTC, con cálculo de diferencias en días solares.
- **`CutoffDay`:** Encapsula el día mensual de corte bancario ($1 \le d \le 31$) y calcula el tope para meses con menos días.

### 1.4. `parsers/`
- **`FinancialInputParser`:** Transforma valores de inputs no confiables (`unknown`) en números o instancias de Value Objects con reporte tipado de errores mediante `Result<T, E>`.
- **`SettingsParser`:** Valida y reconstruye la configuración proveniente de IndexedDB.
- **`Result.ts`:** Monad de retorno funcional `ok(value)` / `err(error)`.

### 1.5. `entities/`, `enums/`, `errors/`
- **`InvestmentScenario`:** Entidad que modela un escenario de inversión con ID, nombre, tasa nominal anual, color institucional y rol.
- **`PeriodCalculation`:** Entidad que representa la fotografía de balance, días transcurridos e interés devengado en un corte específico.
- **`SimulationResult`:** Consolidado de simulación multiescenario.
- **`ScenarioRole`:** Enum (`Leader`, `Challenger`, `Neutral`).
- **`ComparisonAdvantage`:** Enum (`Positive`, `Negative`, `Neutral`).
- **`DomainErrors`:** Clases de error específicas (`InvalidAmountError`, `InvalidDateRangeError`, `InvalidCutoffDayError`, `InvalidRateError`).

---

## 2. Módulos del Application Layer (`$application`)

### 2.1. Casos de Uso (`use-cases/`)

#### `CalculateSimulationUseCase.ts`
- **Propósito:** Orquestar la simulación de múltiples escenarios concurrentes (2 a 20 escenarios).
- **Lógica:** Valida las entradas con los parsers de dominio, ejecuta `simular.ts` para cada escenario, ordena los resultados por balance final, identifica al escenario líder (`Leader`), calcula la ventaja monetaria frente al competidor más cercano y consolida las filas de desglose mensual por corte.
- **Entrada:** `SimulationInputDTO`.
- **Salida:** `Result<SimulationOutputDTO, DomainError>`.

#### `CalculatePairMatrixUseCase.ts`
- **Propósito:** Generar la matriz combinatoria de pares $n(n-1)/2$ para la comparativa de escenarios y la Página 2 del reporte de impresión A4.
- **Lógica:** Ejecuta `combinarPares`, evalúa la diferencia de balances y rendimientos netos para cada par, asigna el rol favorecido y la ventaja institucional (`ComparisonAdvantage`).
- **Entrada:** `ScenarioSummaryDTO[]` o `SimulationOutputDTO`.
- **Salida:** `Result<PairMatrixDTO, DomainError>`.

#### `LoadSettingsUseCase.ts`
- **Propósito:** Recuperar la configuración persistida del usuario desde el repositorio.
- **Dependencias:** `SettingsRepositoryPort`.
- **Salida:** `Promise<Result<SettingsDTO, DomainError>>`.

#### `SaveSettingsUseCase.ts`
- **Propósito:** Validar y persistir la configuración activa del usuario.
- **Dependencias:** `SettingsRepositoryPort`.
- **Entrada:** `SettingsDTO`.
- **Salida:** `Promise<Result<void, DomainError>>`.

### 2.2. DTOs (`dtos/`)
- **`SimulationInputDTO`:** Capital inicial, aporte mensual, fechas desde/hasta, día de corte, omitir primer corte, impuesto RD y array de escenarios.
- **`SimulationOutputDTO`:** Totales invertidos y aportados, desglose de períodos con subtotales por escenario, lista de resúmenes por escenario, ID del líder y ventaja monetaria.
- **`PairMatrixDTO`:** Colección de comparaciones por parejas con diferencias y ventajas.
- **`SettingsDTO`:** Objeto completo de configuración para almacenamiento y transporte.

### 2.3. Puertos (`ports/`)
- **`SettingsRepositoryPort`:** Contrato para carga y almacenamiento de configuraciones (`getSettings()`, `saveSettings(dto)`).
- **`ReportExportPort`:** Contrato para la preparación y disparo del reporte ejecutivo para impresión o guardado PDF.

---

## 3. Módulos del Infrastructure Layer (`$infrastructure`)

### 3.1. Persistencia (`persistence/`)
- **`IndexedDBSettingsRepository.ts`:**
  - Implementación nativa de `SettingsRepositoryPort` sobre la base `InteresItDB` y el object store `settings`.
  - Lee y escribe el documento clave `'current'`, preservando retrocompatibilidad total con los datos de usuarios del monolito anterior.

### 3.2. Exportación de Reportes (`export/`)
- **`PrintExportAdapter.ts`:**
  - Implementación de `ReportExportPort` que prepara el documento HTML/CSS de 2 páginas A4 e invoca `window.print()`.
  - Utiliza reglas CSS `@media print` para lograr una fidelidad visual idéntica a los mockups institucionales sin añadir librerías pesadas al bundle.

---

## 4. Módulos del Presentation Layer (`$presentation`)

### 4.1. Estado Central Reactivo (`state/`)
- **`simuladorState.svelte.ts`:**
  - Store global en clase reactiva de Svelte 5 con Runes.
  - Estado mutable: `$state(capital)`, `$state(aporte)`, `$state(desde)`, `$state(hasta)`, `$state(diaCorte)`, `$state(escenarios)`.
  - Derivados: `$derived.by()` para ejecución instantánea de `CalculateSimulationUseCase` y `CalculatePairMatrixUseCase`.
  - Sincronización transparente con `SaveSettingsUseCase` mediante efectos secundarios controlados.

### 4.2. Componentes de Shell (`components/layout/`)
- **`TopNavBar.svelte`:** Barra superior institucional con logo, selector de modo claro/oscuro y disparador de filtros.
- **`ParametersDrawer.svelte`:** Drawer lateral para ingreso de parámetros (`Data Entry`), modal en dispositivos móviles y persistente en desktop.
- **`TabNavigation.svelte`:** TabBar de SMUI para navegar entre las vistas: *Simulador*, *Comparar montos* y *Resumen guiado*.

### 4.3. Componentes del Simulador (`components/simulator/`)
- **`ScenarioCardSMUI.svelte`:** Tarjeta de escenario con elevación institucional, borde destacado en el líder, saldo final, rendimiento neto y chip de tasa.
- **`RateChipSMUI.svelte`:** Píldora SMUI con tasa nominal anual.
- **`AdvantagePaper.svelte`:** Bloque destacado que exhibe la ventaja monetaria del líder frente al retador.
- **`ProjectionTableSMUI.svelte`:** DataTable de SMUI que expone el desglose mensual por fecha de corte, número exacto de días y saldo por escenario.

### 4.4. Vistas Complementarias (`components/amount-matrix/`, `components/guided-summary/`)
- **`AmountMatrixTable.svelte`:** Matriz de proyección cruzando diversos montos de aporte frente a horizontes de tiempo.
- **`GuidedSummaryCards.svelte`:** Tarjetas con hitos temporales fijos (3 meses, 6 meses, 1 año, 2 años, 5 años).

### 4.5. Componentes de Reporte A4 (`components/export/`)
- **`ExportSummaryA4.svelte`:** Contenedor maestro con reglas `@media print` optimizado para papel A4 estándar.
- **`DashboardA4Page.svelte`:** Página 1 del reporte: Encabezado institucional, Hero del líder, tarjetas de escenarios, gráfico de barras de acumulación y tabla de parámetros.
- **`PairComparisonA4Page.svelte`:** Página 2 del reporte: Tiempos acordados (T1..T7) y tabla comparativa de pares $n(n-1)/2$ con cálculo de ventajas.

---

## 5. Composition Root (`$di`)

- **`Container.ts`:**
  - Módulo encargado de instanciar `IndexedDBSettingsRepository`, inyectarlo en `LoadSettingsUseCase` y `SaveSettingsUseCase`, y exponer una factoría limpia de casos de uso para la capa de presentación.
