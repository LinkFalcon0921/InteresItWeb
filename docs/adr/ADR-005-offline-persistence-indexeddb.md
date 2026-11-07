# ADR-005: Persistencia Offline Nativa con IndexedDB Retrocompatible

## Estado
Aceptado

## Contexto
El usuario final utiliza la terminal en modo offline con datos locales almacenados en el navegador. La versión legacy utilizaba IndexedDB (`InteresItDB`, store `settings`, clave `'current'`). Se evaluó migrar a LocalStorage o adoptar una librería como Dexie o `idb`.

## Decisión
1. Mantener **IndexedDB** como motor de persistencia, implementado en la clase `IndexedDBSettingsRepository` dentro de `$infrastructure/persistence/`.
2. Utilizar las APIs nativas de IndexedDB encapsuladas en Promises tipadas, sin añadir dependencias externas de NPM.
3. Preservar de forma exacta el nombre de la base de datos (`InteresItDB`), el object store (`settings`) y la clave (`'current'`), garantizando que usuarios existentes no pierdan su configuración al recibir la nueva versión.

## Consecuencias
### Positivas
- Cero dependencias adicionales en el bundle.
- 100% de compatibilidad con datos previamente guardados por el usuario.
- Operación asíncrona no bloqueante en el hilo principal del navegador.

### Negativas / Mitigaciones
- La API nativa de IndexedDB se basa en eventos DOM antiguos (`onsuccess`, `onerror`). Queda completamente aislada dentro del adaptador de infraestructura en una Promise limpia, sin fugarse a la aplicación.
