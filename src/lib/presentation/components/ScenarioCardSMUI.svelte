<script lang="ts">
	import Paper from '@smui/paper';
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import type { InvestmentSettingDTO, ScenarioSummaryDTO } from '$application';
	import { formatCurrency } from '../formatters/financialFormatters';
	import { RateStepDelta, type RateStepDelta as RateStepDeltaType } from '../enums/RateStepDelta';

	interface Props {
		state: SimulatorState;
		inversion: InvestmentSettingDTO;
		summary: ScenarioSummaryDTO | undefined;
		isLeader: boolean;
		canDelete: boolean;
	}

	let { state, inversion, summary, isLeader, canDelete }: Props = $props();

	function handleTasaInput(event: Event): void {
		if (!(event.target instanceof HTMLInputElement)) return;
		const target = event.target;
		const val = parseFloat(target.value);
		state.updateInversionTasa(inversion.id, Number.isFinite(val) ? val : 0);
	}

	function handleNombreInput(event: Event): void {
		if (!(event.target instanceof HTMLInputElement)) return;
		const target = event.target;
		state.updateInversionNombre(inversion.id, target.value);
	}

	function adjustTasa(delta: RateStepDeltaType): void {
		const raw = inversion.tasaAnual + delta;
		const rounded = Math.round(raw * 100) / 100;
		const clamped = Math.max(0, Math.min(100, rounded));
		state.updateInversionTasa(inversion.id, clamped);
	}
</script>

<div class="scenario-card-wrapper {isLeader ? 'is-leader-card' : ''}">
	<Paper class="scenario-paper" elevation={isLeader ? 3 : 1}>
		{#if isLeader}
			<div class="leader-ribbon">
				<span class="ribbon-star">★</span> Mejor Rendimiento
			</div>
		{/if}

		<div class="card-header">
			<div class="title-row">
				<span class="color-dot color-{inversion.color}"></span>
				<input
					type="text"
					class="scenario-name-input"
					value={inversion.nombre}
					oninput={handleNombreInput}
					aria-label="Nombre del escenario"
				/>
			</div>

			{#if canDelete}
				<button
					type="button"
					class="delete-btn"
					onclick={() => state.removeInversion(inversion.id)}
					title="Eliminar este escenario"
					aria-label="Eliminar escenario {inversion.nombre}"
				>
					✕
				</button>
			{/if}
		</div>

		<div class="rate-input-section">
			<div class="rate-input-main-row">
				<label class="rate-label" for="tasa-{inversion.id}">Tasa Anual Nominal</label>
				<div class="rate-input-wrapper">
					<input
						id="tasa-{inversion.id}"
						type="number"
						step="0.05"
						min="0"
						max="100"
						class="rate-input"
						value={inversion.tasaAnual}
						oninput={handleTasaInput}
					/>
					<span class="rate-suffix">%</span>
				</div>
			</div>

			<div class="rate-micro-steppers" role="group" aria-label="Ajuste rápido táctil de tasa">
				<button
					type="button"
					class="rate-step-btn rate-step-dec"
					onclick={() => adjustTasa(RateStepDelta.DecreaseHalf)}
					title="Restar 0.50% tasa"
					aria-label="Restar 0.50% tasa de {inversion.nombre}"
				>
					-0.5%
				</button>
				<button
					type="button"
					class="rate-step-btn rate-step-dec"
					onclick={() => adjustTasa(RateStepDelta.DecreaseQuarter)}
					title="Restar 0.25% tasa"
					aria-label="Restar 0.25% tasa de {inversion.nombre}"
				>
					-0.25%
				</button>
				<button
					type="button"
					class="rate-step-btn rate-step-inc"
					onclick={() => adjustTasa(RateStepDelta.IncreaseQuarter)}
					title="Sumar 0.25% tasa"
					aria-label="Sumar 0.25% tasa a {inversion.nombre}"
				>
					+0.25%
				</button>
				<button
					type="button"
					class="rate-step-btn rate-step-inc"
					onclick={() => adjustTasa(RateStepDelta.IncreaseHalf)}
					title="Sumar 0.50% tasa"
					aria-label="Sumar 0.50% tasa a {inversion.nombre}"
				>
					+0.5%
				</button>
			</div>
		</div>

		<div class="card-metrics">
			<div class="metric-block">
				<span class="metric-label">Saldo Proyectado</span>
				<span class="metric-value balance-value" title={formatCurrency(summary?.balanceFinal ?? 0)}>
					{formatCurrency(summary?.balanceFinal ?? 0)}
				</span>
			</div>

			<div class="metric-block">
				<span class="metric-label">Ganancia Neta</span>
				<span class="metric-value yield-value" title={`+${formatCurrency(summary?.rendimientoNeto ?? 0)}`}>
					+{formatCurrency(summary?.rendimientoNeto ?? 0)}
				</span>
			</div>
		</div>
	</Paper>
</div>

<style>
	.scenario-card-wrapper {
		position: relative;
		border-radius: 16px;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}

	.scenario-card-wrapper:hover {
		transform: translateY(-2px);
	}

	:global(.scenario-paper) {
		border-radius: 16px !important;
		padding: 18px !important;
		background: #ffffff !important;
		border: 1px solid #d5dedc !important;
		position: relative;
	}

	.is-leader-card :global(.scenario-paper) {
		border: 2px solid #004851 !important;
		box-shadow: 0 8px 20px -4px rgba(0, 72, 81, 0.25) !important;
	}

	.leader-ribbon {
		position: absolute;
		top: -12px;
		right: 16px;
		background: #f6e7c3;
		color: #4a3500;
		font-size: 0.6875rem;
		font-weight: 700;
		padding: 3px 10px;
		border-radius: 9999px;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		letter-spacing: 0.03em;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.ribbon-star {
		font-size: 0.8125rem;
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 12px;
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
	}

	.color-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.color-emerald { background: #10b981; }
	.color-blue { background: #2563eb; }
	.color-cyan { background: #06b6d4; }
	.color-amber { background: #f59e0b; }
	.color-purple { background: #8b5cf6; }
	.color-rose { background: #f43f5e; }
	.color-teal { background: #004851; }
	.color-indigo { background: #6366f1; }

	.scenario-name-input {
		border: none;
		background: transparent;
		font-size: 0.9375rem;
		font-weight: 700;
		color: #14201f;
		outline: none;
		padding: 2px 4px;
		border-radius: 4px;
		width: 100%;
	}

	.scenario-name-input:focus {
		background: #f6f8fb;
	}

	.delete-btn {
		appearance: none;
		border: none;
		background: transparent;
		color: #8b9998;
		cursor: pointer;
		font-size: 0.875rem;
		padding: 4px 6px;
		border-radius: 6px;
		transition: color 0.15s ease;
	}

	.delete-btn:hover {
		color: #b42318;
		background: #fee2e2;
	}

	.rate-input-section {
		background: #f6f8fb;
		padding: 10px 12px;
		border-radius: 10px;
		margin-bottom: 14px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.rate-input-main-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}

	.rate-micro-steppers {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 5px;
		width: 100%;
	}

	.rate-step-btn {
		appearance: none;
		border: 1px solid #d5dedc;
		background: #ffffff;
		color: #14201f;
		font-size: 0.75rem;
		font-weight: 700;
		padding: 6px 2px;
		min-height: 36px;
		border-radius: 7px;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s cubic-bezier(0.2, 0, 0, 1);
		user-select: none;
		touch-action: manipulation;
	}

	.rate-step-btn:hover {
		border-color: #004851;
		color: #004851;
		background: rgba(0, 72, 81, 0.05);
	}

	.rate-step-btn:active {
		transform: scale(0.94);
		background: rgba(0, 72, 81, 0.1);
	}

	.rate-step-inc {
		color: #004851;
		font-weight: 800;
	}

	.rate-step-inc:hover {
		border-color: #10b981;
		color: #059669;
		background: rgba(16, 185, 129, 0.08);
	}

	:global(html.dark) .rate-step-btn,
	:global(.dark) .rate-step-btn {
		background: #1e293b;
		border-color: #334155;
		color: #e2e8f0;
	}

	:global(html.dark) .rate-step-btn:hover,
	:global(.dark) .rate-step-btn:hover {
		border-color: #7fd1d8;
		color: #7fd1d8;
		background: rgba(127, 209, 216, 0.1);
	}

	:global(html.dark) .rate-step-inc,
	:global(.dark) .rate-step-inc {
		color: #34d399;
	}

	:global(html.dark) .rate-step-inc:hover,
	:global(.dark) .rate-step-inc:hover {
		border-color: #34d399;
		background: rgba(52, 211, 153, 0.12);
	}

	.rate-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #4f5d5c;
	}

	.rate-input-wrapper {
		display: inline-flex;
		align-items: center;
		background: #ffffff;
		border: 1px solid #d5dedc;
		border-radius: 6px;
		padding: 2px 8px;
	}

	.rate-input {
		width: 60px;
		border: none;
		background: transparent;
		font-size: 0.9375rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: #004851;
		text-align: right;
		outline: none;
	}

	.rate-suffix {
		font-size: 0.8125rem;
		font-weight: 700;
		color: #004851;
		margin-left: 2px;
	}

	.card-metrics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
		gap: 8px 12px;
		border-top: 1px solid #edf2f0;
		padding-top: 10px;
		width: 100%;
		box-sizing: border-box;
	}

	.metric-block {
		display: flex;
		flex-direction: column;
		min-width: 0;
		overflow: hidden;
	}

	.metric-label {
		font-size: 0.6875rem;
		color: #5e6b6a;
		font-weight: 500;
		margin-bottom: 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.metric-value {
		font-size: clamp(0.8125rem, 1.2vw, 0.9375rem);
		font-weight: 800;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.025em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.25;
	}

	.balance-value {
		color: #14201f;
	}

	.yield-value {
		color: #0b7a4b;
	}

	:global(.dark) :global(.scenario-paper) {
		background: #131c30 !important;
		border-color: #26334e !important;
	}

	:global(.dark) .is-leader-card :global(.scenario-paper) {
		border-color: #7fd1d8 !important;
		box-shadow: 0 8px 20px -4px rgba(127, 209, 216, 0.25) !important;
	}

	:global(.dark) .scenario-name-input {
		color: #e7eef8;
	}

	:global(.dark) .scenario-name-input:focus {
		background: #0b1120;
	}

	:global(.dark) .rate-input-section {
		background: #0b1120;
	}

	:global(.dark) .rate-label {
		color: #a3b0c6;
	}

	:global(.dark) .rate-input-wrapper {
		background: #131c30;
		border-color: #26334e;
	}

	:global(.dark) .rate-input,
	:global(.dark) .rate-suffix {
		color: #7fd1d8;
	}

	:global(.dark) .card-metrics {
		border-top-color: #1e293b;
	}

	:global(.dark) .metric-label {
		color: #a3b0c6;
	}

	:global(.dark) .balance-value {
		color: #e7eef8;
	}

	:global(.dark) .yield-value {
		color: #86efac;
	}
</style>
