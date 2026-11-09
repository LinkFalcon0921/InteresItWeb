<script lang="ts">
	import AppButton from './AppButton.svelte';
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import ScenarioCardSMUI from './ScenarioCardSMUI.svelte';

	interface Props {
		state: SimulatorState;
		twoColumnsFlexible?: boolean;
		twoRowsInfinite?: boolean; // Compatibilidad retroactiva
	}

	let { state, twoColumnsFlexible = true, twoRowsInfinite = false }: Props = $props();

	const isTwoColumns = $derived(twoColumnsFlexible || twoRowsInfinite);

	const leaderId = $derived(state.simulationResult?.escenarioLiderId ?? '');
	const summaries = $derived(state.simulationResult?.resumenPorEscenario ?? []);
	const canDelete = $derived(state.inversiones.length > 2);
	const canAdd = $derived(state.inversiones.length < 200);

	function findSummary(id: string) {
		return summaries.find((s) => s.escenarioId === id);
	}
</script>

<div class="scenarios-section">
	<div class="section-header">
		<div>
			<h3 class="section-title">Escenarios de Inversión</h3>
			<span class="section-subtitle">
				Comparando {state.inversiones.length} instrumentos simultáneamente
			</span>
		</div>

		{#if canAdd}
			<AppButton
				variant="secondary"
				onclick={() => state.addInversion()}
				id="btn-add-scenario" class="add-scenario-btn"
			>
				+ Agregar Escenario
			</AppButton>
		{/if}
	</div>

	<div class="scenarios-grid {isTwoColumns ? 'scenarios-grid--two-columns' : ''}">
		{#each state.inversiones as inversion (inversion.id)}
			<ScenarioCardSMUI
				{state}
				{inversion}
				summary={findSummary(inversion.id)}
				isLeader={inversion.id === leaderId}
				{canDelete}
			/>
		{/each}
	</div>
</div>

<style>
	.scenarios-section {
		margin-bottom: 24px;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px;
		margin-bottom: 16px;
	}

	.section-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 800;
		color: #14201f;
		letter-spacing: -0.01em;
	}

	.section-subtitle {
		font-size: 0.75rem;
		color: #5e6b6a;
		font-weight: 500;
	}

	.scenarios-grid,
	.scenarios-grid--two-columns {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
		grid-auto-flow: row;
		grid-auto-rows: auto;
		gap: 16px;
		width: 100%;
		box-sizing: border-box;
		overflow-x: visible;
		overflow-y: visible;
	}

	@media (max-width: 480px) {
		.scenarios-grid,
		.scenarios-grid--two-columns {
			grid-template-columns: 1fr;
			gap: 12px;
		}
	}

	:global(.add-scenario-btn) {
		border-color: #004851 !important;
		color: #004851 !important;
		border-radius: 10px !important;
		font-weight: 700 !important;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
	}

	:global(.add-scenario-btn:hover) {
		background-color: rgba(0, 72, 81, 0.08) !important;
		box-shadow: 0 3px 8px rgba(0, 72, 81, 0.15) !important;
		transform: translateY(-1px);
	}

	:global(.add-scenario-btn:active) {
		transform: translateY(0);
		box-shadow: 0 1px 2px rgba(0, 72, 81, 0.1) !important;
	}

	:global(html.dark) .section-title,
	:global(.dark) .section-title {
		color: #e7eef8;
	}

	:global(html.dark) .section-subtitle,
	:global(.dark) .section-subtitle {
		color: #a3b0c6;
	}

	:global(html.dark) :global(.add-scenario-btn),
	:global(.dark) :global(.add-scenario-btn) {
		border-color: #10b981 !important;
		color: #10b981 !important;
	}

	:global(html.dark) :global(.add-scenario-btn:hover),
	:global(.dark) :global(.add-scenario-btn:hover) {
		background-color: rgba(16, 185, 129, 0.15) !important;
		box-shadow: 0 3px 8px rgba(16, 185, 129, 0.25) !important;
	}
</style>
