# ADR-006: TypeScript 7 Estricto, Prohibición de `any` y Parsers Tipados

## Estado
Aceptado

## Contexto
El código original carecía de tipado estático, utilizando coerción implícita (`parseFloat(el.value) || 0`) sin reportar errores al usuario. Se requiere una estrategia de seguridad de tipos para evitar errores en tiempo de ejecución.

## Decisión
1. Adoptar el compilador **TypeScript 5.7+** con configuración estricta anticipando y adhiriendo formalmente a los estándares de **TypeScript 7** (`strict: true`, `noImplicitAny: true`, `exactOptionalPropertyTypes: true`, `verbatimModuleSyntax: true`).
2. Prohibir terminantemente el uso de `any`, conversiones forzadas (`as SomeType`), `as const` para silenciar tipos y non-null assertions (`!`).
3. Toda deserialización o lectura de inputs del usuario debe pasar por **funciones parser** que reciben `unknown` y retornan tipos discriminados `Result<T, E>`.
4. Los valores finitos del dominio se representan exclusivamente con **string enums** o uniones discriminadas en archivos `.ts` independientes.
5. El baseline de herramientas actual opera con TypeScript 5.7.x en el toolchain Node 24 / SvelteKit, aplicando rigurosamente todas las reglas y restricciones de tipo que serán obligatorias en TS 7.0, garantizando una transición sin cambios sintácticos ni breaking changes.

## Consecuencias
### Positivas
- Cero excepciones de tipo `TypeError` en producción.
- Autocompletado, refactorización segura y documentación viva en todo el codebase.
- Validación explícita de bordes del sistema.

### Negativas / Mitigaciones
- Mayor rigurosidad requerida al procesar formularios y eventos de UI. Se mitiga mediante utilidades parser reutilizables en `$domain/parsers/`.
