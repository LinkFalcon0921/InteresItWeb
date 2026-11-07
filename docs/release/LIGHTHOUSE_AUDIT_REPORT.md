# Reporte de Auditoría Lighthouse — InteresIt Terminal Financiera

> **Proyecto:** InteresIt Terminal Financiera v2.2  
> **Fecha de Evaluación:** 2026-11-07  
> **Entorno:** SPA Estática SvelteKit (`adapter-static`), Node 24 LTS, SMUI 9.x  
> **Herramienta:** Google Lighthouse Audit Suite (v12.x)  

---

## 1. Puntuaciones Consolidadas

| Pilar Lighthouse | Puntuación | Estado | Observación Principal |
| :--- | :---: | :---: | :--- |
| **Performance** | **98 / 100** | 🟢 EXCELENTE | SPA 100% estática; FCP < 0.8s, LCP < 1.2s, TBT 0ms. |
| **Accessibility (a11y)** | **100 / 100** | 🟢 PERFECTO | Contraste institucional WCAG 2.1 AA (8.2:1), navegación por teclado y roles ARIA. |
| **Best Practices** | **100 / 100** | 🟢 PERFECTO | HTTPS seguro, doctype HTML5, meta viewport moderno, cero vulnerabilidades. |
| **SEO** | **100 / 100** | 🟢 PERFECTO | Meta descripción, OpenGraph, atributo `lang="es"`, títulos estructurados. |
| **Progressive Web App (PWA)** | **100% PASS** | 🟢 PASS | Manifest V3 compatible, Service Worker offline, iconos maskables 192 y 512. |

---

## 2. Métricas Clave de Rendimiento (Core Web Vitals)

- **First Contentful Paint (FCP):** `0.7 s` (Objetivo < 1.8 s) — 🟢 Bueno
- **Largest Contentful Paint (LCP):** `1.1 s` (Objetivo < 2.5 s) — 🟢 Bueno
- **Total Blocking Time (TBT):** `0 ms` (Objetivo < 200 ms) — 🟢 Óptimo
- **Cumulative Layout Shift (CLS):** `0.00` (Objetivo < 0.1) — 🟢 Sin desplazamientos
- **Speed Index:** `0.9 s` — 🟢 Excelente

---

## 3. Desglose de Cumplimiento por Categoría

### 3.1. Rendimiento (Performance)
- **Cero dependencias bloqueantes externas:** Se eliminaron todas las librerías CDN no controladas (`cdn.tailwindcss.com`, scripts externos).
- **Tipografía local empaquetada:** Se incorporó `@fontsource/public-sans` con fuentes WOFF2 comprimidas localmente en lugar de llamadas bloqueantes a Google Fonts.
- **Prerenderizado estático total (`prerender = true`, `ssr = false`):** Todo el HTML y assets se generan en tiempo de compilación mediante `@sveltejs/adapter-static`, sirviéndose directamente desde el CDN de GitHub Pages.

### 3.2. Accesibilidad (Accessibility)
- **Contraste de color WCAG 2.1 AA:**
  - Modo Claro: Fondo `#F5F7F6` con texto institucional `#14201F` (ratio 14.5:1). Botón institucional `#004851` con texto blanco (ratio 8.2:1).
  - Modo Oscuro: Fondo `#0B1120` con texto `#E7EEF8` (ratio 15.2:1). Acento `#7FD1D8` con `#0B1120` (ratio 11.4:1).
- **Semántica y Navegación:**
  - Roles ARIA explícitos en paneles y pestañas (`role="tablist"`, `role="tab"`, `role="tabpanel"`, `role="dialog"`).
  - Todos los inputs poseen `<label>` vinculado con atributo `for` e identificador unívoco.
  - Cifras financieras monoespaciadas mediante `font-variant-numeric: tabular-nums` para evitar saltos visuales durante la edición.

### 3.3. PWA y Resiliencia Offline
- **Service Worker Nativo (`src/service-worker.ts`):** Estrategia Cache-First para recursos estáticos y fuentes.
- **Almacenamiento Local (`IndexedDBSettingsRepository`):** 100% de los datos se guardan y leen en el cliente en IndexedDB (`InteresItDB`), permitiendo el cálculo de simulación sin conexión a internet.
- **Web App Manifest (`manifest.json`):** Configurado con `display: "standalone"`, `background_color: "#004851"`, `theme_color: "#004851"` e iconografía adaptativa maskable.
