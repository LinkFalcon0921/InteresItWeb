<script lang="ts">
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import { formatCurrency } from '../formatters/financialFormatters';

	interface Props {
		state?: SimulatorState;
		simState?: SimulatorState;
	}

	let { state: stateProp, simState: simStateProp }: Props = $props();
	const currentSimState = $derived(simStateProp ?? stateProp);

	let nuevoMonto = $state<number>(0);
	let nuevaFecha = $state<string>('');
	let nuevaDescripcion = $state<string>('');
	let isAdding = $state<boolean>(false);

	$effect(() => {
		if (!nuevaFecha && currentSimState?.fechaInicio) {
			nuevaFecha = currentSimState.fechaInicio;
		}
	});

	function handleAdd(): void {
		if (nuevoMonto <= 0 || !nuevaFecha || !currentSimState) return;
		currentSimState.addAporteExtraordinario(
			nuevoMonto,
			nuevaFecha,
			nuevaDescripcion.trim() || undefined
		);
		nuevoMonto = 0;
		nuevaDescripcion = '';
		isAdding = false;
	}
</script>

<div class="aportes-section">
	<div class="aportes-header">
		<div class="header-text">
			<span class="section-title">Aportes Extraordinarios</span>
			<span class="section-subtitle">Depósitos únicos programados</span>
		</div>
		<button
			type="button"
			class="btn-toggle-add"
			onclick={() => (isAdding = !isAdding)}
			aria-expanded={isAdding}
		>
			{isAdding ? '− Cancelar' : '+ Programar'}
		</button>
	</div>

	{#if isAdding}
		<div class="add-aporte-form">
			<div class="input-row">
				<label class="mini-label" for="aporte-extra-monto">Monto (RD$)</label>
				<input
					id="aporte-extra-monto"
					type="number"
					min="1"
					step="any"
					class="mini-input"
					placeholder="Ej. 25000"
					bind:value={nuevoMonto}
				/>
			</div>

			<div class="input-row">
				<label class="mini-label" for="aporte-extra-fecha">Fecha del depósito</label>
				<input
					id="aporte-extra-fecha"
					type="date"
					class="mini-input"
					bind:value={nuevaFecha}
				/>
			</div>

			<div class="input-row">
				<label class="mini-label" for="aporte-extra-desc">Motivo (Opcional)</label>
				<input
					id="aporte-extra-desc"
					type="text"
					class="mini-input"
					placeholder="Ej. Regalía Pascual / Bono"
					bind:value={nuevaDescripcion}
				/>
			</div>

			<button
				type="button"
				class="btn-save-aporte"
				onclick={handleAdd}
				disabled={nuevoMonto <= 0 || !nuevaFecha}
			>
				Guardar Aporte
			</button>
		</div>
	{/if}

	{#if (currentSimState?.aportesExtraordinarios.length ?? 0) > 0}
		<ul class="aportes-list">
			{#each currentSimState?.aportesExtraordinarios ?? [] as aporte (aporte.id)}
				<li class="aporte-item">
					<div class="aporte-info">
						<span class="aporte-monto">+{formatCurrency(aporte.monto)}</span>
						<span class="aporte-meta">
							{aporte.fecha} {aporte.descripcion ? `• ${aporte.descripcion}` : ''}
						</span>
					</div>
					<button
						type="button"
						class="btn-remove-aporte"
						onclick={() => currentSimState?.removeAporteExtraordinario(aporte.id)}
						title="Eliminar aporte"
						aria-label="Eliminar aporte programado"
					>
						✕
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.aportes-section {
		margin-top: 16px;
		border-top: 1px dashed #d5dedc;
		padding-top: 14px;
	}

	.aportes-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	.header-text {
		display: flex;
		flex-direction: column;
	}

	.section-title {
		font-size: 0.8125rem;
		font-weight: 700;
		color: #14201f;
	}

	.section-subtitle {
		font-size: 0.6875rem;
		color: #4f5d5c;
	}

	.btn-toggle-add {
		background: rgba(0, 72, 81, 0.08);
		color: #004851;
		border: 1px solid rgba(0, 72, 81, 0.2);
		border-radius: 8px;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 5px 12px;
		min-height: 32px;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		transition: all 0.15s ease;
	}

	.btn-toggle-add:hover {
		background: #004851;
		color: #ffffff;
		box-shadow: 0 2px 5px rgba(0, 72, 81, 0.2);
	}

	.add-aporte-form {
		background: #f8fafc;
		border: 1px solid #d5dedc;
		border-radius: 12px;
		padding: 14px;
		margin-bottom: 14px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.input-row {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.mini-label {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: #4f5d5c;
	}

	.mini-input {
		border: 1px solid #d5dedc;
		border-radius: 8px;
		padding: 8px 10px;
		font-size: 0.8125rem;
		background: #ffffff;
		color: #14201f;
		outline: none;
		transition: all 0.15s ease;
	}

	.mini-input:focus {
		border-color: #004851;
		box-shadow: 0 0 0 3px rgba(0, 72, 81, 0.1);
	}

	.btn-save-aporte {
		background: #004851;
		color: #ffffff;
		border: none;
		border-radius: 8px;
		padding: 9px;
		font-size: 0.8125rem;
		font-weight: 700;
		cursor: pointer;
		margin-top: 4px;
		min-height: 36px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}

	.btn-save-aporte:hover:not(:disabled) {
		background: #00363d;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
	}

	.btn-save-aporte:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.aportes-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.aporte-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #f1f7f6;
		border: 1px solid #d5dedc;
		border-radius: 8px;
		padding: 8px 12px;
		transition: all 0.15s ease;
	}

	.aporte-item:hover {
		background: #e8f3f2;
	}

	.aporte-info {
		display: flex;
		flex-direction: column;
	}

	.aporte-monto {
		font-size: 0.8125rem;
		font-weight: 700;
		color: #004851;
	}

	.aporte-meta {
		font-size: 0.6875rem;
		color: #4f5d5c;
	}

	.btn-remove-aporte {
		background: transparent;
		border: none;
		color: #dc2626;
		font-size: 0.875rem;
		cursor: pointer;
		width: 32px;
		height: 32px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		transition: all 0.15s ease;
	}

	.btn-remove-aporte:hover {
		background: rgba(220, 38, 38, 0.1);
	}

	:global(html.dark) .aportes-section,
	:global(.dark) .aportes-section {
		border-color: #26334e;
	}

	:global(html.dark) .section-title,
	:global(.dark) .section-title {
		color: #e7eef8;
	}

	:global(html.dark) .section-subtitle,
	:global(html.dark) .mini-label,
	:global(html.dark) .aporte-meta,
	:global(.dark) .section-subtitle,
	:global(.dark) .mini-label,
	:global(.dark) .aporte-meta {
		color: #94a3b8;
	}

	:global(html.dark) .btn-toggle-add,
	:global(.dark) .btn-toggle-add {
		background: rgba(16, 185, 129, 0.15);
		color: #10b981;
		border-color: rgba(16, 185, 129, 0.35);
	}

	:global(html.dark) .btn-toggle-add:hover,
	:global(.dark) .btn-toggle-add:hover {
		background: rgba(16, 185, 129, 0.25);
		color: #34d399;
	}

	:global(html.dark) .add-aporte-form,
	:global(html.dark) .aporte-item,
	:global(.dark) .add-aporte-form,
	:global(.dark) .aporte-item {
		background: #0b1120;
		border-color: #26334e;
	}

	:global(html.dark) .mini-input,
	:global(.dark) .mini-input {
		background: #131c30;
		border-color: #26334e;
		color: #f1f5f9;
	}

	:global(html.dark) .mini-input:focus,
	:global(.dark) .mini-input:focus {
		border-color: #10b981;
		box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
	}

	:global(html.dark) .btn-save-aporte,
	:global(.dark) .btn-save-aporte {
		background: #10b981;
		color: #0b1120;
	}

	:global(html.dark) .btn-save-aporte:hover:not(:disabled),
	:global(.dark) .btn-save-aporte:hover:not(:disabled) {
		background: #34d399;
	}

	:global(html.dark) .aporte-monto,
	:global(.dark) .aporte-monto {
		color: #10b981;
	}
</style>
