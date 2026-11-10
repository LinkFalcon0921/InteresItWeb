---
name: qa-cross-device-e2e
description: "Cubre E2E con Playwright en Chromium, Firefox, WebKit, móvil/tablet, accesibilidad WCAG 2.2 AA propuesta, responsive, teclado y descargas. Usar para regresión y compatibilidad."
---

# qa-cross-device-e2e

## Matriz sugerida (ajustar a soporte real)
- Desktop Chromium 1440 px; Firefox 1366 px; WebKit 1280 px.
- Tablet 768/1024 px, orientación y tacto.
- Chromium móvil 360–412 px y WebKit móvil 375–430 px; vista estrecha 320 px.
- Zoom, alto contraste cuando aplique, navegación teclado, lector de pantalla manual, foco, teclado virtual, orientación y reflow.

## Procedimiento
1. Confirmar la matriz oficial de soporte de producto y qué navegadores/dispositivos están instalados. No declarar cobertura iPhone real mediante emulación WebKit.
2. Seleccionar flujos críticos: abrir datos existentes, editar, guardar, recargar, migrar, filtrar, reiniciar tutorial, exportar PDF y recuperar error de almacenamiento.
3. Construir Page Objects solo cuando reduzcan duplicación; preferir `getByRole`, `getByLabel` y aserciones visibles en vez de selectores frágiles y sleeps fijos.
4. Aislar datos, perfil y storage state por test. Usar fixtures predecibles y controlar idioma/zona horaria.
5. Ejecutar todos los motores disponibles. Documentar versión, device emulation vs hardware real, viewport, OS y fallos/reties.
6. Añadir `axe-core` como filtro para infracciones automatizables y pruebas manuales de foco, semántica y experiencia táctil. WCAG 2.2 AA es una meta inicial por confirmar.
7. Probar descarga PDF y storage real en navegadores; indicar explícitamente los flujos no reproducibles en emulación.

## Salida
Matriz `flujo | motor | viewport | emulado/real | test | resultado | evidencia | limitaciones`. En reportes separar deficiencia de acceso a dispositivo de defecto del producto.

## Evitar
No pasar E2E solo en Chromium desktop como certificación multidispositivo; no asumir que un axe scan verde equivale a WCAG completa.
