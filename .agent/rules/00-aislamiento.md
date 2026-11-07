---
trigger: always_on
---

# Restricción Estricta de Contexto y Skills

- **Regla de aislamiento:** Para este espacio de trabajo, DEBES ignorar por completo cualquier skill, instrucción o herramienta global ubicada fuera de la carpeta `.agent/skills/` de este proyecto.
- **Stack exclusivo:** Este repositorio pertenece exclusivamente a un proyecto en **Svelte / SvelteKit**. No apliques patrones, arquitecturas ni habilidades de Android, Kotlin, Java u otros frameworks aunque estén disponibles en tu entorno global.
- **Skills permitidas:** Únicamente puedes invocar y ejecutar los skills definidos localmente en `./.agent/skills/`. Si una tarea requiere un skill que no existe localmente, solicita confirmación antes de buscar alternativas.