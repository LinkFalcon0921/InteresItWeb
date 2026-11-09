import type { Action } from 'svelte/action';

/**
 * Svelte 5 Action para teletransportar un elemento al final de document.body (o un contenedor específico).
 * Garantiza que elementos fijos como diálogos, modales y scrims escapen de los contextos
 * de apilamiento (stacking context) de contenedores con position: sticky, overflow o transform.
 */
export const portal: Action<HTMLElement, HTMLElement | string | undefined> = (node, target) => {
	if (typeof document === 'undefined') return;

	function moveNode(targetArg?: HTMLElement | string): void {
		const targetEl =
			typeof targetArg === 'string'
				? document.querySelector<HTMLElement>(targetArg)
				: (targetArg ?? document.body);

		if (targetEl && node.parentNode !== targetEl) {
			targetEl.appendChild(node);
		}
	}

	moveNode(target);

	return {
		update(newTarget): void {
			moveNode(newTarget);
		},
		destroy(): void {
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
		}
	};
};
