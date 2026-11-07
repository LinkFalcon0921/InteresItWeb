# ADR-006: TypeScript 7 Estricto, Prohibición de `any` y Parsers Tipados

## Estado
Aceptado

## Contexto
El código original carecía de tipado estático, utilizando coerción implícita (`parseFloat(el.value) || 0`) sin reportar errores al usuario. Se requiere una estrategia de seguridad de tipos para evitar errores en tiempo de ejecución.

## Decisión
1. Adoptar **TypeScript 7** en modo estricto (`strict: true`, `noImplicitAny: true`, `exactOptionalPropertyTypes: true`).
2. Prohibir terminantemente el uso de `any`, conversiones forzadas (`as SomeType`), `as const` para silenciar tipos y non-null assertions (`!`).
3. Toda deserialización o lectura de inputs del usuario debe pasar por **funciones parser** que reciben `unknown` y retornan tipos discriminados `Result<T, E>`.
4. Los valores finitos del dominio se representan exclusivamente con **string enums** en archivos `.ts` independientes.
5. Si durante la fase de instalación de herramientas de Fase 2 surgiera alguna incompatibilidad temporal de plugins oficiales con TS 7.0, se documentará un fallback temporal controlado con TS 6.0/5.8 sin comprometer el estándar de tipado estricto.

## Consecuencias
### Positivas
- Cero excepciones de tipo `TypeError` en producción.
- Autocompletado, refactorización segura y documentación viva en todo el codebase.
- Validación explícita de bordes del sistema.

### Negativas / Mitigaciones
- Mayor rigurosidad requerida al procesar formularios y eventos de UI. Se mitiga mediante utilidades parser reutilizables en `$domain/parsers/`.
