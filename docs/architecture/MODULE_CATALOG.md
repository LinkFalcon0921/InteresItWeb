# Catálogo de Módulos (Module Catalog)

> **Proyecto:** InteresIt Terminal Financiera  
> **Versión:** 2.2  
> **Fecha:** 2026-11-07  

---

## 1. Módulos del Domain Layer (`$domain`)

### 1.1. `finance/simular.ts`
- **Propósito:** Función pura principal de proyección temporal de interés simple por períodos con capitalización en cortes.
- **Entrada:** `SimularParams` (`tasa: number`, `capital: number`, `aporte: number`, `desde: string`, `hasta: string`, `corte: number`, `omitirPrimero: boolean`).
- **Salida:** `SimulacionResultado` (`saldoFinal: number`, `interesTotal: number`, `periodos: PeriodoDetalle[]`).
- **Restricciones:** Fechas en UTC, base 365, cero efectos secundarios.

### 1.2. `finance/pares.ts`
- **Propósito:** Algoritmo combinatorial que genera todos los pares únicos sin repetición $n(n-1)/2$ para la comparativa de escenarios.
- **Entrada:** `T[]` (colección de escenarios).
- **Salida:** `[T, T][]` (colección de parejas ordenadas).

### 1.3. `value-objects/`
- `Money`: Encapsula importes monetarios no negativos, asegurando precisión decimal y redondeo a 2 posiciones.
- `InterestRate`: Encapsula tasas nominales anuales ($\ge 0$ y $\le 1000$).
- `CalendarDate`: Encapsula fechas en formato estricto ISO `YYYY-MM-DD` interpretadas en UTC.
- `CutoffDay`: Encapsula el día mensual de corte bancario ($1 \le d \le 31$) y calcula el tope para meses con menos días.

### 1.4. `parsers/`
- `FinancialInputParser`: Transforma valores de inputs no confiables (`unknown`) en números o instancias de Value Objects con reporte tipado de errores.
- `SettingsParser`: Valida y reconstruye la configuración proveniente de IndexedDB.

---

## 2. Módulos del Application Layer (`$application`)

### 2.1. `use-cases/CalculateSimulationUseCase.ts`
- **Propósito:** Orquestar la simulación de múltiples escenarios concurrentes, identificando el escenario líder, calculando la ventaja monetaria y consolidando las proyecciones mensuales.
- **Entrada:** `SimulationInputDTO`.
- **Salida:** `SimulationOutputDTO`.

### 2.2. `use-cases/CalculatePairMatrixUseCase.ts`
- **Propósito:** Orquestar la matriz comparativa de pares por hitos temporales para la Página 2 del reporte A4 y vista de pares.
- **Entrada:** Colección de escenarios y fechas acordadas.
- **Salida:** Estructura matricial de pares con ventajas por período.

### 2.3. `use-cases/ManageSettingsUseCase.ts`
- **Propósito:** Cargar y guardar la configuración del usuario en el repositorio de persistencia.
- **Dependencias:** `SettingsRepositoryPort`.

---

## 3. Módulos del Infrastructure Layer (`$infrastructure`)

### 3.1. `persistence/IndexedDBSettingsRepository.ts`
- **Propósito:** Implementar `SettingsRepositoryPort` interactuando con la base de datos `InteresItDB` del navegador sin librerías externas.
- **Compatibilidad:** Lee y escribe el documento `'current'` en el store `'settings'`.

### 3.2. `export/PrintExportAdapter.ts`
- **Propósito:** Implementar `ReportExportPort` preparando el documento A4 de dos páginas para invocación mediante `window.print()` con soporte de estilos `@media print`.

---

## 4. Módulos del Presentation Layer (`$presentation`)

### 4.1. `state/simuladorState.svelte.ts`
- **Propósito:** Store reactivo principal de la aplicación mediante Runes de Svelte 5 (`$state`, `$derived`).
- **Propiedades Reactivas:**
  - `capital`, `aporte`, `desde`, `hasta`, `corte`, `omitirPrimero`, `escenarios`.
  - `resultados` ($derived): Ejecuta el caso de uso y recalcula en tiempo real.
  - `mejor` ($derived): Escenario con mayor rendimiento neto.
  - `ventaja` ($derived): Diferencia en dinero entre el mejor y el segundo mejor escenario.

### 4.2. `components/`
- `layout/`: `TopNavBar.svelte`, `ParametersDrawer.svelte`, `TabNavigation.svelte`.
- `simulator/`: `ScenarioCardSMUI.svelte`, `RateChipSMUI.svelte`, `AdvantagePaper.svelte`, `ProjectionTableSMUI.svelte`.
- `amount-matrix/`: `AmountMatrixTable.svelte`.
- `guided-summary/`: `GuidedSummaryCards.svelte`.
- `export/`: `ExportSummaryA4.svelte`, `DashboardA4Page.svelte`, `PairComparisonA4Page.svelte`.
