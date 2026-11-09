<script lang="ts">
	import Paper from '@smui/paper';
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import { formatCurrency, formatDifference } from '../formatters/financialFormatters';

	interface Props {
		state: SimulatorState;
	}

	let { state }: Props = $props();

	const pairMatrix = $derived(state.pairMatrixResult);
	const simulation = $derived(state.simulationResult);
</script>

<div class="pair-comparison-container">
	<div class="comparison-header">
		<div>
			<h3 class="comparison-title">Rendimientos Comparados</h3>
			<span class="comparison-subtitle">
				Diferencial exacto de saldo entre cada combinación de instrumentos
			</span>
		</div>
	</div>

	{#if simulation && simulation.escenarioLiderId && simulation.resumenPorEscenario.length > 1}
		{@const leader = simulation.resumenPorEscenario.find((s) => s.escenarioId === simulation.escenarioLiderId)}
		{@const runnerUp = simulation.resumenPorEscenario
			.filter((s) => s.escenarioId !== simulation.escenarioLiderId)
			.sort((a, b) => b.balanceFinal - a.balanceFinal)[0]}

		{#if leader && runnerUp}
			<div class="advantage-banner">
				<div class="banner-icon">🏆</div>
				<div class="banner-content">
					<span class="banner-title">Ventaja del Instrumento Líder ({leader.nombre})</span>
					<span class="banner-amount">
						+{formatCurrency(leader.balanceFinal - runnerUp.balanceFinal)}
					</span>
					<span class="banner-vs">frente a {runnerUp.nombre} ({formatCurrency(runnerUp.balanceFinal)})</span>
				</div>
			</div>
		{/if}
	{/if}

	{#if pairMatrix && pairMatrix.comparaciones.length > 0}
		<div class="pairs-grid">
			{#each pairMatrix.comparaciones as pair (`${pair.escenarioA.escenarioId}-${pair.escenarioB.escenarioId}`)}
				<Paper class="pair-paper" elevation={1}>
					<div class="pair-row">
						<div class="pair-names">
							<span class="scenario-name-a">{pair.escenarioA.nombre}</span>
							<span class="vs-label">vs</span>
							<span class="scenario-name-b">{pair.escenarioB.nombre}</span>
						</div>

						<div class="pair-difference">
							<span class="diff-amount {pair.diferenciaBalance >= 0 ? 'diff-positive' : 'diff-negative'}" title={formatDifference(pair.diferenciaBalance)}>
								{formatDifference(pair.diferenciaBalance)}
							</span>
							<span class="diff-rate-label" title={`Rendimiento: ${formatDifference(pair.diferenciaRendimiento)}`}>
								Rendimiento: {formatDifference(pair.diferenciaRendimiento)}
							</span>
						</div>
					</div>
				</Paper>
			{/each}
		</div>
	{:else}
		<p class="empty-notice">Se requieren al menos 2 escenarios para contrastar rendimientos.</p>
	{/if}
</div>

<style>
	.pair-comparison-container {
		margin-bottom: 24px;
	}

	.comparison-header {
		margin-bottom: 16px;
	}

	.comparison-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 800;
		color: #14201f;
		letter-spacing: -0.01em;
	}

	.comparison-subtitle {
		font-size: 0.75rem;
		color: #5e6b6a;
		font-weight: 500;
	}

	.advantage-banner {
		background: #004851;
		color: #ffffff;
		border-radius: 12px;
		padding: 16px 20px;
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 20px;
		box-shadow: 0 4px 12px rgba(0, 72, 81, 0.2);
	}

	.banner-icon {
		font-size: 2rem;
	}

	.banner-content {
		display: flex;
		flex-direction: column;
	}

	.banner-title {
		font-size: 0.8125rem;
		color: #d7ebec;
		font-weight: 600;
	}

	.banner-amount {
		font-size: 1.75rem;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		color: #f6e7c3;
		line-height: 1.1;
		margin: 2px 0;
	}

	.banner-vs {
		font-size: 0.75rem;
		color: #d7ebec;
		opacity: 0.9;
	}

	.pairs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
		gap: 12px;
		width: 100%;
		box-sizing: border-box;
	}

	:global(.pair-paper) {
		padding: 12px 16px !important;
		border-radius: 12px !important;
		border: 1px solid #d5dedc !important;
		background: #ffffff !important;
		min-width: 0 !important;
		overflow: hidden !important;
		box-sizing: border-box !important;
	}

	.pair-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		min-width: 0;
		width: 100%;
	}

	.pair-names {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		flex-shrink: 0;
	}

	.scenario-name-a {
		font-weight: 700;
		font-size: 0.8125rem;
		color: #14201f;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 120px;
	}

	.vs-label {
		font-size: 0.625rem;
		color: #5e6b6a;
		font-weight: 600;
		text-transform: uppercase;
	}

	.scenario-name-b {
		font-weight: 600;
		font-size: 0.75rem;
		color: #5e6b6a;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 120px;
	}

	.pair-difference {
		text-align: right;
		display: flex;
		flex-direction: column;
		min-width: 0;
		overflow: hidden;
		flex: 1;
		align-items: flex-end;
	}

	.diff-amount {
		font-size: clamp(0.8125rem, 1.8vw, 0.9375rem);
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.02em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	.diff-positive {
		color: #0b7a4b;
	}

	.diff-negative {
		color: #b42318;
	}

	.diff-rate-label {
		font-size: 0.6875rem;
		color: #5e6b6a;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	.empty-notice {
		color: #5e6b6a;
		font-size: 0.875rem;
		font-style: italic;
	}

	:global(.dark) .comparison-title {
		color: #e7eef8;
	}

	:global(.dark) .comparison-subtitle,
	:global(.dark) .empty-notice {
		color: #a3b0c6;
	}

	:global(.dark) :global(.pair-paper) {
		background: #131c30 !important;
		border-color: #26334e !important;
	}

	:global(.dark) .scenario-name-a {
		color: #e7eef8;
	}

	:global(.dark) .scenario-name-b,
	:global(.dark) .vs-label,
	:global(.dark) .diff-rate-label {
		color: #a3b0c6;
	}

	:global(.dark) .diff-positive {
		color: #86efac;
	}

	:global(.dark) .diff-negative {
		color: #fca5a5;
	}
</style>
