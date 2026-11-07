<script lang="ts">
	import Switch from '@smui/switch';
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import QuickChips from './QuickChips.svelte';

	interface Props {
		state: SimulatorState;
	}

	let { state }: Props = $props();

	function handleMontoInput(event: Event): void {
		const target = event.target as HTMLInputElement | null;
		if (!target) return;
		const val = parseFloat(target.value);
		state.montoInicial = Number.isFinite(val) ? Math.max(0, val) : 0;
	}

	function handleAporteInput(event: Event): void {
		const target = event.target as HTMLInputElement | null;
		if (!target) return;
		const val = parseFloat(target.value);
		state.aporteMensual = Number.isFinite(val) ? Math.max(0, val) : 0;
	}

	function handleDiaCorteInput(event: Event): void {
		const target = event.target as HTMLInputElement | null;
		if (!target) return;
		const val = parseInt(target.value, 10);
		if (Number.isFinite(val)) {
			state.diaCorte = Math.min(31, Math.max(1, val));
		}
	}
</script>

<div class="data-entry-panel">
	<h3 class="panel-title">Parámetros de Inversión</h3>

	<!-- Capital Inicial -->
	<div class="field-group">
		<label class="field-label" for="monto-inicial-input">
			<span>Capital Inicial ($P$)</span>
			<span class="field-currency">RD$</span>
		</label>
		<input
			id="monto-inicial-input"
			type="number"
			class="terminal-input"
			min="0"
			step="any"
			value={state.montoInicial}
			oninput={handleMontoInput}
		/>
		<QuickChips onAdjust={(d) => state.adjustMontoInicial(d)} />
	</div>

	<!-- Aporte Mensual -->
	<div class="field-group">
		<label class="field-label" for="aporte-mensual-input">
			<span>Aporte Recurrente ($PMT$)</span>
			<span class="field-currency">RD$</span>
		</label>
		<input
			id="aporte-mensual-input"
			type="number"
			class="terminal-input"
			min="0"
			step="any"
			value={state.aporteMensual}
			oninput={handleAporteInput}
		/>
		<QuickChips onAdjust={(d) => state.adjustAporteMensual(d)} />
	</div>

	<!-- Horizonte de Fechas -->
	<div class="dates-grid">
		<div class="field-group">
			<label class="field-label" for="fecha-inicio-input">Desde</label>
			<input
				id="fecha-inicio-input"
				type="date"
				class="terminal-input date-input"
				bind:value={state.fechaInicio}
			/>
		</div>

		<div class="field-group">
			<label class="field-label" for="fecha-fin-input">Hasta</label>
			<input
				id="fecha-fin-input"
				type="date"
				class="terminal-input date-input"
				bind:value={state.fechaFin}
			/>
		</div>
	</div>

	<!-- Día de Corte Mensual -->
	<div class="field-group">
		<label class="field-label" for="dia-corte-input">
			<span>Día de Corte Mensual</span>
			<span class="field-helper">1 al 31</span>
		</label>
		<input
			id="dia-corte-input"
			type="number"
			class="terminal-input"
			min="1"
			max="31"
			value={state.diaCorte}
			oninput={handleDiaCorteInput}
		/>
	</div>

	<!-- Switches de Reglas Bancarias y Fiscales -->
	<div class="switches-section">
		<div class="switch-row">
			<div class="switch-info">
				<span class="switch-title">Omitir 1º corte parcial</span>
				<span class="switch-desc">Si el 1º ciclo no completa el mes</span>
			</div>
			<Switch bind:checked={state.omitirPrimerCorte} />
		</div>

		<div class="switch-row">
			<div class="switch-info">
				<span class="switch-title">Retención Fiscal (10% RD)</span>
				<span class="switch-desc">Deducción de ley sobre intereses</span>
			</div>
			<Switch bind:checked={state.aplicarImpuesto} />
		</div>
	</div>
</div>

<style>
	.data-entry-panel {
		background: #ffffff;
		border: 1px solid #d5dedc;
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
	}

	.panel-title {
		margin: 0 0 16px 0;
		font-size: 1rem;
		font-weight: 700;
		color: #14201f;
		letter-spacing: -0.01em;
		border-bottom: 2px solid #004851;
		padding-bottom: 8px;
	}

	.field-group {
		margin-bottom: 16px;
	}

	.field-label {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		font-weight: 600;
		color: #4f5d5c;
		margin-bottom: 6px;
		letter-spacing: 0.02em;
	}

	.field-currency,
	.field-helper {
		font-size: 0.6875rem;
		color: #5e6b6a;
		font-weight: 500;
	}

	.terminal-input {
		width: 100%;
		box-sizing: border-box;
		background: #f6f8fb;
		border: 1px solid #d5dedc;
		border-radius: 8px;
		padding: 10px 12px;
		font-size: 0.9375rem;
		font-weight: 600;
		color: #14201f;
		font-variant-numeric: tabular-nums;
		outline: none;
		transition: border-color 0.15s ease;
	}

	.terminal-input:focus {
		border-color: #004851;
		background: #ffffff;
		box-shadow: 0 0 0 3px rgba(0, 72, 81, 0.12);
	}

	.dates-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.switches-section {
		border-top: 1px solid #edf2f0;
		padding-top: 14px;
		margin-top: 8px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.switch-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.switch-info {
		display: flex;
		flex-direction: column;
	}

	.switch-title {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #14201f;
	}

	.switch-desc {
		font-size: 0.6875rem;
		color: #5e6b6a;
	}

	:global(.dark) .data-entry-panel {
		background: #131c30;
		border-color: #26334e;
	}

	:global(.dark) .panel-title {
		color: #e7eef8;
		border-bottom-color: #7fd1d8;
	}

	:global(.dark) .field-label {
		color: #a3b0c6;
	}

	:global(.dark) .field-currency,
	:global(.dark) .field-helper {
		color: #7fd1d8;
	}

	:global(.dark) .terminal-input {
		background: #0b1120;
		border-color: #26334e;
		color: #e7eef8;
	}

	:global(.dark) .terminal-input:focus {
		border-color: #7fd1d8;
		box-shadow: 0 0 0 3px rgba(127, 209, 216, 0.2);
	}

	:global(.dark) .switches-section {
		border-top-color: #1e293b;
	}

	:global(.dark) .switch-title {
		color: #e7eef8;
	}

	:global(.dark) .switch-desc {
		color: #a3b0c6;
	}
</style>
