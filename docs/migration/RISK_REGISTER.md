# Registro de Riesgos de Migración (Risk Register)

> **Proyecto:** InteresIt Terminal Financiera  
> **Fecha:** 2026-11-07  

---

| ID | Descripción del Riesgo | Impacto | Probabilidad | Severidad | Estrategia de Mitigación | Responsable |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **RSK-01** | **Discrepancia en precisión financiera:** Variación en redondeo o cómputo de días en períodos bisectos o cortes a fin de mes. | Alto | Media | **ALTA** | Creación de suite de caracterización en Vitest con casos de prueba idénticos a los definidos en la especificación v2.2 ($185.01, $185.44, $185.11, $188.26$). | Domain Architect |
| **RSK-02** | **Incompatibilidad de TypeScript 7 con tooling de Svelte 5:** Que `svelte-check` o `vite` muestren advertencias o incompatibilidad de versión. | Medio | Media | **MEDIA** | Ejecución de prueba técnica en Fase 2. Si surgen bloqueos no resueltos por los plugins oficiales, mantener fallback documentado con TS 6.0/5.8 sin romper el proyecto. | Lead Architect |
| **RSK-03** | **Pérdida de datos del usuario en IndexedDB:** Al migrar la persistencia, que se borren o sobreescriban los settings guardados del usuario en el navegador. | Alto | Baja | **MEDIA** | Adaptador `IndexedDBSettingsRepository` en Infrastructure que reutiliza exactamente el mismo nombre `InteresItDB`, mismo objectStore `settings` y clave `'current'`. | Lead Engineer |
| **RSK-04** | **Límite de 600 líneas por archivo excedido:** Que vistas complejas de la terminal (como la tabla mensual o el modal de exportación) crezcan desmedidamente. | Medio | Media | **MEDIA** | Descomposición modular estricta de componentes Svelte 5. Script automatizado `pnpm run check:lines` que emite advertencia a las 450 líneas y falla a las 600. | Full Stack Engineer |
| **RSK-05** | **Fallo de PWA o caché desactualizada tras migración:** Que clientes con la versión antigua de `sw.js` sigan sirviendo el monolito legacy sin actualizar. | Alto | Media | **ALTA** | Actualización de nombre de caché en Service Worker a `interesit-v2-cache` con evento `activate` que purga cachés obsoletas y fuerza actualización suave. | Lead Engineer |
| **RSK-06** | **Fuga de estilos o inconsistencias en SMUI:** Problemas de compilación de Sass o choques entre clases utilitarias y estilos de Material Design. | Medio | Baja | **BAJA** | Centralización de variables de tema en `src/theme/_smui-theme.scss` y aislamiento de clases en componentes de presentación. | UI Engineer |
