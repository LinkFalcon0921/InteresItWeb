---
name: qa-acceptance-reporting
description: "Consolida evidencia y emite dictamen QA aprobado, condicionado, rechazado o sin evidencia; verifica criterios, riesgo y aceptación de negocio. Usar al cerrar auditoría, fase, PR o release."
---

# qa-acceptance-reporting

## Activación
Al final de cualquier evaluación que necesite decisión o comunicación entre QA, desarrollo, negocio y release. No dar aprobación sin pruebas verificables.

## Proceso
1. Recibir objetivo/commit/fase/alcance, requisitos aprobados, tests ejecutados, entorno, resultados, cobertura, hallazgos y riesgos aceptados.
2. Completar trazabilidad `requisito → escenario → test → ejecución → evidencia → outcome`. Los tests `NO EJECUTADO` quedan visibles.
3. Separar defectos **confirmados** de `RIESGO`, `HIPÓTESIS` y `SIN EVIDENCIA`. Cada hallazgo requiere ruta/linea si aplica y reproducción.
4. Aplicar metas iniciales de `../../../../../../Downloads/QA_Guardian_Codex_Antigravity_Kit/config/qa-policy.json` solo si ratificadas: 0 P0/P1, 100% criterios críticos, >=90% ramas críticas, todos los contratos, E2E críticos, 0 seguridad alta/crítica, 0 pérdidas de datos y 0 regresiones abiertas.
5. Si existe algún bloqueo confirmado → `RECHAZADO`. Si no hay datos suficientes → `SIN EVIDENCIA SUFICIENTE`. Con evidencia completa y sin bloqueantes → `APROBADO`, o `CONDICIONADO` cuando hay hallazgos menores **y** aceptación explícita de negocio.
6. Para `CONDICIONADO` debe existir documento con aceptante, referencia, alcance, mitigación y fecha; no aceptar riesgo por cuenta de QA.
7. Registrar pruebas corridas (comando, exit code, logs, entorno, commit) y diferencias con baseline. No sustituir la evidencia por intuición.
8. Escribir `../../../../../../Downloads/QA_Guardian_Codex_Antigravity_Kit/templates/qa-report.md`; entregar hallazgos con `../../../templates/finding.md` y handoff.

## Gate automatizable
Si el equipo cuenta con un generador de evidencias real, usar `python scripts/qa_gate.py --input ... --policy config/qa-policy.json`. El script no reemplaza el juicio sobre impacto, ni verifica por sí mismo el origen de un artefacto: requiere evidencia verificable y revisión.

## Salida obligatoria
Resumen; alcance y limitaciones; matriz de trazabilidad; ejecuciones; defectos con severidad; riesgos no ejecutados; gates uno por uno; **uno** de 4 dictámenes; acciones para QA/dev/negocio.
