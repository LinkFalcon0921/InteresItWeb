# Lista de Verificación de Paso a Producción (Release Checklist)

> **Proyecto:** InteresIt Terminal Financiera  
> **Versión Objetivo:** v2.2.0  
> **Fecha:** 2026-11-07  

---

## 1. Verificaciones Automatizadas de Calidad (Quality Gates)

- [x] **Límite de líneas por archivo (`pnpm check:lines`):**
  - Criterio: Máximo 600 líneas físicas por archivo mantenido; advertencia a partir de 450 líneas.
  - Resultado: **0 alertas, 0 errores**.
- [x] **Diagnóstico Svelte y TypeScript Estricto (`pnpm check`):**
  - Criterio: 0 errores y 0 warnings en TypeScript 7 con `strict: true`.
  - Resultado: **0 errores, 0 warnings**.
- [x] **Pruebas Unitarias e Integración (`pnpm test`):**
  - Criterio: 100% de la suite de pruebas unitarias de Vitest en verde.
  - Resultado: **118 pruebas aprobadas al 100%**.
- [x] **Compilación Estática de Producción (`pnpm run build`):**
  - Criterio: Generación exitosa de la carpeta `build/` mediante `@sveltejs/adapter-static` y compilación de Sass para temas claro y oscuro.
  - Resultado: **Build completado con éxito (`✔ done`)**.

---

## 2. Configuración de CI/CD (GitHub Actions)

- [x] **Pipeline de Integración Continua (`.github/workflows/ci.yml`):**
  - Ejecución en Node 24 LTS.
  - Validación de líneas, comprobación de tipos, tests y build estático en pull requests y pushes a `main` y `develop`.
- [x] **Pipeline de Despliegue Continuo (`.github/workflows/deploy.yml`):**
  - Despliegue automático a GitHub Pages desde la carpeta `build/` en cada push a la rama `main`.
  - Permisos de Pages y token OIDC configurados de forma segura.
  - Eliminado el archivo heredado obsoleto `.github/workflows/static.yml`.

---

## 3. Experiencia de Usuario y Accesibilidad (WCAG 2.1 AA)

- [x] Contraste de colores institucional verificado en modo claro y modo oscuro.
- [x] Cifras tabulares (`tabular-nums`) para evitar movimientos no deseados de interfaz.
- [x] Accesibilidad por teclado en pestañas, botones y modales.
- [x] Formulario móvil en Drawer con scrim y soporte táctil.
- [x] Exportación a PDF A4 e impresión de reportes operativos.

---

## 4. Estado Final de Aprobación

- **Dictamen del Arquitecto:** **APROBADO PARA PRODUCCIÓN (Release Candidate 1 / Ready for Main)**.
- **Ramas:**
  - Código fuente verificado en: `develop`
  - Destino de despliegue: `main`
