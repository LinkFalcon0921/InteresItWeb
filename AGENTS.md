# AGENTS.md — InteresIt: Terminal Financiera

> **Documento Central de Conocimiento, Arquitectura y Reglas para Agentes de IA**
> **Última actualización:** 2026-11-07
> **Stack exclusivo:** Svelte 5 | TypeScript | Node 24 | Tailwind CSS | Vitest | SvelteKit (adapter-static)

---

## 1. Visión y Dominio del Proyecto

### 1.1 ¿Qué es InteresIt?
**InteresIt** es una terminal financiera y calculadora avanzada de interés compuesto diseñada como una Single Page Application (SPA) que se ejecuta 100% en el cliente (navegador del usuario), garantizando total privacidad y funcionamiento offline (PWA).

Su propósito central es proyectar el crecimiento del capital en el tiempo calculando intereses con base en **fechas exactas de calendario**, la **cantidad real de días transcurridos por período** (incluyendo años bisiestos) y la fecha de **corte bancario mensual**, contrastando simultáneamente múltiples estrategias de inversión (desde 2 hasta 20 escenarios).

### 1.2 Reglas Financieras y Matemáticas del Core (Single Source of Truth)

1. **Entradas Principales:**
   - **Capital Inicial ($P$):** Monto inicial base de la inversión ($\ge 0$).
   - **Aporte Mensual ($PMT$):** Suma aportada en cada ciclo de corte mensual ($\ge 0$).
   - **Aportes Extraordinarios Programados:** Depósitos puntuales adicionales programados para fechas calendario específicas (ej. bonificaciones, regalía pascual RD, aguinaldos) que se integran en el ciclo correspondiente según su fecha.
   - **Horizonte de Inversión:** Fecha de inicio (`Desde`), Fecha de fin (`Hasta`) donde `Desde < Hasta`.
   - **Día de Corte Mensual (`diaCorte`):** Entero entre `1` y `31` que simula el día del mes en que la entidad financiera corta el saldo y capitaliza intereses.
   - **Omitir 1º Corte (`omitirPrimerCorte`):** Booleano. Si se activa y el intervalo entre la fecha de inicio y el primer corte es menor al número total de días del mes en curso, no se capitalizan intereses en ese primer ciclo parcial (simulando depósitos tardíos en el mes).
   - **Inversiones dinámicas ($N \le 20$):** Cada una con nombre, tasa nominal anual (%) y color identificador.
   - **Retención Fiscal República Dominicana (`aplicarImpuesto`):** Deducción por ley del 10% sobre los intereses brutos ganados en cada período:
     $$\text{Interés Neto} = \text{Interés Bruto} \times 0.90$$
   - **Tasa de Inflación Estimada Anual ($i$):** Porcentaje opcional ($\ge 0$) para calcular la tasa real y el poder adquisitivo deflactado según la Ecuación de Fisher.

2. **Fórmulas de Capitalización y Convención de Días (ADR-004 Base 365):**
   - Interés bruto ganado en un período de $d$ días calendario exactos:
     $$I_{\text{bruto}} = \text{balance} \times \left(\frac{\text{tasaAnual}}{100}\right) \times \left(\frac{d}{365}\right)$$
   - Interés efectivo:
     $$I = \begin{cases} 0 & \text{si es omitido por primer corte} \\ I_{\text{bruto}} \times 0.90 & \text{si aplica impuesto (10% RD)} \\ I_{\text{bruto}} & \text{sin impuesto} \end{cases}$$
   - Balance acumulado al final del período $t$:
     $$\text{balance}_{t} = \text{balance}_{t-1} + I + PMT + \sum \text{AportesExtraordinarios}_{t}$$
   - Rendimiento neto acumulado (ganancia total neta):
     $$\text{Ganancia Total} = \text{Balance Final} - \left(P + \sum PMT + \sum \text{AportesExtraordinarios}\right)$$
   - **Fórmula de Fisher para Rendimiento e Inflación:**
     $$r_{\text{real}} = \frac{1 + r_{\text{nominal}}}{1 + i} - 1$$
     $$\text{Balance Real (Poder Adquisitivo)} = \frac{\text{Balance Final}}{\left(1 + \frac{i}{100}\right)^{\frac{d_{\text{total}}}{365}}}$$

3. **Manejo de Fechas:**
   - La fecha de corte avanza iterativamente calculando el día de corte exacto para cada mes subsiguiente.
   - Si el día de corte excede los días máximos del mes (ej. día 31 en febrero o abril), debe ajustarse al último día calendario válido del mes respectivo.

---

## 2. Estado Actual y Hoja de Ruta de Migración

### 2.1 Estado Actual (Heredado / Vanilla)
- Archivo monolítico `index.html` con lógica JS inline, `sw.js` y `manifest.json`.
- Almacenamiento local mediante `IndexedDB` (`InteresItDB` -> `settings`).
- Dependencias CDN: Tailwind CSS, `driver.js` (tutorial interactivo), `html2pdf.js`.

### 2.2 Arquitectura Objetivo
- **Framework:** Svelte 5 nativo utilizando la sintaxis de **Runes** (`$state`, `$derived`, `$props`, `$effect`).
- **Lenguaje:** TypeScript en modo estricto.
- **Entorno:** Node.js 24 (`v24.x`).
- **Bundler y Routing:** SvelteKit configurado como SPA estática con `@sveltejs/adapter-static` (`prerender = true`, `ssr = false`).
- **Estilos:** Tailwind CSS integrado localmente vía Vite con temas Claro / Oscuro, acentos Neón (verdes monetarios y colores patrios RD: azul ultramar, blanco, rojo carmesí).
- **Testing:** Vitest para pruebas unitarias de cálculos financieros y pruebas de componentes.
- **CI/CD:** GitHub Actions desplegando a GitHub Pages en cada push a `main`.

---

## 3. Reglas Estrictas de Stack y Aislamiento para Agentes

> [!IMPORTANT]
> **REGLA DE AISLAMIENTO ABSOLUTA:**
> - En este espacio de trabajo está **terminantemente prohibido** utilizar o referenciar conceptos, librerías, arquitecturas o skills de Android, Kotlin, Java, Flutter o cualquier otro framework ajeno a la web moderna.
> - Solo se permite código y soporte para: **Svelte 5**, **TypeScript**, **Node 24** y **Tailwind CSS**.

### 3.1 Reglas para Node 24
- Usar sintaxis ESM nativa (`"type": "module"` en `package.json`).
- Aprovechar las APIs modernas de Node 24 (`node:fs`, `node:path`, `node:test` o integración con Vitest, APIs nativas globales de `fetch`, `crypto`, `structuredClone`).
- Mantener scripts y herramientas de build compatibles con Node 24 sin polyfills obsoletos.

### 3.2 Reglas para TypeScript
- `tsconfig.json` con configuración estricta (`strict: true`, `noImplicitAny: true`, `exactOptionalPropertyTypes: true`).
- Prohibido el uso de `any`; modelar explícitamente interfaces y types de dominio (`Investment`, `SimulationSettings`, `MonthlyProjectionRow`, `SimulationResult`).
- Tipar explícitamente los retornos de funciones de cálculo financiero y funciones de persistencia.

### 3.3 Reglas para Svelte 5 (Runes Only)
- **Usar EXCLUSIVAMENTE Svelte 5 Runes:**
  - Reactividad de estado: `$state()` y `$state.raw()`.
  - Valores derivados: `$derived()` y `$derived.by()`.
  - Efectos secundarios: `$effect()` y `$effect.pre()` (utilizados con moderación, nunca para sincronizar estado derivado).
  - Propiedades de componentes: `$props()` con tipado genérico TypeScript `let { ... }: Props = $props();`.
  - Comunicación bidireccional cuando sea requerida: `$bindable()`.
  - Depuración: `$inspect()`.
  - Snippets de contenido: `{#snippet name(args)}...{/snippet}` y `{@render name(args)}`.
- **PROHIBIDO el uso de patrones de Svelte 3/4:**
  - ❌ NO usar `export let` (reemplazado por `$props()`).
  - ❌ NO usar `$:` (reemplazado por `$derived()`).
  - ❌ NO usar `<slot />` (reemplazado por snippets y `{@render}`).
  - ❌ NO usar `createEventDispatcher` (reemplazado por callbacks pasados como props).
  - ❌ NO usar `<svelte:options runes={false} />`.

---

## 4. Skills Locales Disponibles en `.agent/skills/`

Todas las habilidades requeridas por agentes están instaladas localmente en `./.agent/skills/` (provenientes del ecosistema oficial `full-stack-skills/svelte-skills`). Los agentes **solo deben consultar e invocar estas skills locales**:

| Skill Local | Ubicación | Propósito |
| :--- | :--- | :--- |
| `svelte-runes` | `.agent/skills/svelte-runes/SKILL.md` | Reactividad completa de Svelte 5 (`$state`, `$derived`, `$effect`, `$props`, `$bindable`, `$inspect`). |
| `svelte-template-syntax` | `.agent/skills/svelte-template-syntax/SKILL.md` | Bloques de control (`#if`, `#each`, `#await`, `#snippet`), tags (`@render`), directivas. |
| `svelte-styling` | `.agent/skills/svelte-styling/SKILL.md` | Integración de Tailwind CSS, estilos locales con `scoped`, animaciones y transiciones. |
| `svelte-special-elements` | `.agent/skills/svelte-special-elements/SKILL.md` | `<svelte:window>`, `<svelte:head>`, `<svelte:boundary>`, etc. |
| `svelte-runtime` | `.agent/skills/svelte-runtime/SKILL.md` | Ciclo de vida en cliente, hidratación, montaje y CSP. |
| `svelte-misc` | `.agent/skills/svelte-misc/SKILL.md` | Integración de TypeScript avanzada, tipos de componentes, buenas prácticas. |
| `svelte-reference` | `.agent/skills/svelte-reference/SKILL.md` | Acciones (`use:`), transiciones y utilidades de movimiento. |
| `svelte-lifecycle` | `.agent/skills/svelte-lifecycle/SKILL.md` | `onMount`, `onDestroy`, `tick`, Context API y configuración de Vitest. |
| `sveltekit-overview` | `.agent/skills/sveltekit-overview/SKILL.md` | Enrutamiento SvelteKit, páginas (`+page.svelte`), layouts y estándares web. |
| `sveltekit-config` | `.agent/skills/sveltekit-config/SKILL.md` | Configuración de Vite, adapters (`adapter-static`), SEO y empaquetado. |
| `sveltekit-data` | `.agent/skills/sveltekit-data/SKILL.md` | Gestión de datos cliente/servidor, streaming y formularios. |
| `sveltekit-advanced` | `.agent/skills/sveltekit-advanced/SKILL.md` | Manejo de estado SSR-safe, hooks y shallow routing. |
| `svelte-cli` | `.agent/skills/svelte-cli/SKILL.md` | Uso del CLI oficial `sv` para creación y mantenimiento de dependencias. |
| `svelte-ai` | `.agent/skills/svelte-ai/SKILL.md` | Guías de integración con agentes y herramientas de IA. |
| `svelte-awesome` | `.agent/skills/svelte-awesome/SKILL.md` | Catálogo de referencia e índice de sub-habilidades Svelte. |
| `svelte-legacy-apis` | `.agent/skills/svelte-legacy-apis/SKILL.md` | Referencia exclusiva para consultar cómo migrar código antiguo a Svelte 5. |

---

## 5. Modelado del Dominio (TypeScript)

Los agentes deben guiarse por las siguientes interfaces fundamentales:

```typescript
export interface InvestmentScenario {
  id: string;
  nombre: string;
  tasaAnual: number; // Porcentaje nominal anual, ej. 10.5 para 10.5%
  color: string;     // Identificador de color Tailwind (ej. 'blue', 'emerald', 'cyan')
}

export interface SimulationSettings {
  montoInicial: number;
  aporteMensual: number;
  inversiones: InvestmentScenario[];
  fechaInicio: string; // Formato YYYY-MM-DD
  fechaFin: string;    // Formato YYYY-MM-DD
  diaCorte: number;    // 1 - 31
  omitirPrimerCorte: boolean;
  aplicarImpuestoRD: boolean; // Retención del 10%
  isDarkMode: boolean;
}

export interface MonthCalculationPerScenario {
  inversionId: string;
  balanceFinal: number;
  interesGanado: number;
  isSkipped: boolean;
}

export interface MonthlyRow {
  periodoIndex: number;
  fechaCorte: string;  // Formato YYYY-MM-DD
  etiquetaMes: string; // ej. "ENE 26"
  diasPeriodo: number;
  totalesPorInversion: MonthCalculationPerScenario[];
}

export interface SimulationResult {
  totalInvertido: number;
  filasMensuales: MonthlyRow[];
  resumenPorInversion: Array<{
    inversionId: string;
    balanceFinal: number;
    rendimientoNeto: number;
  }>;
}
```

---

## 6. Testing con Vitest

- Toda la lógica matemática debe residir en funciones puras y desacopladas de la UI (ej. `src/lib/domain/finance.ts`).
- Las suites de prueba con **Vitest** deben verificar:
  1. **Años bisiestos:** Exactitud de días en febrero bisiesto vs no bisiesto.
  2. **Día de corte mensual:** Simulación correcta cuando el día de corte es 31 y el mes tiene 28, 30 o 31 días.
  3. **Omitir 1º corte:** Verificar que si la fecha de inicio es cercana a la fecha de corte y se activa `omitirPrimerCorte`, el interés de ese primer ciclo sea 0 y comience a computar en el siguiente ciclo completo.
  4. **Retención fiscal (10% RD):** Deducción exacta del 10% en intereses brutos cuando `aplicarImpuestoRD` es `true`.
  5. **Múltiples escenarios simultáneos ($N$ inversiones):** Coherencia de balances acumulados independientes compartiendo el mismo capital inicial y aportes recurrentes.

---

## 7. Despliegue CI/CD a GitHub Pages (`adapter-static`)

### 7.1 Configuración de SvelteKit
En `svelte.config.js`:
```javascript
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
      strict: true
    }),
    paths: {
      // Configurar base path si se hospeda bajo https://<user>.github.io/<repo>/
      base: process.argv.includes('dev') ? '' : process.env.BASE_PATH || ''
    }
  }
};

export default config;
```

En `src/routes/+layout.ts`:
```typescript
export const prerender = true;
export const ssr = false;
export const trailingSlash = 'always';
```

### 7.2 Flujo de GitHub Actions (`.github/workflows/deploy.yml`)
- Ejecución en Node 24 (`node-version: 24`).
- Pasos:
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` con caché de `npm` o `pnpm`.
  3. `npm ci`
  4. `npm run test` (Vitest)
  5. `npm run build`
  6. `actions/upload-pages-artifact@v3` (sube la carpeta `build`)
  7. `actions/deploy-pages@v4`

---

## 8. Guía de Ejecución y Buenas Prácticas para Agentes

1. **Mantener integridad y limpieza:**
   - No añadir dependencias no autorizadas.
   - Preservar la persistencia offline (IndexedDB) para configuraciones y escenarios.
2. **UI Neón y Dinámica:**
   - Respetar los chips dinámicos de adición/sustracción (`+20`, `+50`, `+100`, etc.).
   - Utilizar paleta con tonos oscuros elegantes (`#0f172a`, `#1e293b`), acentos verdes dinero neón (`#10b981`, `#059669`) y acentos alusivos a la bandera dominicana (Azul `#2563eb`, Rojo `#ef4444`, Blanco).
3. **Refactorización modular:**
   - Separar componentes: `DataEntry.svelte`, `ScenarioCards.svelte`, `ProjectionTable.svelte`, `Header.svelte`, `ExportModal.svelte`.
   - Utilizar el store/servicio de IndexedDB en una clase reactiva en `src/lib/state/settings.svelte.ts` apoyada en los runes de Svelte 5.
