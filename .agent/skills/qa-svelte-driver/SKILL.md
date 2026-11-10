---
name: qa-svelte-driver
description: "Valida componentes Svelte 5, runes y ciclo de vida; tutoriales Driver.js, foco, overlays, navegación, HTML dinámico y accesibilidad. Usar al modificar UI u onboarding."
---

# qa-svelte-driver

## Entrada
Componentes `.svelte`, estado y stores/runes, navigation, tutorial Driver.js, contratos de UI y pruebas de integración. Verificar si Driver.js se usa realmente.

## Plan de pruebas Svelte
- `QA-UI-001`: ráfagas de cambios, reactividad, orden de respuestas y estado final.
- `QA-UI-002`: desmontaje durante promise, cancelación/cleanup de subscripciones y listeners.
- `QA-UI-003`: doble clic/doble submit/idempotencia de efecto.
- `QA-UI-004`: rutas de formulario, edición, filtros, reset y cambio de colección.
- `QA-UI-005`: cambio de viewport/orientación con modal abierto; foco y scroll.

## Plan Driver.js
- `QA-TUT-001` objetivo no montado: fallback o skip explícito.
- `QA-TUT-002` cancelar/reiniciar en cualquier paso: overlay y listeners liberados.
- `QA-TUT-003` navegar/desmontar durante tour: sin estado colgado.
- `QA-TUT-004` teclado, focus trap, zoom, lector de pantalla, 320 px.
- `QA-TUT-005` progreso de versión anterior y reinicio coherente.

## Procedimiento
1. Identificar efectos `$effect`, `$state`, `$derived`, callbacks, listeners y adaptador Driver; no asumir semántica Svelte antigua.
2. Diseñar tests de componente con Testing Library: observar DOM accesible y acciones de usuario, no estructuras internas.
3. Probar cambios rápidos y demoras controladas; falsos temporizadores solo donde aporten determinismo.
4. Probar que HTML no confiable no se inyecta en descripciones/popovers de Driver.js; usar strings seguras o sanitización respaldada por test.
5. Verificar navegación teclado, foco, cierre de overlay, lector de pantalla y móviles. Tests automatizados axe **no** sustituyen manuales.
6. Grabar entorno, pasos, GIF/captura/log cuando aporte, más assert de estado final.

## Salida
Tabla `escenario | componente/paso | interacción | expected | observed | evidencia`; defectos con pasos y suite de no-regresión.

## Antipatrón
Un test que valida solo `expect(screen.getByText('Guardar')).toBeVisible()` no protege contra doble submit ni pérdida tras desmontaje.
