<script lang="ts">
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import DataEntrySMUI from './DataEntrySMUI.svelte';

	interface Props {
		state: SimulatorState;
	}

	let { state }: Props = $props();

	function closeDrawer(): void {
		state.isDrawerOpen = false;
		if (typeof document !== 'undefined') {
			const btn = document.querySelector<HTMLElement>('.mobile-menu-btn');
			btn?.focus();
		}
	}

	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'Escape' && state.isDrawerOpen) {
			e.preventDefault();
			closeDrawer();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if state.isDrawerOpen}
	<!-- Scrim accesible para cerrar con clic exterior -->
	<div
		class="drawer-scrim"
		onclick={closeDrawer}
		role="presentation"
		aria-hidden="true"
	></div>

	<div
		class="parameters-drawer"
		role="dialog"
		aria-modal="true"
		aria-label="Parámetros de Simulación"
	>
		<div class="drawer-header-row">
			<div>
				<h2 class="drawer-title">Parámetros</h2>
				<span class="drawer-subtitle">Configuración del Simulador</span>
			</div>
			<button
				type="button"
				class="close-drawer-btn"
				onclick={closeDrawer}
				aria-label="Cerrar panel de parámetros"
			>
				✕
			</button>
		</div>

		<div class="drawer-content">
			<DataEntrySMUI {state} />
		</div>
	</div>
{/if}

<style>
	.drawer-scrim {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.45);
		z-index: 90;
	}

	.parameters-drawer {
		position: fixed;
		top: 0;
		left: 0;
		width: min(340px, 90vw);
		height: 100vh;
		background: #ffffff;
		z-index: 100;
		box-shadow: 4px 0 16px rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		box-sizing: border-box;
	}

	.drawer-header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		border-bottom: 1px solid #edf2f0;
	}

	.drawer-title {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 800;
		color: #14201f;
	}

	.drawer-subtitle {
		font-size: 0.75rem;
		color: #5e6b6a;
		font-weight: 500;
	}

	.close-drawer-btn {
		appearance: none;
		border: none;
		background: transparent;
		font-size: 1.15rem;
		cursor: pointer;
		color: #5e6b6a;
		padding: 6px 10px;
		min-width: 36px;
		min-height: 36px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
	}

	.close-drawer-btn:hover {
		background: #f6f8fb;
		color: #14201f;
	}

	.drawer-content {
		padding: 16px;
		flex: 1;
		overflow-y: auto;
	}

	:global(html.dark) .parameters-drawer {
		background: #131c30;
		color: #e7eef8;
		border-color: #26334e;
	}

	:global(html.dark) .drawer-header-row {
		border-color: #26334e;
	}

	:global(html.dark) .drawer-title {
		color: #e7eef8;
	}

	:global(html.dark) .drawer-subtitle,
	:global(html.dark) .close-drawer-btn {
		color: #a3b0c6;
	}

	:global(html.dark) .close-drawer-btn:hover {
		background: #1e293b;
		color: #e7eef8;
	}

	@media (min-width: 961px) {
		.drawer-scrim,
		.parameters-drawer {
			display: none !important;
			visibility: hidden !important;
			pointer-events: none !important;
		}
	}

	@media print {
		.drawer-scrim,
		.parameters-drawer {
			display: none !important;
			visibility: hidden !important;
		}
	}
</style>
