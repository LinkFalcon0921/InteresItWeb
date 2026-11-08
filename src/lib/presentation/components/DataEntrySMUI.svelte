<script lang="ts">
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import QuickChips from './QuickChips.svelte';
	import AportesExtraordinariosSMUI from './AportesExtraordinariosSMUI.svelte';
	import M3WheelSwitch from './M3WheelSwitch.svelte';

	interface Props {
		state: SimulatorState;
	}

	let { state }: Props = $props();

	function handleMontoInput(event: Event): void {
		if (!(event.target instanceof HTMLInputElement)) return;
		const target = event.target;
		const val = parseFloat(target.value);
		state.montoInicial = Number.isFinite(val) ? Math.max(0, val) : 0;
	}

	function handleAporteInput(event: Event): void {
		if (!(event.target instanceof HTMLInputElement)) return;
		const target = event.target;
		const val = parseFloat(target.value);
		state.aporteMensual = Number.isFinite(val) ? Math.max(0, val) : 0;
	}

	function handleDiaCorteInput(event: Event): void {
		if (!(event.target instanceof HTMLInputElement)) return;
		const target = event.target;
		const val = parseInt(target.value, 10);
		if (Number.isFinite(val)) {
			state.diaCorte = Math.min(31, Math.max(1, val));
		}
	}

	function handleInflacionInput(event: Event): void {
		if (!(event.target instanceof HTMLInputElement)) return;
		const target = event.target;
		const val = parseFloat(target.value);
		state.tasaInflacion = Number.isFinite(val) ? Math.min(100, Math.max(0, val)) : 0;
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

	<!-- Inflación Estimada (Fisher) -->
	<div class="field-group">
		<label class="field-label" for="tasa-inflacion-input">
			<span>Inflación Anual Estimada (Fisher)</span>
			<span class="field-helper">% anual</span>
		</label>
		<input
			id="tasa-inflacion-input"
			type="number"
			class="terminal-input"
			min="0"
			max="100"
			step="0.1"
			placeholder="0.0"
			value={state.tasaInflacion}
			oninput={handleInflacionInput}
		/>
	</div>

	<!-- Reglas Bancarias y Fiscales con M3 Wheel Switch -->
	<div class="switches-section">
		<div class="switch-row">
			<div class="switch-info">
				<span class="switch-title">1º corte parcial</span>
				<span class="switch-desc">Si el 1º ciclo no completa el mes</span>
			</div>
			<M3WheelSwitch
				bind:checked={state.omitirPrimerCorte}
				offLabel="Normal"
				onLabel="Omitir"
				id="switch-omitir-primer-corte"
				ariaLabel="Omitir primer corte parcial si no completa el mes"
			/>
		</div>

		<div class="switch-row">
			<div class="switch-info">
				<span class="switch-title">Retención Fiscal</span>
				<span class="switch-desc">Deducción 10% ley República Dominicana</span>
			</div>
			<M3WheelSwitch
				bind:checked={state.aplicarImpuesto}
				offLabel="Exento (0%)"
				onLabel="10% RD"
				id="switch-aplicar-impuesto"
				ariaLabel="Aplicar retención fiscal del 10% ley República Dominicana"
			/>
		</div>
	</div>

	<!-- Aportes Extraordinarios Programados -->
	<AportesExtraordinariosSMUI {state} />
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
		border-radius: 10px;
		padding: 10px 14px;
		font-size: 0.9375rem;
		font-weight: 600;
		color: #14201f;
		font-variant-numeric: tabular-nums;
		outline: none;
		transition: border-color 0.2s cubic-bezier(0.2, 0, 0, 1),
			box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1),
			background-color 0.2s ease;
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
		gap: 12px;
	}

	.switch-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 6px 0;
	}

	.switch-info {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	.switch-title {
		font-size: 0.8125rem;
		font-weight: 700;
		color: #14201f;
		line-height: 1.25;
	}

	.switch-desc {
		font-size: 0.6875rem;
		color: #5e6b6a;
		margin-top: 2px;
	}

	:global(html.dark) .data-entry-panel,
	:global(.dark) .data-entry-panel {
		background: #131c30;
		border-color: #26334e;
	}

	:global(html.dark) .panel-title,
	:global(.dark) .panel-title {
		color: #e7eef8;
		border-bottom-color: #10b981;
	}

	:global(html.dark) .field-label,
	:global(.dark) .field-label {
		color: #a3b0c6;
	}

	:global(html.dark) .field-currency,
	:global(html.dark) .field-helper,
	:global(.dark) .field-currency,
	:global(.dark) .field-helper {
		color: #10b981;
	}

	:global(html.dark) .terminal-input,
	:global(.dark) .terminal-input {
		background: #0b1120;
		border-color: #26334e;
		color: #e7eef8;
	}

	:global(html.dark) .terminal-input:focus,
	:global(.dark) .terminal-input:focus {
		border-color: #10b981;
		box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
	}

	:global(html.dark) .switches-section,
	:global(.dark) .switches-section {
		border-top-color: #1e293b;
	}

	:global(html.dark) .switch-title,
	:global(.dark) .switch-title {
		color: #e7eef8;
	}

	:global(html.dark) .switch-desc,
	:global(.dark) .switch-desc {
		color: #a3b0c6;
	}

	/* Adaptación fluida cuando se monta dentro del Drawer móvil: elimina anidamiento de tarjetas dobles */
	:global(.parameters-drawer) .data-entry-panel {
		background: transparent !important;
		border: none !important;
		border-radius: 0 !important;
		padding: 0 !important;
		box-shadow: none !important;
	}

	:global(.parameters-drawer) .panel-title {
		display: none !important;
	}
</style>
