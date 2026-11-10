---
name: qa-pdf-validation
description: "Diseña y verifica exportaciones PDF de aplicaciones web: integridad monetaria, Unicode, tipografías, paginación, estructura, snapshot, concurrencia y descargas móviles. Usar cuando hay PDFs."
---

# qa-pdf-validation

## Entrada
Puerto de exportación, adaptador real, ejemplos/fixtures de datos, biblioteca generadora, criterios negocio para totales/formato y navegadores destino.

## Matriz
- `QA-PDF-001`: 0, 1, N grande registros; ausencia de OOM dentro del entorno de test razonable.
- `QA-PDF-002`: Unicode, tildes, símbolos, cadenas largas y caracteres RTL si contrato lo exige.
- `QA-PDF-003`: columnas, encabezados repetidos, saltos, formato numérico, redondeos y totales exactos.
- `QA-PDF-004`: usuario modifica información mientras PDF se genera; snapshot coherente y trazable.
- `QA-PDF-005`: descarga/visualización en móvil y recursos limitados.

## Proceso de prueba
1. Definir **oráculo independiente** desde fixtures: cantidad y orden de filas, IDs, importes, totales, fechas, formato decimal y filtros aprobados.
2. Generar PDF con adaptador real en entorno aislado; validar firma `%PDF-`, parser PDF real, número de páginas y ausencia de corrupción. La firma sola **no** prueba validez.
3. Extraer texto/tablas cuando sea posible; contrastar valores críticos; recordar que extracción no garantiza legibilidad visual.
4. Revisar páginas renderizadas para cortes, solapamiento, paginación y tipografía; usar revisiones manuales si no hay comparación robusta.
5. Validar que una exportación no mezcle dos estados durante generación; registrar momento de snapshot acordado.
6. Test E2E del enlace/botón de exportación y descarga, filename/MIME y Android/iOS reales solo si disponibles.
7. Evitar snapshots binarios exactos con metadatos variables como único oráculo. Registrar hash si es útil como evidencia, no como criterio único.

## Salida
`fixture | PDF generado | parser | filas/valores/total | paginación | navegador | evidencia | estado`. Dejar `NO EJECUTADO` cuando falta renderizador o dispositivo.
