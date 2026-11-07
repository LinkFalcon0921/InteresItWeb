# Reglas de Dependencias Arquitectónicas (Dependency Rules)

> **Proyecto:** InteresIt Terminal Financiera  
> **Versión:** 2.2  
> **Fecha:** 2026-11-07  

---

## 1. Matriz de Dependencias Permitidas

La arquitectura impone una dirección estricta hacia el centro (Domain). La siguiente matriz establece qué módulo puede importar de cuál:

| Módulo Origen \ Módulo Destino | `$domain` | `$application` | `$infrastructure` | `$presentation` | `$di` | Librerías Externas |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **`$domain`** | **SÍ** | ❌ **PROHIBIDO** | ❌ **PROHIBIDO** | ❌ **PROHIBIDO** | ❌ **PROHIBIDO** | ❌ **CERO DEPENDENCIAS** |
| **`$application`** | **SÍ** | **SÍ** | ❌ **PROHIBIDO** | ❌ **PROHIBIDO** | ❌ **PROHIBIDO** | Solo utilidades puras |
| **`$infrastructure`** | **SÍ** | **SÍ** (Ports) | **SÍ** | ❌ **PROHIBIDO** | ❌ **PROHIBIDO** | APIs Web (IndexedDB, Print) |
| **`$presentation`** | **SÍ** (VO/Enums) | **SÍ** (Use Cases/DTOs) | ❌ **PROHIBIDO** | **SÍ** | ❌ **PROHIBIDO** | Svelte 5, SMUI 9.x |
| **`$di` (Composition Root)** | **SÍ** | **SÍ** | **SÍ** | ❌ **PROHIBIDO** | **SÍ** | Ninguna |
| **`routes/+page.svelte`** | ❌ | ❌ (Usa Presentation) | ❌ | **SÍ** | **SÍ** (Container) | Svelte 5 |

---

## 2. Reglas Específicas por Capa

### 2.1. Reglas para `$domain`
1. Prohibido importar cualquier módulo fuera de `$domain`.
2. Prohibido importar Svelte (`svelte`, runes, etc.).
3. Prohibido importar APIs del navegador (`window`, `document`, `indexedDB`, `localStorage`).
4. Prohibido importar librerías de NPM (excepto tipos puros de desarrollo si fuera indispensable).

### 2.2. Reglas para `$application`
1. Solo puede importar de `$domain` y de sí mismo.
2. Prohibido importar implementaciones concretas de `$infrastructure`. La comunicación se realiza exclusivamente a través de interfaces en `ports/`.
3. Prohibido importar componentes o estado visual de `$presentation`.

### 2.3. Reglas para `$infrastructure`
1. Implementa los contratos definidos en `$application/ports/`.
2. Prohibido depender de componentes visuales de `$presentation`.
3. Prohibido alterar las reglas financieras de `$domain`.

### 2.4. Reglas para `$presentation`
1. Prohibido acceder directamente a la base de datos IndexedDB o invocar adaptadores de infraestructura directamente.
2. Toda interacción que requiera lógica de negocio o persistencia debe pasar por los casos de uso expuestos por `$application` a través del estado reactivo `simuladorState.svelte.ts`.
3. Prohibido declarar enums del dominio dentro de archivos `.svelte`. Importar siempre desde `$domain/enums/`.

---

## 3. Verificación de Violaciones Arquitectónicas

En la fase de pruebas y CI, se auditan las importaciones para garantizar que no existan ciclos ni importaciones cruzadas prohibidas.
