# ADR-003: Clean Architecture Modular y Regla de Dirección de Dependencias

## Estado
Aceptado

## Contexto
El monolito original concentraba HTML, estilos, eventos de DOM, IndexedDB y lógica matemática en un solo archivo de 669 líneas. Para garantizar mantenibilidad, testabilidad y evolución independiente de la terminal financiera, se requiere una arquitectura con estricta separación de responsabilidades.

## Decisión
Implementar **Clean Architecture** estructurada en 4 capas concéntricas más un Composition Root:
1. **Domain Layer:** Entidades, Value Objects, Servicios de Dominio (`simular.ts`, `pares.ts`), Parsers, Enums y Errores. Agnóstico de Svelte, Node y APIs de terceros.
2. **Application Layer:** Casos de uso (`CalculateSimulationUseCase`, etc.), DTOs y puertos abstractos (`SettingsRepositoryPort`, `ReportExportPort`).
3. **Infrastructure Layer:** Adaptadores concretos (`IndexedDBSettingsRepository`, `PrintExportAdapter`).
4. **Presentation Layer:** Componentes Svelte 5 con Runes y SMUI.
5. **Composition Root:** Fábricas tipadas en `src/lib/di/Container.ts`.

## Consecuencias
### Positivas
- Cualquier cambio futuro en la UI (ej. pasar de SMUI a otra librería) o en la persistencia (ej. pasar de IndexedDB a SQLite local) impactará únicamente a los adaptadores, manteniendo el núcleo financiero intacto.
- Las pruebas unitarias pueden probar el 100% de las fórmulas matemáticas sin montar el DOM ni usar navegadores headless.

### Negativas / Mitigaciones
- Mayor cantidad de archivos y carpetas iniciales. Mitigado mediante el catálogo de módulos y convenciones unificadas en `docs/`.
