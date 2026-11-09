<script lang="ts">
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import M3DatePickerDialog from './M3DatePickerDialog.svelte';

	interface Props {
		state: SimulatorState;
	}

	let { state: simState }: Props = $props();

	let desdeInputElement = $state<HTMLInputElement | null>(null);
	let hastaInputElement = $state<HTMLInputElement | null>(null);
	let activeModal = $state<'inicio' | 'fin' | null>(null);

	const HORIZON_PRESETS = [
		{ label: '3m', months: 3 },
		{ label: '6m', months: 6 },
		{ label: '1 año', months: 12 },
		{ label: '2 años', months: 24 },
		{ label: '3 años', months: 36 },
		{ label: '5 años', months: 60 },
		{ label: '10 años', months: 120 }
	] as const;

	const horizonStats = $derived.by(() => {
		const start = new Date(simState.fechaInicio + 'T00:00:00');
		const end = new Date(simState.fechaFin + 'T00:00:00');
		if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
			return { isValid: false, text: 'Fechas incompletas', days: 0, months: 0 };
		}
		const diffMs = end.getTime() - start.getTime();
		const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
		if (diffDays <= 0) {
			return { isValid: false, text: 'Fecha término debe ser posterior', days: diffDays, months: 0 };
		}
		const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
		const years = Math.floor(totalMonths / 12);
		const remMonths = totalMonths % 12;

		let formatted = '';
		if (years > 0 && remMonths > 0) {
			formatted = `${years} año${years > 1 ? 's' : ''} y ${remMonths}m`;
		} else if (years > 0) {
			formatted = `${years} año${years > 1 ? 's' : ''}`;
		} else {
			formatted = `${totalMonths} meses`;
		}

		return {
			isValid: true,
			text: `${formatted} (${diffDays.toLocaleString('es-DO')} días)`,
			days: diffDays,
			months: totalMonths
		};
	});

	function openDatePicker(type: 'inicio' | 'fin'): void {
		activeModal = type;
	}

	function handleDateConfirmed(dateStr: string): void {
		if (activeModal === 'inicio') {
			simState.fechaInicio = dateStr;
		} else if (activeModal === 'fin') {
			simState.fechaFin = dateStr;
		}
		activeModal = null;
	}
</script>

<div class="calendar-horizon-container">
	<div class="horizon-header">
		<div class="horizon-title-group">
			<svg class="m3-calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<rect x="3" y="4" width="18" height="18" rx="3" ry="3"></rect>
				<line x1="16" y1="2" x2="16" y2="6"></line>
				<line x1="8" y1="2" x2="8" y2="6"></line>
				<line x1="3" y1="10" x2="21" y2="10"></line>
			</svg>
			<span class="horizon-title">Horizonte de Inversión</span>
		</div>
		<span class="duration-badge {horizonStats.isValid ? 'duration-valid' : 'duration-invalid'}" role="status" aria-live="polite">
			<span class="status-dot"></span>
			{horizonStats.text}
		</span>
	</div>

	<!-- Date Pickers Grid M3 Expressive -->
	<div class="dates-grid">
		<!-- Fecha Inicio -->
		<div class="m3-field-wrapper">
			<label class="m3-field-label" for="fecha-inicio-input">
				<span class="label-title">Fecha Inicio</span>
				<span class="field-hint">Apertura</span>
			</label>
			<div
				class="m3-date-box"
				role="button"
				tabindex="0"
				onclick={() => openDatePicker('inicio')}
				onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && openDatePicker('inicio')}
				aria-label="Abrir selector de fecha de inicio"
			>
				<input
					bind:this={desdeInputElement}
					id="fecha-inicio-input"
					type="date"
					class="m3-date-native"
					bind:value={simState.fechaInicio}
					aria-required="true"
				/>
				<svg class="m3-picker-indicator" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
					<line x1="16" y1="2" x2="16" y2="6"></line>
					<line x1="8" y1="2" x2="8" y2="6"></line>
					<line x1="3" y1="10" x2="21" y2="10"></line>
				</svg>
			</div>
		</div>

		<!-- Fecha Fin -->
		<div class="m3-field-wrapper">
			<label class="m3-field-label" for="fecha-fin-input">
				<span class="label-title">Fecha Término</span>
				<span class="field-hint">Liquidación</span>
			</label>
			<div
				class="m3-date-box"
				role="button"
				tabindex="0"
				onclick={() => openDatePicker('fin')}
				onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && openDatePicker('fin')}
				aria-label="Abrir selector de fecha de término"
			>
				<input
					bind:this={hastaInputElement}
					id="fecha-fin-input"
					type="date"
					class="m3-date-native"
					bind:value={simState.fechaFin}
					aria-required="true"
				/>
				<svg class="m3-picker-indicator" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<circle cx="12" cy="12" r="10"></circle>
					<polyline points="12 6 12 12 16 14"></polyline>
				</svg>
			</div>
		</div>
	</div>

	<!-- M3 Expressive Horizon Presets -->
	<div class="presets-section">
		<span class="presets-label">Horizonte Rápido:</span>
		<div class="presets-chips" role="group" aria-label="Horizontes predefinidos">
			{#each HORIZON_PRESETS as preset (preset.months)}
				{@const isSelected = horizonStats.months === preset.months && horizonStats.isValid}
				<button
					type="button"
					class="m3-chip {isSelected ? 'm3-chip--active' : ''}"
					onclick={() => simState.setHorizonMonths(preset.months)}
					aria-label="{preset.label} de horizonte"
					aria-pressed={isSelected}
				>
					{preset.label}
				</button>
			{/each}
		</div>
	</div>
</div>

<!-- M3 Material Date Picker Modals -->
{#if activeModal === 'inicio'}
	<M3DatePickerDialog
		isOpen={true}
		value={simState.fechaInicio}
		title="Seleccionar Fecha de Inicio (Apertura)"
		onSelect={handleDateConfirmed}
		onClose={() => (activeModal = null)}
	/>
{:else if activeModal === 'fin'}
	<M3DatePickerDialog
		isOpen={true}
		value={simState.fechaFin}
		title="Seleccionar Fecha de Fin (Liquidación)"
		onSelect={handleDateConfirmed}
		onClose={() => (activeModal = null)}
	/>
{/if}

<style>
	.calendar-horizon-container {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 14px;
		padding: 12px;
		margin-bottom: 14px;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}
	.calendar-horizon-container:hover { border-color: #cbd5e1; }
	.horizon-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 10px;
	}
	.horizon-title-group { display: flex; align-items: center; gap: 6px; }
	.m3-calendar-icon { width: 16px; height: 16px; color: #004851; flex-shrink: 0; }
	.horizon-title { font-size: 0.8125rem; font-weight: 700; color: #14201f; }
	.duration-badge {
		font-size: 0.6875rem;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 9999px;
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-variant-numeric: tabular-nums;
	}
	.status-dot { width: 6px; height: 6px; border-radius: 50%; }
	.duration-valid { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
	.duration-valid .status-dot { background: #10b981; }
	.duration-invalid { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
	.duration-invalid .status-dot { background: #ef4444; }
	.dates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
	@media (max-width: 400px) { .dates-grid { grid-template-columns: 1fr; } }
	.m3-field-wrapper { display: flex; flex-direction: column; min-width: 0; }
	.m3-field-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.6875rem;
		font-weight: 600;
		color: #4f5d5c;
		margin-bottom: 5px;
		min-height: 20px;
		white-space: nowrap;
	}
	.label-title {
		font-weight: 700;
		white-space: nowrap;
	}
	.field-hint { font-size: 0.625rem; color: #64748b; }
	.m3-date-box {
		display: flex;
		align-items: center;
		background: #ffffff;
		border: 1.5px solid #d5dedc;
		border-radius: 10px;
		padding: 0 10px;
		height: 42px;
		min-height: 42px;
		max-height: 42px;
		box-sizing: border-box;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.m3-date-box:hover { border-color: #004851; transform: translateY(-1px); }
	.m3-date-box:focus-within { border-color: #004851; box-shadow: 0 0 0 3px rgba(0, 72, 81, 0.15); }
	.m3-date-native {
		width: 100%;
		border: none;
		outline: none;
		background: transparent;
		font-family: inherit;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #14201f;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		padding: 6px 0;
	}
	.m3-picker-indicator { width: 14px; height: 14px; color: #64748b; flex-shrink: 0; pointer-events: none; }
	.presets-section {
		margin-top: 10px;
		padding-top: 8px;
		border-top: 1px dashed #e2e8f0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.presets-label { font-size: 0.6875rem; font-weight: 600; color: #64748b; }
	.presets-chips { display: flex; flex-wrap: wrap; gap: 4px; }
	.m3-chip {
		appearance: none;
		border: 1px solid #d5dedc;
		background: #ffffff;
		color: #334155;
		font-family: inherit;
		font-size: 0.6875rem;
		font-weight: 700;
		padding: 2px 9px;
		border-radius: 9999px;
		cursor: pointer;
		min-height: 24px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}
	.m3-chip:hover { background: #f1f5f9; border-color: #004851; color: #004851; transform: translateY(-1px); }
	.m3-chip:active { transform: scale(0.95); }
	.m3-chip--active { background: #004851 !important; border-color: #004851 !important; color: #ffffff !important; }

	/* Dark mode support */
	:global(html.dark) .calendar-horizon-container, :global(.dark) .calendar-horizon-container { background: #0f172a; border-color: #1e293b; }
	:global(html.dark) .horizon-title, :global(.dark) .horizon-title { color: #e2e8f0; }
	:global(html.dark) .m3-calendar-icon, :global(.dark) .m3-calendar-icon { color: #10b981; }
	:global(html.dark) .m3-field-label, :global(.dark) .m3-field-label { color: #94a3b8; }
	:global(html.dark) .m3-date-box, :global(.dark) .m3-date-box { background: #0b1120; border-color: #26334e; }
	:global(html.dark) .m3-date-box:hover, :global(.dark) .m3-date-box:hover { border-color: #10b981; }
	:global(html.dark) .m3-date-box:focus-within, :global(.dark) .m3-date-box:focus-within { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
	:global(html.dark) .m3-date-native, :global(.dark) .m3-date-native { color: #f1f5f9; color-scheme: dark; }
	:global(html.dark) .duration-valid, :global(.dark) .duration-valid { background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3); }
	:global(html.dark) .duration-invalid, :global(.dark) .duration-invalid { background: rgba(239, 68, 68, 0.15); color: #f87171; border-color: rgba(239, 68, 68, 0.3); }
	:global(html.dark) .presets-section, :global(.dark) .presets-section { border-top-color: #1e293b; }
	:global(html.dark) .presets-label, :global(.dark) .presets-label { color: #94a3b8; }
	:global(html.dark) .m3-chip, :global(.dark) .m3-chip { background: #1e293b; border-color: #334155; color: #cbd5e1; }
	:global(html.dark) .m3-chip:hover, :global(.dark) .m3-chip:hover { background: #334155; border-color: #10b981; color: #10b981; }
	:global(html.dark) .m3-chip--active, :global(.dark) .m3-chip--active { background: #10b981 !important; border-color: #10b981 !important; color: #0f172a !important; }
</style>
