# Registro de Cambios (Changelog) - InteresIt

Documentación de todas las fases de actualización del proyecto.

---

## [Fase 1] - Configurar PWA y Almacenamiento Local (IndexedDB)
**Estatus:** Completado 🟢
**Nivel de criticidad:** Alto (Base para persistencia de datos)
**A quién afectó:** Usuarios finales (ahora pueden instalar la app y no pierden sus datos al recargar).

### Detalles de lo que se cambió:
Se modificó la estructura base del HTML para registrar un manifest y un service worker, permitiendo su instalación como aplicación. Se reemplazó la dependencia temporal en memoria por persistencia persistente en el navegador.

### Nuevas implementaciones:
- Añadido `manifest.json` y `sw.js` para soporte PWA Offline.
- Integración de API `IndexedDB` nativa (cero dependencias externas) para guardar automáticamente:
  - Capital inicial, aportes mensuales.
  - Fechas (Inicio, Fin, Día de corte).
  - Tasas de interés anual (E1 y E2).
  - Preferencia de tema (Oscuro/Claro).

---

## [Fase 2] - Refactorizar UI para Inversiones Dinámicas y Lógica de Impuestos
**Estatus:** En progreso 🟡
**Nivel de criticidad:** Alto (Core de negocio y reglas matemáticas)
**A quién afecta:** Lógica de cálculo y experiencia de usuario en la pantalla principal.

### Detalles de lo que se va a cambiar:
Se removerán los inputs estáticos limitados a 2 escenarios (E1 y E2). El motor matemático pasará de calcular 2 variables fijas a iterar sobre un array dinámico N. Se ajustará la interfaz HTML.

### Nuevas implementaciones (Planificadas):
- UI dinámica para agregar, editar y eliminar hasta 20 inversiones diferentes (Nombre y Tasa de interés).
- Integración de un checkbox activo por defecto para aplicar la "Reducción por ley" (10% de retención de impuestos sobre los intereses ganados) para la República Dominicana.
- Persistencia de la lista de inversiones en `IndexedDB`.

---

## [Fase 3] - Implementar Sidebar de Comparación y Gráficas
**Estatus:** Pendiente ⚪
**Nivel de criticidad:** Medio (Mejora visual y analítica)
**A quién afecta:** Usuarios que desean comparar rentabilidades visualmente.

### Detalles de lo que se va a cambiar:
La tabla de proyecciones principal será movida a un panel lateral que funcionará como dashboard comparativo.

### Nuevas implementaciones (Planificadas):
- Sidebar "automirrored" derecho que se despliega exclusivamente al seleccionar 2 inversiones.
- Integración de `Chart.js` para visualizar comparativas mediante gráficos de líneas y pastel.

---

## [Fase 4] - Implementar Exportación (PDF e Imagen)
**Estatus:** Pendiente ⚪
**Nivel de criticidad:** Medio (Funcionalidad de reportes)
**A quién afecta:** Usuarios que necesitan extraer la información de la plataforma.

### Detalles de lo que se va a cambiar:
Se agregarán herramientas de captura y generación de documentos en el DOM.

### Nuevas implementaciones (Planificadas):
- Integración de `html2canvas` para guardar el canvas comparativo al portapapeles o como imagen ligera.
- Integración de `jsPDF` para exportar la proyección en formato documento/factura.
- Actualización del tutorial con `driver.js`.

---

## [Fase 5] - Migración a Svelte + TypeScript + TailwindCSS + Github Pages
**Estatus:** Pendiente ⚪
**Nivel de criticidad:** Crítico (Reescritura de Arquitectura y CI/CD)
**A quién afecta:** Desarrolladores (Arquitectura) y Usuarios (Nuevo UI/UX).

### Detalles de lo que se va a cambiar:
Reescritura completa del código Vanilla HTML/JS actual a un framework moderno y tipado. Rediseño completo de la paleta de colores.

### Nuevas implementaciones (Planificadas):
- Migración a **Svelte 5 (latest)** con **TypeScript**.
- Rediseño UI con TailwindCSS usando paleta de colores Neón, orientados a dinero (verdes brillantes) y alusivos a la bandera de República Dominicana (Azul, Rojo, Blanco).
- Configuración de Github Actions para compilación y despliegue automático en Github Pages.
