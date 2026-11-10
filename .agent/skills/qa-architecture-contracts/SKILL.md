---
name: qa-architecture-contracts
description: "Comprueba límites de Clean Architecture, hexagonal, puertos/adaptadores, inyección de dependencias y reglas TypeScript del repositorio. Usar al migrar dominio, DI, adaptadores o archivos TypeScript/Svelte."
---

# qa-architecture-contracts

## Entrada
Árbol de código, imports reales, interfaces de puertos, bootstrap/composition root, tests de contrato, tsconfig, reglas del equipo. No asumir arquitecturas por nombres de carpetas.

## Pruebas de arquitectura
1. Dibujar dependencias reales: `presentation -> application -> domain` y `infrastructure -> ports`; verificar que dominio **no** importa UI, Svelte, IndexedDB, Driver.js, generadores PDF ni contenedores de infraestructura.
2. Mapear puertos y adaptadores: almacenamiento, exportación, tutoriales, servicios externos; confirmar que los casos de uso no construyen implementaciones concretas.
3. Ubicar composición e inyección de dependencias; comprobar ciclos, alcance de singleton, contrato de errores, teardown y reemplazo de adaptadores sin tocar lógica de negocio.
4. Crear/identificar **suite de contrato compartida** que se ejecute sobre fake y real, en entornos compatibles. No confundir fake unitario con migración IndexedDB real.
5. Validar convenciones: máximo 600 líneas en archivos de código según exclusiones, `as const` prohibido, no conversiones `as` para silenciar errores, strings de negocio nombrados o enums. Distinguir `as` en imports o uniones legales: revisar manualmente antes de informar.
6. Preferir parsers de `unknown`, discriminated unions y type guards; no forzar cast. Registrar decisiones de dominio como constantes con nombres.
7. Verificar compatibilidad real de TS 7: `node --version`, package/lock, CLI, `svelte-check`, tooling/editor. TypeScript 7 nativo puede coexistir con herramientas que aún requieran otra versión; probarlo.
8. Si hay permisos y tests, simular sustitución de adaptador mediante DI sin editar dominio; documentar diffs y ejecución.

## Salida
Mapa de capas, tabla `regla -> archivo:línea -> evidencia -> severidad -> corrección sugerida`, tests de contrato y rutas de refactor mínimo.

## Ejemplo conceptual
Un `CalculateUseCase` recibe `InvoiceRepository` (puerto) como parámetro. La composición instancia `IndexedDbInvoiceRepository`; el dominio no conoce IndexedDB. Las pruebas validan la misma semántica con un fake y el adaptador real.
