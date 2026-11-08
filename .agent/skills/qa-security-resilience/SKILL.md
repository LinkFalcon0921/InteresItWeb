---
name: qa-security-resilience
description: "Realiza revisión autorizada y pruebas seguras de seguridad web, resiliencia, DOM XSS, Driver.js, datos de navegador, dependencias y errores. Usar para QA de endurecimiento y riesgos."
---

# qa-security-resilience

## Límite de operación
Solo sobre entorno propio o autorizado y datos sintéticos. Por defecto hacer análisis estático/lectura; para dinámico requerir permiso explícito, tasa limitada y entorno aislado. Nunca exfiltrar secretos, modificar producción ni ejecutar denial-of-service.

## Superficies objetivo
1. HTML dinámico y popovers Driver.js: sanitización, texto vs HTML, manejadores de eventos, uso de APIs DOM peligrosas.
2. Svelte 5: interpolación segura, APIs que renderizan HTML sin sanitizar, URL/query params y datos persistidos.
3. IndexedDB/LocalStorage: no suponer cifrado, controlar persistencia de datos sensibles, limpieza de sesiones y errores de lectura.
4. PDF: escapado de datos, enlaces generados, recursos externos no confiables y tratamiento de texto malicioso.
5. Dependencias: auditorías de lockfile y CVEs con versión comprobada, sin calificar por alertas genéricas sin confirmar alcanzabilidad/impacto.
6. Resiliencia: repetición de acciones, fallos de red, errores de cuota, interrupciones y degradación accesible.

## Procedimiento
- Identificar puntos de entrada y salida de datos, orígenes de confianza y mitigaciones presentes.
- Diseñar payloads benignos no ejecutables para probar escapes, y controles aislados donde esté autorizado.
- Clasificar vulnerabilidades confirmadas solo con versión, ruta, entrada, resultado, impacto y pasos reproducibles; una sospecha estática es `RIESGO` hasta prueba.
- Vincular OWASP WSTG, rutas de remediación, límites y pruebas de regresión.
- Documentar explícitamente los casos no probados por falta de permiso o herramienta.

## Salida
Registro `hallazgo/riesgo | entrada | confianza | impacto | reproducción autorizada | evidencia | mitigación | regresión`, segregando `P0/P1` de P2/P3.
