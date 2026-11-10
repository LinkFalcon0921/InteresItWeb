# Notas de Versión — InteresIt v2.2: Terminal Financiera

> **Fecha de Lanzamiento:** 2026-11-07  
> **Versión:** 2.2.0  
> **Estado:** Production Ready  

---

## 1. Resumen Ejecutivo de la Modernización

InteresIt ha completado su transición de un archivo monolítico (`index.html`) hacia una **Terminal Financiera Institucional de Alto Rendimiento** construida con **Clean Architecture**, **Svelte 5 nativo (Runes)**, **Svelte Material UI 9.x**, **Node 24 LTS** y **TypeScript 7 estricto**.

Esta versión ofrece precisión bancaria al centavo, contraste y estética institucional inspirada en Excel SAFI, y soporte offline total (PWA).

---

## 2. Novedades y Mejoras Principales

### 2.1. Núcleo Financiero Desacoplado (Domain Layer)
- **Fechas exactas de calendario:** Proyecciones en tiempo real basadas en días reales transcurridos por período en UTC (incluyendo años bisiestos y clamping de fin de mes para días de corte 31 en meses de 28/30 días).
- **Retención fiscal automática:** Aplicación rigurosa de la ley de retención del 10% de República Dominicana sobre intereses devengados.
- **Comparativa combinatoria de $n$ pares:** Análisis diferencial simultáneo para hasta 20 escenarios ($n(n-1)/2$ combinaciones).
- **100% de cobertura en pruebas unitarias:** 118 tests verificando exactitud al centavo.

### 2.2. Nueva Experiencia de Usuario con SMUI 9 y Svelte 5 Runes
- **Diseño Institucional Excel SAFI:** Paleta de colores en Teal profundo (`#004851`), contenedores suaves (`#D7EBEC`) y acentos de ganancia neta en verde institucional (`#0B7A4B`).
- **Hero Card Ejecutiva:** Visualización prominente del saldo estimado del líder, rendimiento neto devengado y selección rápida de plazos (`3 m`, `6 m`, `1 año`).
- **Data Entry Ergonómico:** Entradas numéricas con chips de adición/sustracción rápida (`-100` a `+100`), selector de día de corte y switches de reglas financieras.
- **Drawer Modal Móvil:** Operación ágil en smartphones mediante navegación con Scrim accesible.
- **Exportación A4 a PDF:** Emisión de reportes institucionales estructurados con título personalizado mediante el diálogo nativo de impresión.

### 2.3. Resiliencia Offline y Persistencia
- **IndexedDB Nativa Retrocompatible:** Almacenamiento local en `InteresItDB` sin librerías externas, garantizando que usuarios existentes no pierdan sus configuraciones previas.
- **PWA Lista para Instalación:** Manifest estandarizado y Service Worker con caché estática offline.

---

## 3. Deuda Técnica Eliminada

- ❌ Eliminado el archivo monolítico `index.html` (669 líneas con código inline no tipado).
- ❌ Eliminadas llamadas a CDNs externas no seguras (`cdn.tailwindcss.com`).
- ❌ Eliminadas coerciones de tipo implícitas y errores en tiempo de ejecución.
- ❌ Eliminadas dependencias no autorizadas; el proyecto opera con dependencias mínimas estrictamente justificadas.
