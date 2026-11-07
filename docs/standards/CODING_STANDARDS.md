# Estándares de Código y Convenciones Técnicas (Coding Standards)

> **Proyecto:** InteresIt Terminal Financiera  
> **Versión:** 2.2  
> **Fecha:** 2026-11-07  

---

## 1. Límite de Tamaño de Archivos (Obligatorio)

Ningún archivo mantenido por el equipo superará las **600 líneas físicas**.

- **Límite máximo permitido:** 600 líneas.
- **Umbral de advertencia:** 450 líneas.
- **Control automatizado:** Script `pnpm run check:lines` ejecutado en pre-commit y CI.
- **Alcance:** Archivos `.ts`, `.svelte`, `.scss`, `.json` de configuración y tests. (Excluye `pnpm-lock.yaml` y artefactos de compilación).

Cuando un componente o servicio se aproxime a las 450 líneas, debe dividirse mediante descomposición funcional o extracción de subcomponentes.

---

## 2. Tipado Estricto (TypeScript 7)

- `tsconfig.json` debe mantener activado `strict: true`, `noImplicitAny: true`, `exactOptionalPropertyTypes: true`.
- **Prohibido el uso de `any`:** Todo tipo desconocido de origen externo debe modelarse como `unknown` y procesarse mediante parsers.
- **Prohibido el uso de `as SomeType` o `as const` para forzar tipos:** No forzar al compilador con casts manuales.
- **Prohibidas las non-null assertions (`!`):** Manejar los posibles `undefined` o `null` mediante guardas y narrowing explícito.

---

## 3. Enums y Constantes

- Los valores finitos del dominio deben representarse mediante **string enums** explícitos.
- **Prohibido el uso de `const enum`:** Utilizar enums estándar para compatibilidad con compiladores y bundlers modernos.
- Los enums deben residir en archivos `.ts` independientes dentro de `$domain/enums/`.
- **Prohibido declarar enums dentro de componentes `.svelte`:** Importar siempre desde el dominio.
- Distinguir claramente entre:
  - Enums de dominio (ej. `ScenarioRole`, `TabIdentifier`).
  - Constantes de configuración (ej. `DEFAULT_SETTINGS`).
  - Literales técnicos y tokens visuales.

---

## 4. Funciones Parser (`Result<T, E>`)

Toda entrada externa no confiable (valores de inputs HTML, datos deserializados de IndexedDB, query params) debe procesarse mediante funciones parser:

1. Reciben un tipo `unknown`.
2. Validan estructura y tipos de datos.
3. Transforman los valores al modelo o Value Object esperado.
4. Devuelven un tipo discriminado de éxito o error:
   ```typescript
   export type Result<T, E> = 
     | { ok: true; value: T }
     | { ok: false; error: E };
   ```

Ejemplos: `parseAmount(input: unknown): Result<Money, InputError>`, `parseCutoffDay(input: unknown): Result<CutoffDay, InputError>`.

---

## 5. Convenciones de Svelte 5 (Runes Only)

- Se prohíbe terminantemente la sintaxis de Svelte 3 y 4:
  - ❌ No usar `export let` (reemplazado por `$props()`).
  - ❌ No usar `$: ` (reemplazado por `$derived()` o `$derived.by()`).
  - ❌ No usar `<slot />` (reemplazado por snippets `{#snippet}` y `{@render}`).
  - ❌ No usar `createEventDispatcher` (reemplazado por callbacks pasados como props).
- Usar Runes explícitos:
  - `$state()` para estado reactivo local o de clase.
  - `$derived()` para valores calculados automáticamente.
  - `$effect()` utilizado con moderación, exclusivamente para efectos secundarios hacia APIs externas (ej. DOM, localStorage/IndexedDB).
  - `$props()` tipado estrictamente con interfaces TypeScript:
    ```svelte
    <script lang="ts">
      interface Props {
        readonly titulo: string;
        readonly tasa: number;
        onCambio?: (nuevaTasa: number) => void;
      }
      let { titulo, tasa, onCambio }: Props = $props();
    </script>
    ```

---

## 6. Funciones y Principios de Diseño

- **Funciones Puras:** Preferir funciones sin efectos secundarios ocultos, con entradas y salidas explícitas.
- **Nomenclatura Semántica:** Nombres en español formal para conceptos del dominio financiero dominicano (`diaCorte`, `capitalInicial`, `aporteMensual`, `rendimientoNeto`) y en inglés estándar para patrones técnicos (`UseCase`, `Port`, `Repository`, `Adapter`, `Result`).
- **Inmutabilidad:** Los Value Objects son inmutables; cualquier operación de transformación devuelve una nueva instancia.
