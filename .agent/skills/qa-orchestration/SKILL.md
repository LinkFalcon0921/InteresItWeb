---
name: qa-orchestration
description: "Coordina auditorías QA y revisiones por fase o PR en migraciones Svelte 5 y TypeScript, detecta brechas, asigna skills y emite decisión basada en evidencia. Usar para auditoría integral o releases, no para cambios triviales."
---

# qa-orchestration

## Entrada y activación
Requiere alcance real de usuario, ruta o diff de repositorio, requisitos/baseline si existen, límites de autorización y política de calidad. Para tareas pequeñas, saltar esta orquestación y abrir la skill técnica específica.

## Procedimiento
1. Clasificar intención: `AUDIT_ONLY`, `TEST_DESIGN`, `TEST_IMPLEMENTATION_AUTHORIZED`, `REGRESSION`, `RELEASE_GATE`. Si solo se pidió auditoría, no editar producto.
2. Establecer inventario de información **observada** y faltante: archivos, commit, Node/TS/Vite/Svelte, scripts npm, lockfile, test runner, CI, navegadores/fixtures, baseline vieja y criterios de negocio. No inferir disponibilidad de herramientas.
3. Aislar los flujos críticos y construir `requisito -> riesgo -> escenario -> oráculo -> evidence`. Usar `../../../../../../Downloads/QA_Guardian_Codex_Antigravity_Kit/docs/scenario-matrix.md` como inventario de riesgos propuestos y no como resultados.
4. Auditar primero la suite existente con `qa-test-audit`; evitar producir más pruebas antes de entender si las que existen son útiles.
5. Delegar **solo** según evidencia del cambio: `qa-architecture-contracts`, `qa-browser-storage`, `qa-svelte-driver`, `qa-pdf-validation`, `qa-cross-device-e2e`, `qa-security-resilience`, `qa-financial-domain` (si existen cálculos).
6. Diseñar/fijar baseline de comparación, preferentemente fixtures aprobadas de versión anterior. Separar E2E de mocks y verificar los adaptadores reales antes del gate de release.
7. Ejecutar únicamente comprobaciones autorizadas, con comandos/versiones/exit codes/logs; cualquier impedimento entra como `NO EJECUTADO` o `BLOQUEADO`.
8. Cerrar con `qa-acceptance-reporting`: calidad funcional, integridad, estabilidad, arquitectura, regresión, seguridad y accesibilidad; no prometer aprobación sin evidencia.

## Entrega mínima
Plan y fase; matriz de riesgos seleccionados; inventario de tests actuales; registro de ejecuciones; hallazgos confirmados vs hipótesis; informe `../../../../../../Downloads/QA_Guardian_Codex_Antigravity_Kit/templates/qa-report.md`; próximos pasos y dictamen.

## Error fatal que debes evitar
No marcar 'APROBADO' por `npm test` exitoso si faltan criterios críticos, migraciones reales o evidencias E2E requeridas; sin repo usar `SIN EVIDENCIA SUFICIENTE`.
