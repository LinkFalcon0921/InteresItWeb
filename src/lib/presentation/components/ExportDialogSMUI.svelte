<script lang="ts">
	import Button, { Label } from '@smui/button';
	import type { SimulatorState } from '../state/SimulatorState.svelte';

	interface Props {
		state?: SimulatorState;
		simState?: SimulatorState;
		isOpen: boolean;
		onClose: () => void;
	}

	let { state: stateProp, simState: simStateProp, isOpen, onClose }: Props = $props();
	const currentSimState = $derived(simStateProp ?? stateProp);

	let fileName = $state('');

	async function handleExport(): Promise<void> {
		const name = fileName.trim().length > 0 ? fileName.trim() : undefined;
		if (currentSimState) {
			await currentSimState.exportPDF(name);
		}
		onClose();
	}

	async function handlePrint(): Promise<void> {
		if (currentSimState) {
			await currentSimState.printReport();
		}
		onClose();
	}
</script>

{#if isOpen}
	<div
		class="modal-backdrop"
		role="button"
		tabindex="0"
		onclick={onClose}
		onkeydown={(e) => {
			if (e.key === 'Escape' || e.key === 'Enter') onClose();
		}}
		aria-label="Cerrar modal de exportación"
	>
		<div
			class="modal-card"
			role="dialog"
			aria-labelledby="export-dialog-title"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="modal-header">
				<h3 id="export-dialog-title" class="modal-title">Exportar Reporte Institucional</h3>
				<button type="button" class="close-btn" onclick={onClose} aria-label="Cerrar">✕</button>
			</div>

			<div class="modal-body">
				<p class="modal-desc">
					El reporte se generará en formato A4 institucional con el resumen ejecutivo, tarjetas de
					escenarios y la tabla de capitalización mensual.
				</p>

				<div class="input-group">
					<label for="export-filename" class="input-label">Nombre del Documento (opcional)</label>
					<input
						id="export-filename"
						type="text"
						class="export-input"
						placeholder="Ej. InteresIt_Portafolio_2026"
						bind:value={fileName}
					/>
				</div>
			</div>

			<div class="modal-footer">
				<Button variant="outlined" onclick={onClose}>
					<Label>Cancelar</Label>
				</Button>
				<Button variant="outlined" onclick={handlePrint}>
					<Label>Imprimir</Label>
				</Button>
				<Button variant="raised" onclick={handleExport} class="confirm-btn">
					<Label>Guardar como PDF</Label>
				</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: 16px;
	}

	.modal-card {
		background: #ffffff;
		border-radius: 16px;
		width: 100%;
		max-width: 480px;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
		overflow: hidden;
		border: 1px solid #d5dedc;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid #edf2f0;
	}

	.modal-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 800;
		color: #14201f;
	}

	.close-btn {
		appearance: none;
		border: none;
		background: transparent;
		font-size: 1rem;
		color: #5e6b6a;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 4px;
	}

	.close-btn:hover {
		background: #f6f8fb;
		color: #14201f;
	}

	.modal-body {
		padding: 20px;
	}

	.modal-desc {
		margin: 0 0 16px 0;
		font-size: 0.8125rem;
		color: #5e6b6a;
		line-height: 1.45;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.input-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #4f5d5c;
	}

	.export-input {
		border: 1px solid #d5dedc;
		background: #f6f8fb;
		border-radius: 8px;
		padding: 10px 12px;
		font-size: 0.875rem;
		color: #14201f;
		outline: none;
	}

	.export-input:focus {
		border-color: #004851;
		background: #ffffff;
	}

	.modal-footer {
		padding: 14px 20px;
		background: #f6f8fb;
		border-top: 1px solid #edf2f0;
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}

	:global(.confirm-btn) {
		background: #004851 !important;
		color: #ffffff !important;
	}

	:global(.dark) .modal-card {
		background: #131c30;
		border-color: #26334e;
	}

	:global(.dark) .modal-header {
		border-bottom-color: #1e293b;
	}

	:global(.dark) .modal-title {
		color: #e7eef8;
	}

	:global(.dark) .modal-desc,
	:global(.dark) .input-label,
	:global(.dark) .close-btn {
		color: #a3b0c6;
	}

	:global(.dark) .close-btn:hover {
		background: #1e293b;
		color: #e7eef8;
	}

	:global(.dark) .export-input {
		background: #0b1120;
		border-color: #26334e;
		color: #e7eef8;
	}

	:global(.dark) .modal-footer {
		background: #0b1120;
		border-top-color: #1e293b;
	}

	:global(.dark) :global(.confirm-btn) {
		background: #7fd1d8 !important;
		color: #0b1120 !important;
	}
</style>
