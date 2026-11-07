<script lang="ts">
	import Button, { Label } from '@smui/button';
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import ScenarioCardSMUI from './ScenarioCardSMUI.svelte';

	interface Props {
		state: SimulatorState;
	}

	let { state }: Props = $props();

	const leaderId = $derived(state.simulationResult?.escenarioLiderId ?? '');
	const summaries = $derived(state.simulationResult?.resumenPorEscenario ?? []);
	const canDelete = $derived(state.inversiones.length > 2);
	const canAdd = $derived(state.inversiones.length < 20);

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
			<Button
				variant="outlined"
				onclick={() => state.addInversion()}
				class="add-scenario-btn"
			>
				<Label>+ Agregar Escenario</Label>
			</Button>
		{/if}
	</div>

	<div class="scenarios-grid">
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

	.scenarios-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
	}

	:global(.add-scenario-btn) {
		border-color: #004851 !important;
		color: #004851 !important;
		border-radius: 8px !important;
	}

	:global(.dark) .section-title {
		color: #e7eef8;
	}

	:global(.dark) .section-subtitle {
		color: #a3b0c6;
	}

	:global(.dark) :global(.add-scenario-btn) {
		border-color: #7fd1d8 !important;
		color: #7fd1d8 !important;
	}
</style>
