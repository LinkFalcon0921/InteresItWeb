<script lang="ts">
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import {
		formatCurrency,
		formatPercentage
	} from '../formatters/financialFormatters';

	interface Props {
		state: SimulatorState;
	}

	let { state: simState }: Props = $props();

	const lider = $derived(simState.escenarioLider);
	const simulation = $derived(simState.simulationResult);

	let isPulsing = $state(false);
	let previousBalance = $state<number | null>(null);

	$effect(() => {
		const current = lider?.summary.balanceFinal;
		if (current !== undefined && previousBalance !== null && current !== previousBalance) {
			isPulsing = true;
			const timer = setTimeout(() => {
				isPulsing = false;
			}, 450);
			return () => clearTimeout(timer);
		}
		previousBalance = current ?? null;
	});
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
				onclick={() => simState.setHorizonMonths(3)}
				title="3 meses desde fecha inicial"
			>
				3 m
			</button>
			<button
				type="button"
				class="horizon-pill"
				onclick={() => simState.setHorizonMonths(6)}
				title="6 meses desde fecha inicial"
			>
				6 m
			</button>
			<button
				type="button"
				class="horizon-pill"
				onclick={() => simState.setHorizonMonths(12)}
				title="1 año desde fecha inicial"
			>
				1 año
			</button>
		</div>
	</div>

	<div class="hero-body">
		<div class="balance-display" class:m3-expressive-pulsing={isPulsing}>
			<span class="balance-label">Saldo Proyectado al Vencimiento</span>
			<h2 class="balance-amount">{formatCurrency(lider?.summary.balanceFinal ?? 0)}</h2>
			{#if simState.tasaInflacion > 0 && lider?.summary.balanceReal !== undefined}
				<div class="real-balance-subtext" title="Poder adquisitivo deflactado según la fórmula de Fisher con inflación de {simState.tasaInflacion}%">
					<span>Poder adquisitivo real:</span>
					<strong class="real-balance-val">{formatCurrency(lider.summary.balanceReal)}</strong>
					<span class="real-rate-tag">(Tasa real: {formatPercentage(lider.summary.tasaRealAnual ?? 0)})</span>
				</div>
			{/if}
		</div>

		<div class="yield-badge" class:m3-yield-pulsing={isPulsing}>
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
		{#if (simulation?.totalExtraordinario ?? 0) > 0}
			<div class="footer-divider">•</div>
			<div class="footer-stat">
				<span class="stat-label">Extraordinarios:</span>
				<span class="stat-value">{formatCurrency(simulation?.totalExtraordinario ?? 0)}</span>
			</div>
		{/if}
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
		gap: 8px;
		background: rgba(255, 255, 255, 0.12);
		padding: 6px 14px;
		min-height: 36px;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	.badge-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #d7ebec;
		box-shadow: 0 0 6px #d7ebec;
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
		padding: 6px 14px;
		min-height: 36px;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
	}

	.horizon-pill:hover {
		background: rgba(255, 255, 255, 0.22);
		border-color: #ffffff;
		transform: translateY(-1px);
	}

	.horizon-pill:active {
		transform: scale(0.95);
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
		font-size: clamp(1.5rem, 4vw, 2.75rem);
		overflow-wrap: anywhere;
		font-weight: 800;
		letter-spacing: -0.03em;
		font-variant-numeric: tabular-nums;
		line-height: 1.05;
		transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), text-shadow 0.3s ease;
		transform-origin: left center;
	}

	.m3-expressive-pulsing .balance-amount {
		animation: m3-value-spring 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
		text-shadow: 0 0 16px rgba(127, 209, 216, 0.7);
	}

	.real-balance-subtext {
		margin-top: 6px;
		font-size: 0.8125rem;
		color: #a8dadc;
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}

	.real-balance-val {
		color: #ffffff;
		font-weight: 700;
	}

	.real-rate-tag {
		font-size: 0.75rem;
		opacity: 0.85;
	}

	.yield-badge {
		max-width: 100%;
		box-sizing: border-box;
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
		transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
	}

	.yield-badge.m3-yield-pulsing {
		transform: scale(1.06);
		box-shadow: 0 4px 12px rgba(246, 231, 195, 0.4);
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

	@keyframes m3-value-spring {
		0% {
			transform: scale(1);
		}
		40% {
			transform: scale(1.035);
		}
		100% {
			transform: scale(1);
		}
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
