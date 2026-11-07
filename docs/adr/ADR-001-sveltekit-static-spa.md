# ADR-001: Adopción de SvelteKit con `@sveltejs/adapter-static` como SPA Estática

## Estado
Aceptado

## Contexto
InteresIt es una terminal financiera que debe ejecutarse 100% en el cliente sin requerir un servidor Node.js en tiempo de ejecución, preservando la privacidad del usuario y operando de forma offline (PWA) con despliegue en GitHub Pages. Se evaluó si era conveniente usar Svelte 5 puro con Vite básico o SvelteKit.

## Decisión
Adoptar **SvelteKit 3** configurado con `@sveltejs/adapter-static` en modo Single Page Application (SPA):
- `prerender = true`
- `ssr = false`
- `trailingSlash = 'always'`

## Consecuencias
### Positivas
- Estándar oficial del ecosistema Svelte moderno con soporte de enrutamiento basado en archivos, alias de paths preconfigurados (`$lib`) y soporte de Service Worker integrado (`src/service-worker.ts`).
- Genera archivos estáticos HTML/JS/CSS en el directorio `build/` listos para GitHub Pages o cualquier CDN estática.
- Cero costo de servidor en producción; Node.js se utiliza exclusivamente como entorno de desarrollo y compilación.

### Negativas / Mitigaciones
- Requiere configurar explícitamente `fallback: '404.html'` o `index.html` para evitar problemas con recargas profundas en servidores que no soporten rewrites de SPA.
