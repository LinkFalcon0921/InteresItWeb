<script lang="ts">
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import {
		formatCurrency,
		formatPercentage
	} from '../formatters/financialFormatters';

	interface Props {
		state: SimulatorState;
	}

	let { state }: Props = $props();

	const lider = $derived(state.escenarioLider);
	const simulation = $derived(state.simulationResult);
</script>

<div class="hero-card">
	<div class="hero-header">
		<div class="hero-badge">
			<span class="badge-dot"></span>
			<span>Líder: {lider?.setting.nombre ?? 'Sin datos'} ({formatPercentage(lider?.setting.tasaAnual ?? 0)})</span>
		</div>

		<div class="horizon-pills" role="group" aria-label="Selección rápida de horizonte">
			<button
				type="button"
				class="horizon-pill"
				onclick={() => state.setHorizonMonths(3)}
				title="3 meses desde fecha inicial"
			>
				3 m
			</button>
			<button
				type="button"
				class="horizon-pill"
				onclick={() => state.setHorizonMonths(6)}
				title="6 meses desde fecha inicial"
			>
				6 m
			</button>
			<button
				type="button"
				class="horizon-pill"
				onclick={() => state.setHorizonMonths(12)}
				title="1 año desde fecha inicial"
			>
				1 año
			</button>
		</div>
	</div>

	<div class="hero-body">
		<div class="balance-display">
			<span class="balance-label">Saldo Proyectado al Vencimiento</span>
			<h2 class="balance-amount">{formatCurrency(lider?.summary.balanceFinal ?? 0)}</h2>
		</div>

		<div class="yield-badge">
			<span class="yield-icon">↗</span>
			<span class="yield-value">+{formatCurrency(lider?.summary.rendimientoNeto ?? 0)}</span>
			<span class="yield-label">ganancia neta</span>
		</div>
	</div>

	<div class="hero-footer">
		<div class="footer-stat">
			<span class="stat-label">Capital Inicial:</span>
			<span class="stat-value">{formatCurrency(simulation?.capitalInicial ?? 0)}</span>
		</div>
		<div class="footer-divider">•</div>
		<div class="footer-stat">
			<span class="stat-label">Aportes Recurrentes:</span>
			<span class="stat-value">{formatCurrency(simulation?.totalAportado ?? 0)}</span>
		</div>
		<div class="footer-divider">•</div>
		<div class="footer-stat">
			<span class="stat-label">Total Invertido:</span>
			<span class="stat-value">{formatCurrency(simulation?.totalInvertido ?? 0)}</span>
		</div>
	</div>
</div>

<style>
	.hero-card {
		background: #004851;
		color: #ffffff;
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 10px 25px -5px rgba(0, 72, 81, 0.35);
		margin-bottom: 20px;
		position: relative;
		overflow: hidden;
	}

	.hero-card::after {
		content: '';
		position: absolute;
		right: -50px;
		top: -50px;
		width: 200px;
		height: 200px;
		background: radial-gradient(circle, rgba(215, 235, 236, 0.15) 0%, transparent 70%);
		border-radius: 50%;
		pointer-events: none;
	}

	.hero-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 12px;
		margin-bottom: 16px;
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: rgba(255, 255, 255, 0.12);
		padding: 4px 12px;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	.badge-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #f6e7c3;
	}

	.horizon-pills {
		display: flex;
		gap: 6px;
	}

	.horizon-pill {
		appearance: none;
		border: 1px solid rgba(255, 255, 255, 0.25);
		background: rgba(255, 255, 255, 0.08);
		color: #ffffff;
		border-radius: 9999px;
		padding: 4px 10px;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.horizon-pill:hover {
		background: rgba(255, 255, 255, 0.22);
		border-color: #ffffff;
	}

	.hero-body {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 16px;
		margin-bottom: 16px;
	}

	.balance-label {
		display: block;
		font-size: 0.8125rem;
		color: #d7ebec;
		font-weight: 500;
		margin-bottom: 4px;
	}

	.balance-amount {
		margin: 0;
		font-size: 2.75rem;
		font-weight: 800;
		letter-spacing: -0.03em;
		font-variant-numeric: tabular-nums;
		line-height: 1.05;
	}

	.yield-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: #f6e7c3;
		color: #4a3500;
		padding: 6px 14px;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.yield-icon {
		font-size: 1.1rem;
		font-weight: 900;
	}

	.yield-label {
		font-size: 0.75rem;
		font-weight: 600;
		opacity: 0.9;
	}

	.hero-footer {
		border-top: 1px solid rgba(255, 255, 255, 0.15);
		padding-top: 14px;
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
		font-size: 0.8125rem;
	}

	.footer-stat {
		display: inline-flex;
		gap: 6px;
	}

	.stat-label {
		color: #d7ebec;
	}

	.stat-value {
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.footer-divider {
		opacity: 0.4;
	}

	@media (max-width: 640px) {
		.balance-amount {
			font-size: 2.15rem;
		}

		.hero-card {
			padding: 18px;
		}

		.hero-footer {
			font-size: 0.75rem;
			gap: 8px;
		}
	}
</style>
