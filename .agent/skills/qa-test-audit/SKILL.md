---
name: qa-test-audit
description: "Audita suites Vitest, Playwright, Svelte Testing Library y CI: detecta aserciones débiles, mocks irreales, pruebas flaky, falta de oráculos y regresiones. Usar antes de agregar tests en una migración web."
---

# qa-test-audit

## Entrada
Tests existentes y código bajo prueba, requisitos aprobados, configuración de runners, scripts, CI, cobertura e historial de fallos. Si no están disponibles, entregar checklist sin afirmar resultados.

## Pasos verificables
1. Inventariar `archivo:test` → función/flujo → requisito → nivel (unit/component/integration/E2E) → aserciones → mocks → estado de ejecución.
2. Inspeccionar especialmente `toBeDefined()`, `toBeTruthy()`, snapshots sin invariantes, solo HTTP 200, solo render o `not.toThrow()` para requisitos que requieren valor/cifra/persistencia.
3. Evaluar fuerza del **oráculo**: ¿se calcula esperado independientemente o se copia el algoritmo bajo prueba? ¿se comprueban errores, invariantes y efectos persistidos?
4. Revisar fixtures representativas, aislamiento entre tests, reloj/locale/timezone, secuencias, estado global, concurrencia, timers y reintentos que ocultan un fallo.
5. Detectar `mock` que no ejecuta contrato real; reclamar tests de adaptador real, especialmente IndexedDB en navegador y generación PDF.
6. Comparar tests con escenarios `QA-DB`, `QA-UI`, `QA-TUT`, `QA-PDF`, requisitos de arquitectura/seguridad y flujo financiero si aplica.
7. Solo si autorizado, ejecutar scripts reales existentes y capturar comando + exit code + output. Calcular cobertura únicamente desde reportes. Mutation testing como paso posterior a baseline estable, no condición inicial automática.
8. Clasificar cada test: `VÁLIDO`, `DÉBIL`, `FRÁGIL`, `REDUNDANTE`, `SIN REQUISITO`, `BLOQUEADO`, y registrar `FALTANTE` para huecos sin test.

## Salida
`test ID | ruta | requisito | expected | aserción | mock | estado | riesgo | mejora | evidencia`; top 10 brechas priorizadas y plan de refuerzo con tests exactos. Usar `../../../../../../Downloads/QA_Guardian_Codex_Antigravity_Kit/templates/traceability.csv`.

## Contraejemplo
`expect(await saveRecord(record)).toBeDefined()` no demuestra persistencia. Mejor: consultar de nuevo en una instancia distinta de repositorio y comparar identidad, importe y cantidad almacenados según el contrato.
