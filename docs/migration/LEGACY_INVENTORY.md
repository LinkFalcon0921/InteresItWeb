# Inventario del Sistema Legacy (Fase 0 Audit)

> **Proyecto:** InteresIt — Terminal Financiera  
> **Fecha de Auditoría:** 2026-11-07  
> **Estado:** Auditado y congelado para migración incremental  

---

## 1. Inventario de Archivos Físicos

| Archivo | Líneas Físicas | Responsabilidad Actual | Problemas Detectados |
| :--- | :--- | :--- | :--- |
| `index.html` | 669 | Monolito que concentra HTML, estilos CDN, manipulación DOM, lógica de fechas, cálculo financiero y persistencia IndexedDB. | Violación de Clean Architecture, acoplamiento total, falta de tipado, lógica de presentación mezclada con negocio. |
| `sw.js` | 47 | Service Worker que almacena en caché archivos locales y enlaces CDN externos para funcionamiento offline. | Depende de URLs de CDN externas que pueden fallar o cambiar sin control. |
| `manifest.json` | 26 | Web App Manifest para instalación PWA (`display: standalone`, tema `#3b82f6`). | Configuración válida pero con colores desalineados de la nueva identidad institucional. |
| `.github/workflows/static.yml` | 43 | Despliegue automático a GitHub Pages subiendo la raíz del repositorio. | No ejecuta build, validación de tipos, lint ni pruebas automatizadas. |

---

## 2. Inventario de Dependencias Externas (Heredadas de CDN)

| Biblioteca | Versión / CDN | Uso en Legacy | Estrategia de Reemplazo en v2.2 |
| :--- | :--- | :--- | :--- |
| **Tailwind CSS** | CDN (`https://cdn.tailwindcss.com`) | Clases utilitarias de maquetación y modo oscuro básico. | Reemplazado por **Svelte Material UI (SMUI 9.x)** y Sass theme (`smui-theme`). |
| **Driver.js** | CDN (`https://cdn.jsdelivr.net/npm/driver.js@latest/...`) | Tutorial guiado interactivo de 4 pasos al presionar "Tutorial". | Encapsulado mediante puerto de aplicación `OnboardingServicePort` y adaptador desacoplado. |
| **Html2pdf.js** | CDN (`https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/...`) | Exportación de la tabla HTML a PDF apaisado. | Reemplazado por `PrintExportAdapter` con componente Svelte A4 de 2 páginas y `@media print`. |

---

## 3. Catálogo de Funcionalidades Legacy

### F-01: Parámetros Base de Inversión
- **Capital Inicial ($P$):** Valor por defecto 185. Chips de ajuste rápido (-100, -50, -20, +20, +50, +100).
- **Aporte Mensual ($PMT$):** Valor por defecto 0. Chips de ajuste rápido (-100, -50, -20, +20, +50, +100).

### F-02: Escenarios de Inversión Dinámicos
- Lista dinámica de escenarios (2 a 20).
- Cada escenario cuenta con: `nombre` (string), `tasa` (número decimal nominal anual %), `color` (identificador cromático).
- Valores iniciales: "Escenario Conservador" (0.1%), "Escenario Optimizado" (3.0%).

### F-03: Horizonte de Inversión y Día de Corte
- Fecha `Desde` y Fecha `Hasta`. Inicializado a fecha actual y +7 meses.
- `Día de Corte Mensual`: Entero entre 1 y 31 (por defecto día actual).
- `Omitir 1º corte`: Checkbox booleano para saltar capitalización en el mes inicial si el lapso es parcial.

### F-04: Motor de Cálculo y Capitalización
- Ciclos mensuales iterativos entre `Desde` y `Hasta`.
- Cálculo de días transcurridos por período.
- Tasa mensual: $(\text{tasa} / 100) / 12$.
- Factor de base mensual: $30.4167$ días.
- Retención fiscal República Dominicana: deducción de 10% implícita (`* 0.90`).

### F-05: Persistencia Local
- Base de datos IndexedDB `InteresItDB`, versión 1.
- Object store `settings`, clave `'current'`.
- Guarda y carga: `montoInicial`, `aporteMensual`, `inversiones`, `fechaInicio`, `fechaFin`, `diaCorte`, `omitirPrimerCorte`, `aplicarImpuesto`, `isDarkMode`.
