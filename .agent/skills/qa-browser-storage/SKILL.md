---
name: qa-browser-storage
description: "Diseña y verifica pruebas adversariales para IndexedDB y LocalStorage, migraciones de esquema, fallos de cuota, cierre, múltiples pestañas, corrupción, rollback e integridad de datos. Usar con persistencia web."
---

# qa-browser-storage

## Precauciones previas
Requerir entorno de test aislado y fixtures sintéticas. No ejecutar borrados ni pruebas destructivas sobre el perfil normal del usuario, producción ni datos reales. No afirmar que cerrar navegador sea reproducible sin control real del entorno.

## Matriz base
- `QA-DB-001`: actualizar versión del esquema con registros previos de todos los casos críticos.
- `QA-DB-002`: interrumpir escritura en sandbox; validar atomicidad/recuperación según contrato.
- `QA-DB-003`: dos pestañas en conflicto; comprobar política (last-write-wins, versionado o bloqueo), no inventarla.
- `QA-DB-004`: cuota agotada, permisos restringidos, `AbortError`, `QuotaExceededError` y errores transaccionales.
- `QA-DB-005`: LocalStorage JSON inválido, esquema viejo, lectura inaccesible o inconsistente.
- `QA-DB-006`: reinicio parcial de migración y repetición sin pérdida/duplicación.

## Procedimiento
1. Identificar versionado, stores, índices, persistencia real, snapshots/backup y política de conflictos en código/requisitos.
2. Preparar fixtures versionadas aprobadas con IDs, cantidades, claves, fechas, decimales, vacíos y repetidos.
3. Ejecutar tests con `fake-indexeddb` donde sirva para lógica unitaria; **complementar obligatoriamente** con Chromium/Firefox/WebKit reales para migración, tabs y quota cuando sea viable.
4. Verificar operaciones de transacción antes/después del fallo, atomicidad de lote, índices y relectura tras cerrar y abrir contexto.
5. Para sincronización entre pestañas comprobar `onversionchange`, `blocked`, `BroadcastChannel` o mecanismo realmente presente; no imponer uno no especificado.
6. Validar UX: error visible y acción de recuperación; nunca confirmar guardado si falló la escritura.
7. Guardar evidencia `fixture hash`, estado inicial, script, exit code, estado final y capturas/logs si es necesario.

## Oráculo
Integridad por identidad y valores, conteo, sumatoria de importes cuando aplique, claves y versión; recuperación definida; ningún cambio silencioso, ni confirmación UI falsa.

## Salida
Matriz `QA-DB-ID | precondición | acción | expected | observed | storage snapshot | navegador | evidencia | severidad`. Diferenciar escenarios ejecutados de imposibles.
