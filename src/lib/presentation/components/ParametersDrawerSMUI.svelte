<script lang="ts">
	import Drawer, { Content, Header, Title, Subtitle, Scrim } from '@smui/drawer';
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import DataEntrySMUI from './DataEntrySMUI.svelte';

	interface Props {
		state: SimulatorState;
	}

	let { state }: Props = $props();
</script>

<Drawer variant="modal" bind:open={state.isDrawerOpen} class="parameters-drawer">
	<Header>
		<div class="drawer-header-row">
			<div>
				<Title>Parámetros</Title>
				<Subtitle>Configuración del Simulador</Subtitle>
			</div>
			<button
				type="button"
				class="close-drawer-btn"
				onclick={() => {
					state.isDrawerOpen = false;
				}}
				aria-label="Cerrar panel de parámetros"
			>
				✕
			</button>
		</div>
	</Header>
	<Content class="drawer-content">
		<DataEntrySMUI {state} />
	</Content>
</Drawer>
<Scrim />

<style>
	:global(.parameters-drawer) {
		width: 340px !important;
		max-width: 90vw !important;
		background: #ffffff !important;
		z-index: 60 !important;
	}

	.drawer-header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}

	.close-drawer-btn {
		appearance: none;
		border: none;
		background: transparent;
		font-size: 1.1rem;
		cursor: pointer;
		color: #5e6b6a;
		padding: 4px 8px;
		border-radius: 6px;
	}

	.close-drawer-btn:hover {
		background: #f6f8fb;
		color: #14201f;
	}

	:global(.drawer-content) {
		padding: 16px !important;
	}

	:global(.dark) :global(.parameters-drawer) {
		background: #131c30 !important;
		border-color: #26334e !important;
	}

	:global(.dark) .close-drawer-btn {
		color: #a3b0c6;
	}

	:global(.dark) .close-drawer-btn:hover {
		background: #1e293b;
		color: #e7eef8;
	}
</style>
