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
		background: #eef5f5;
		color: #004851;
		border: 1px solid #c2dbde;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 4px 10px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.btn-toggle-add:hover {
		background: #004851;
		color: #ffffff;
	}

	.add-aporte-form {
		background: #f7faf9;
		border: 1px solid #d5dedc;
		border-radius: 8px;
		padding: 12px;
		margin-bottom: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.input-row {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.mini-label {
		font-size: 0.6875rem;
		font-weight: 600;
		color: #4f5d5c;
	}

	.mini-input {
		border: 1px solid #c2dbde;
		border-radius: 6px;
		padding: 6px 8px;
		font-size: 0.75rem;
		background: #ffffff;
		color: #14201f;
	}

	.btn-save-aporte {
		background: #004851;
		color: #ffffff;
		border: none;
		border-radius: 6px;
		padding: 8px;
		font-size: 0.75rem;
		font-weight: 700;
		cursor: pointer;
		margin-top: 4px;
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
		border-radius: 6px;
		padding: 6px 10px;
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
		color: #c93b2b;
		font-size: 0.875rem;
		cursor: pointer;
		padding: 2px 6px;
		border-radius: 4px;
	}

	.btn-remove-aporte:hover {
		background: rgba(201, 59, 43, 0.1);
	}

	:global(body.dark) .aportes-section {
		border-color: #2a3b4c;
	}

	:global(body.dark) .section-title {
		color: #e7eef8;
	}

	:global(body.dark) .section-subtitle,
	:global(body.dark) .mini-label,
	:global(body.dark) .aporte-meta {
		color: #94a3b8;
	}

	:global(body.dark) .btn-toggle-add {
		background: #1e293b;
		color: #38bdf8;
		border-color: #334155;
	}

	:global(body.dark) .add-aporte-form,
	:global(body.dark) .aporte-item {
		background: #1e293b;
		border-color: #334155;
	}

	:global(body.dark) .mini-input {
		background: #0f172a;
		border-color: #334155;
		color: #f1f5f9;
	}

	:global(body.dark) .aporte-monto {
		color: #38bdf8;
	}
</style>
