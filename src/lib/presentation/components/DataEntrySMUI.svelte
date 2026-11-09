<script lang="ts">
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import QuickChips from './QuickChips.svelte';
	import CalendarHorizonSMUI from './CalendarHorizonSMUI.svelte';
	import AportesExtraordinariosSMUI from './AportesExtraordinariosSMUI.svelte';
	import M3WheelSwitch from './M3WheelSwitch.svelte';
	import M3TaxCarousel from './M3TaxCarousel.svelte';

	interface Props {
		state: SimulatorState;
	}

	let { state: simState }: Props = $props();

	function handleMontoInput(event: Event): void {
		if (!(event.target instanceof HTMLInputElement)) return;
		const target = event.target;
		const val = parseFloat(target.value);
		simState.montoInicial = Number.isFinite(val) ? Math.max(0, val) : 0;
	}

	function handleAporteInput(event: Event): void {
		if (!(event.target instanceof HTMLInputElement)) return;
		const target = event.target;
		const val = parseFloat(target.value);
		simState.aporteMensual = Number.isFinite(val) ? Math.max(0, val) : 0;
	}

	function handleDiaCorteInput(event: Event): void {
		if (!(event.target instanceof HTMLInputElement)) return;
		const target = event.target;
		const val = parseInt(target.value, 10);
		if (Number.isFinite(val)) {
			simState.diaCorte = Math.min(31, Math.max(1, val));
		}
	}

	function handleInflacionInput(event: Event): void {
		if (!(event.target instanceof HTMLInputElement)) return;
		const target = event.target;
		const val = parseFloat(target.value);
		simState.tasaInflacion = Number.isFinite(val) ? Math.min(100, Math.max(0, val)) : 0;
	}

	const CORTES_COMUNES = [15, 25, 28, 30, 31] as const;
	const INFLACION_PRESETS = [
		{ label: '0% (Nominal)', val: 0 },
		{ label: '4% (Meta BC)', val: 4.0 },
		{ label: '6.5%', val: 6.5 },
		{ label: '10%', val: 10.0 }
	] as const;
</script>

<div class="data-entry-panel">
	<div class="panel-header">
		<div class="panel-title-group">
			<svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
			</svg>
			<h3 class="panel-title">Parámetros de Inversión</h3>
		</div>
		<span class="panel-badge">M3 Expressive</span>
	</div>

	<!-- Capital Inicial (P) -->
	<div class="field-group">
		<label class="field-label" for="monto-inicial-input">
			<span>Capital Inicial ($P$)</span>
			<span class="field-currency">Moneda: RD$</span>
		</label>
		<div class="m3-outlined-input">
			<span class="m3-input-prefix">RD$</span>
			<input
				id="monto-inicial-input"
				type="number"
				class="m3-native-input"
				min="0"
				step="any"
				placeholder="0.00"
				value={simState.montoInicial}
				oninput={handleMontoInput}
			/>
		</div>
		<span class="field-helper-text">Monto inicial base para capitalización de intereses</span>
		<QuickChips onAdjust={(d) => simState.adjustMontoInicial(d)} />
	</div>

	<!-- Aporte Mensual (PMT) -->
	<div class="field-group">
		<label class="field-label" for="aporte-mensual-input">
			<span>Aporte Recurrente ($PMT$)</span>
			<span class="field-currency">Moneda: RD$</span>
		</label>
		<div class="m3-outlined-input">
			<span class="m3-input-prefix">RD$</span>
			<input
				id="aporte-mensual-input"
				type="number"
				class="m3-native-input"
				min="0"
				step="any"
				placeholder="0.00"
				value={simState.aporteMensual}
				oninput={handleAporteInput}
			/>
		</div>
		<span class="field-helper-text">Depósito sistemático al corte de cada ciclo mensual</span>
		<QuickChips onAdjust={(d) => simState.adjustAporteMensual(d)} />
	</div>

	<!-- Horizonte de Fechas (Calendario M3) -->
	<CalendarHorizonSMUI state={simState} />

	<!-- Día de Corte Mensual -->
	<div class="field-group">
		<label class="field-label" for="dia-corte-input">
			<span>Día de Corte Mensual</span>
			<span class="field-currency">1 al 31</span>
		</label>
		<div class="m3-outlined-input">
			<svg class="m3-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
				<line x1="16" y1="2" x2="16" y2="6"></line>
				<line x1="8" y1="2" x2="8" y2="6"></line>
				<line x1="3" y1="10" x2="21" y2="10"></line>
			</svg>
			<input
				id="dia-corte-input"
				type="number"
				class="m3-native-input"
				min="1"
				max="31"
				value={simState.diaCorte}
				oninput={handleDiaCorteInput}
			/>
			<span class="m3-input-suffix">de cada mes</span>
		</div>
		<span class="field-helper-text">Fecha mensual en que la entidad liquida y capitaliza</span>
		<div class="mini-presets-row" role="group" aria-label="Días de corte frecuentes">
			{#each CORTES_COMUNES as dia (dia)}
				{@const isSelected = simState.diaCorte === dia}
				<button
					type="button"
					class="mini-preset-chip {isSelected ? 'active' : ''}"
					onclick={() => (simState.diaCorte = dia)}
					aria-label="Corte día {dia}"
					aria-pressed={isSelected}
				>
					Día {dia}
				</button>
			{/each}
		</div>
	</div>

	<!-- Inflación Estimada (Fisher) -->
	<div class="field-group">
		<label class="field-label" for="tasa-inflacion-input">
			<span>Inflación Anual Estimada (Fisher)</span>
			<span class="field-currency">% anual</span>
		</label>
		<div class="m3-outlined-input">
			<svg class="m3-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
				<polyline points="17 6 23 6 23 12"></polyline>
			</svg>
			<input
				id="tasa-inflacion-input"
				type="number"
				class="m3-native-input"
				min="0"
				max="100"
				step="0.1"
				placeholder="0.0"
				value={simState.tasaInflacion}
				oninput={handleInflacionInput}
			/>
			<span class="m3-input-suffix">%</span>
		</div>
		<span class="field-helper-text">Ecuación de Fisher: deflacta para valor adquisitivo real</span>
		<div class="mini-presets-row" role="group" aria-label="Metas de inflación predefinidas">
			{#each INFLACION_PRESETS as preset (preset.val)}
				{@const isSelected = simState.tasaInflacion === preset.val}
				<button
					type="button"
					class="mini-preset-chip {isSelected ? 'active' : ''}"
					onclick={() => (simState.tasaInflacion = preset.val)}
					aria-label="Inflación {preset.label}"
					aria-pressed={isSelected}
				>
					{preset.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Reglas Bancarias y Fiscales con M3 Wheel Switch y M3TaxCarousel -->
	<div class="switches-section">
		<div class="rule-card">
			<div class="switch-row">
				<div class="switch-info">
					<span class="switch-title">1º corte parcial</span>
					<span class="switch-desc">Si el 1º ciclo no completa el mes</span>
				</div>
				<M3WheelSwitch
					bind:checked={simState.omitirPrimerCorte}
					offLabel="Normal"
					onLabel="Omitir"
					id="switch-omitir-primer-corte"
					ariaLabel="Omitir primer corte parcial si no completa el mes"
				/>
			</div>

			{#if simState.omitirPrimerCorte}
				<div class="omit-info-banner" role="status" aria-live="polite">
					<svg class="omit-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="12" y1="16" x2="12" y2="12"></line>
						<line x1="12" y1="8" x2="12.01" y2="8"></line>
					</svg>
					<span class="omit-info-text">
						<strong>1º corte omitido:</strong> Si los días iniciales no completan un mes entero, el primer período capitaliza sin generar intereses (RD$0.00).
					</span>
				</div>
			{/if}
		</div>

		<!-- Control Carrusel de Retención Fiscal M3 Responsive -->
		<div class="rule-card rule-card--tax">
			<M3TaxCarousel
				bind:checked={simState.aplicarImpuesto}
			/>
		</div>
	</div>

	<!-- Aportes Extraordinarios Programados -->
	<AportesExtraordinariosSMUI state={simState} />
</div>

<style>
	.data-entry-panel {
		background: #ffffff;
		border: 1px solid #d5dedc;
		border-radius: 16px;
		padding: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
	}
	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0 0 14px 0;
		border-bottom: 2px solid #004851;
		padding-bottom: 8px;
	}
	.panel-title-group { display: flex; align-items: center; gap: 8px; }
	.panel-icon { width: 18px; height: 18px; color: #004851; flex-shrink: 0; }
	.panel-title { margin: 0; font-size: 0.9375rem; font-weight: 700; color: #14201f; }
	.panel-badge {
		font-size: 0.625rem;
		font-weight: 700;
		padding: 2px 7px;
		border-radius: 9999px;
		background: #e6f4ea;
		color: #047857;
		text-transform: uppercase;
	}
	.field-group { margin-bottom: 14px; }
	.field-label {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		font-weight: 600;
		color: #4f5d5c;
		margin-bottom: 5px;
	}
	.field-currency { font-size: 0.6875rem; color: #5e6b6a; font-weight: 500; }
	.m3-outlined-input {
		display: flex;
		align-items: center;
		background: #f8fafc;
		border: 1.5px solid #d5dedc;
		border-radius: 10px;
		padding: 0 12px;
		min-height: 40px;
		box-sizing: border-box;
		transition: all 0.15s ease;
	}
	.m3-outlined-input:hover { border-color: #004851; background: #ffffff; transform: translateY(-1px); }
	.m3-outlined-input:focus-within { border-color: #004851; background: #ffffff; box-shadow: 0 0 0 3px rgba(0, 72, 81, 0.15); }
	.m3-input-prefix { font-size: 0.8125rem; font-weight: 700; color: #004851; margin-right: 6px; user-select: none; }
	.m3-input-suffix { font-size: 0.75rem; font-weight: 600; color: #64748b; margin-left: 6px; user-select: none; }
	.m3-input-icon { width: 16px; height: 16px; color: #64748b; margin-right: 6px; flex-shrink: 0; }
	.m3-outlined-input:hover .m3-input-icon, .m3-outlined-input:focus-within .m3-input-icon { color: #004851; }
	.m3-native-input {
		flex: 1;
		width: 100%;
		border: none;
		outline: none;
		background: transparent;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 600;
		color: #14201f;
		font-variant-numeric: tabular-nums;
		padding: 8px 0;
	}
	.field-helper-text { display: block; font-size: 0.6875rem; color: #64748b; margin-top: 3px; }
	.mini-presets-row { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px; }
	.mini-preset-chip {
		appearance: none;
		border: 1px solid #d5dedc;
		background: #ffffff;
		color: #475569;
		font-family: inherit;
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 9999px;
		cursor: pointer;
		min-height: 24px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}
	.mini-preset-chip:hover { border-color: #004851; color: #004851; background: #f1f5f9; transform: translateY(-1px); }
	.mini-preset-chip.active { background: #004851 !important; border-color: #004851 !important; color: #ffffff !important; }
	.switches-section {
		border-top: 1px solid #edf2f0;
		padding-top: 14px;
		margin-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.rule-card {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 10px 12px;
		transition: all 0.2s ease;
	}
	.rule-card--tax {
		padding: 6px 12px;
	}
	.switch-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 10px;
	}
	.switch-info {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 130px;
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
	.omit-info-banner {
		margin-top: 8px;
		background: #ecfdf5;
		border: 1px solid #a7f3d0;
		border-radius: 8px;
		padding: 8px 10px;
		display: flex;
		align-items: flex-start;
		gap: 8px;
		animation: m3-slide-fade 0.25s cubic-bezier(0.2, 0, 0, 1) both;
	}
	.omit-info-icon {
		width: 16px;
		height: 16px;
		color: #059669;
		flex-shrink: 0;
		margin-top: 1px;
	}
	.omit-info-text {
		font-size: 0.6875rem;
		color: #065f46;
		line-height: 1.35;
	}
	@keyframes m3-slide-fade {
		from { opacity: 0; transform: translateY(-6px); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* Dark mode support */
	:global(html.dark) .data-entry-panel, :global(.dark) .data-entry-panel { background: #131c30; border-color: #26334e; }
	:global(html.dark) .panel-title, :global(.dark) .panel-title { color: #e7eef8; }
	:global(html.dark) .panel-header, :global(.dark) .panel-header { border-bottom-color: #10b981; }
	:global(html.dark) .panel-icon, :global(.dark) .panel-icon { color: #10b981; }
	:global(html.dark) .panel-badge, :global(.dark) .panel-badge { background: rgba(16, 185, 129, 0.15); color: #34d399; }
	:global(html.dark) .field-label, :global(.dark) .field-label { color: #a3b0c6; }
	:global(html.dark) .field-currency, :global(.dark) .field-currency { color: #10b981; }
	:global(html.dark) .m3-outlined-input, :global(.dark) .m3-outlined-input { background: #0b1120; border-color: #26334e; }
	:global(html.dark) .m3-outlined-input:hover, :global(.dark) .m3-outlined-input:hover { border-color: #10b981; }
	:global(html.dark) .m3-outlined-input:focus-within, :global(.dark) .m3-outlined-input:focus-within { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
	:global(html.dark) .m3-input-prefix, :global(.dark) .m3-input-prefix { color: #10b981; }
	:global(html.dark) .m3-input-suffix, :global(.dark) .m3-input-suffix, :global(html.dark) .m3-input-icon, :global(.dark) .m3-input-icon { color: #64748b; }
	:global(html.dark) .m3-outlined-input:hover .m3-input-icon, :global(.dark) .m3-outlined-input:hover .m3-input-icon { color: #10b981; }
	:global(html.dark) .m3-native-input, :global(.dark) .m3-native-input { color: #e7eef8; }
	:global(html.dark) .field-helper-text, :global(.dark) .field-helper-text { color: #94a3b8; }
	:global(html.dark) .mini-preset-chip, :global(.dark) .mini-preset-chip { background: #1e293b; border-color: #334155; color: #cbd5e1; }
	:global(html.dark) .mini-preset-chip:hover, :global(.dark) .mini-preset-chip:hover { background: #334155; border-color: #10b981; color: #10b981; }
	:global(html.dark) .mini-preset-chip.active, :global(.dark) .mini-preset-chip.active { background: #10b981 !important; border-color: #10b981 !important; color: #0f172a !important; }
	:global(html.dark) .switches-section, :global(.dark) .switches-section { border-top-color: #1e293b; }
	:global(html.dark) .rule-card, :global(.dark) .rule-card { background: #0b1120; border-color: #1e293b; }
	:global(html.dark) .omit-info-banner, :global(.dark) .omit-info-banner { background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.3); }
	:global(html.dark) .omit-info-icon, :global(.dark) .omit-info-icon { color: #10b981; }
	:global(html.dark) .omit-info-text, :global(.dark) .omit-info-text { color: #a7f3d0; }
	:global(html.dark) .switch-title, :global(.dark) .switch-title { color: #e7eef8; }
	:global(html.dark) .switch-desc, :global(.dark) .switch-desc { color: #a3b0c6; }
	:global(.parameters-drawer) .data-entry-panel { background: transparent !important; border: none !important; border-radius: 0 !important; padding: 0 !important; box-shadow: none !important; }
	:global(.parameters-drawer) .panel-header { display: none !important; }
</style>
