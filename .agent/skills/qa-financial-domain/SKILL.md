---
name: qa-financial-domain
description: "Opcional: valida cálculos de productos financieros y monetarios con oráculos independientes, redondeos, límites, invariantes y comparaciones entre versiones. Usar solo si el proyecto calcula dinero."
---

# qa-financial-domain

## Condición
No activar por el simple hecho de exportar a PDF o usar números. Activar únicamente cuando existan reglas de cálculo financiero, importes, presupuestos, rendimientos o productos relacionados.

## Proceso
1. Identificar fórmula de negocio **aprobada**, dominio de entradas, precisión decimal, moneda, escala de redondeo y tolerancias. Si faltan, registrar `POR VALIDAR`.
2. Construir un oráculo externo al código de producción: tablas de ejemplo aprobadas, fórmula derivada del requerimiento, cálculos exactos con decimal o fracciones y fixtures de versión anterior.
3. Probar: cero, negativos permitidos/no permitidos, límites, tasas extremas, fechas, leap year, cambio de periodicidad, separadores locales, porcentajes y redondeos acumulados.
4. Aplicar invariantes/metamorphic tests solo si provienen de reglas aprobadas; no asumir monotonicidad o suma para cálculos que no la cumplen.
5. Comparar versión anterior vs nueva con datos iguales, registrando cambios intencionales de regla.
6. Validar persistencia y PDF: valor mostrado/exportado coincide con valor calculado conforme al redondeo aprobado.
7. Ejecutar unitarios/contratos/E2E en orden, registrar evidencia y analizar diferencias sin ajustar fixtures para que pasen.

## Salida
`caso | fórmula negocio | entrada | resultado independiente | resultado producto | diferencia | tolerancia aceptada | evidencia | severidad`.

## Precaución
No usar aritmética binaria float como oráculo de centavos cuando la regla exige decimal exacto; no imponer modelos de interés inexistentes en especificaciones.
