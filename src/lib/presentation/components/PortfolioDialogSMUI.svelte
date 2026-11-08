<script lang="ts">
	import Button, { Label } from '@smui/button';
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import { formatCurrency } from '../formatters/financialFormatters';

	interface Props {
		simState?: SimulatorState;
		state?: SimulatorState;
		isOpen: boolean;
		onClose: () => void;
	}

	let { simState: simStateProp, state: stateProp, isOpen, onClose }: Props = $props();
	const simState = $derived(simStateProp ?? stateProp);

	let newPortfolioName = $state('');
	let renamingPortfolioId = $state<string | null>(null);
	let editedName = $state('');
	let statusMessage = $state('');
	let isErrorStatus = $state(false);
	let isProcessing = $state(false);

	async function handleSwitch(id: string): Promise<void> {
		if (!simState || id === simState.currentPortfolioId) return;
		isProcessing = true;
		statusMessage = '';
		isErrorStatus = false;
		const success = await simState.switchPortfolio(id);
		isProcessing = false;
		if (success) {
			isErrorStatus = false;
			statusMessage = 'Portafolio cargado con éxito.';
			setTimeout(() => {
				statusMessage = '';
				onClose();
			}, 600);
		} else {
			isErrorStatus = true;
			statusMessage = simState.errorMessage || 'Error al cargar el portafolio.';
		}
	}

	async function handleCreate(): Promise<void> {
		if (!simState) return;
		const name = newPortfolioName.trim();
		if (!name) return;
		isProcessing = true;
		statusMessage = '';
		isErrorStatus = false;
		const success = await simState.createPortfolio(name);
		isProcessing = false;
		if (success) {
			newPortfolioName = '';
			isErrorStatus = false;
			statusMessage = 'Portafolio creado y activado.';
			setTimeout(() => {
				statusMessage = '';
				onClose();
			}, 600);
		} else {
			isErrorStatus = true;
			statusMessage = simState.errorMessage || 'Error al crear el portafolio.';
		}
	}

	function startRename(id: string, currentName: string): void {
		renamingPortfolioId = id;
		editedName = currentName;
		statusMessage = '';
		isErrorStatus = false;
	}

	async function submitRename(id: string): Promise<void> {
		if (!simState) return;
		const name = editedName.trim();
		if (!name) return;
		isProcessing = true;
		isErrorStatus = false;
		const success = await simState.renamePortfolio(id, name);
		isProcessing = false;
		if (success) {
			renamingPortfolioId = null;
			editedName = '';
			statusMessage = 'Portafolio renombrado.';
			setTimeout(() => {
				if (statusMessage === 'Portafolio renombrado.') statusMessage = '';
			}, 1500);
		} else {
			isErrorStatus = true;
			statusMessage = simState.errorMessage || 'Error al renombrar el portafolio.';
		}
	}

	function cancelRename(): void {
		renamingPortfolioId = null;
		editedName = '';
	}

	async function handleDelete(id: string): Promise<void> {
		if (!simState || simState.portfolios.length <= 1) return;
		isProcessing = true;
		statusMessage = '';
		isErrorStatus = false;
		const success = await simState.deletePortfolio(id);
		isProcessing = false;
		if (success) {
			isErrorStatus = false;
			statusMessage = 'Portafolio eliminado.';
		} else {
			isErrorStatus = true;
			statusMessage = simState.errorMessage || 'Error al eliminar el portafolio.';
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape' && isOpen) {
			if (renamingPortfolioId !== null) {
				cancelRename();
			} else {
				onClose();
			}
		}
	}}
/>

{#if isOpen && simState}
	<div
		class="modal-backdrop"
		role="button"
		tabindex="0"
		onclick={onClose}
		onkeydown={(e) => {
			if (e.key === 'Escape') onClose();
		}}
		aria-label="Cerrar modal de portafolios"
	>
		<div
			class="modal-card"
			role="dialog"
			aria-labelledby="portfolio-dialog-title"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="modal-header">
				<div class="header-titles">
					<h3 id="portfolio-dialog-title" class="modal-title">Gestión de Portafolios</h3>
					<span class="modal-subtitle">Organiza, alterna y administra tus escenarios</span>
				</div>
				<button type="button" class="close-btn" onclick={onClose} aria-label="Cerrar">✕</button>
			</div>

			<div class="modal-body">
				{#if statusMessage}
					<div
						class="status-banner"
						class:error-banner={isErrorStatus}
						role="status"
					>
						{statusMessage}
					</div>
				{/if}

				<section class="create-section" aria-label="Crear nuevo portafolio">
					<span class="section-label">Nuevo Portafolio</span>
					<div class="create-row">
						<input
							type="text"
							class="text-input"
							placeholder="Nombre del nuevo portafolio..."
							maxlength="80"
							bind:value={newPortfolioName}
							disabled={isProcessing}
							onkeydown={(e) => {
								if (e.key === 'Enter') handleCreate();
							}}
						/>
						<button
							type="button"
							class="create-btn"
							onclick={handleCreate}
							disabled={isProcessing || !newPortfolioName.trim()}
						>
							+ Crear
						</button>
					</div>
				</section>

				<section class="list-section" aria-label="Lista de portafolios guardados">
					<span class="section-label">Portafolios Guardados ({simState.portfolios.length})</span>
					<div class="portfolio-list">
						{#each simState.portfolios as p (p.id)}
							<div
								class="portfolio-item"
								class:active-item={p.id === simState.currentPortfolioId}
							>
								<div class="item-main">
									{#if renamingPortfolioId === p.id}
										<div class="rename-row">
											<input
												type="text"
												class="text-input rename-input"
												maxlength="80"
												bind:value={editedName}
												disabled={isProcessing}
												onkeydown={(e) => {
													if (e.key === 'Enter') submitRename(p.id);
													if (e.key === 'Escape') cancelRename();
												}}
											/>
											<button
												type="button"
												class="mini-btn confirm-rename-btn"
												onclick={() => submitRename(p.id)}
												disabled={isProcessing || !editedName.trim()}
												title="Guardar nombre"
											>
												✓
											</button>
											<button
												type="button"
												class="mini-btn"
												onclick={cancelRename}
												title="Cancelar"
											>
												✕
											</button>
										</div>
									{:else}
										<div class="name-row">
											<span class="portfolio-name">{p.name}</span>
											{#if p.id === simState.currentPortfolioId}
												<span class="active-badge">Activo</span>
											{/if}
										</div>
										<div class="meta-row">
											<span>{p.escenariosCount} escenarios</span>
											<span>•</span>
											<span>Base: {formatCurrency(p.montoInicial)}</span>
										</div>
									{/if}
								</div>

								<div class="item-actions">
									{#if renamingPortfolioId !== p.id}
										{#if p.id !== simState.currentPortfolioId}
											<button
												type="button"
												class="action-pill select-pill"
												onclick={() => handleSwitch(p.id)}
												disabled={isProcessing}
												title="Cargar y activar este portafolio"
											>
												Activar
											</button>
										{/if}

										<button
											type="button"
											class="action-pill"
											onclick={() => startRename(p.id, p.name)}
											disabled={isProcessing}
											title="Renombrar portafolio"
										>
											Renombrar
										</button>

										<button
											type="button"
											class="action-pill delete-pill"
											onclick={() => handleDelete(p.id)}
											disabled={isProcessing || simState.portfolios.length <= 1}
											title={simState.portfolios.length <= 1
												? 'No se puede eliminar el único portafolio'
												: 'Eliminar portafolio'}
										>
											Eliminar
										</button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</section>
			</div>

			<div class="modal-footer">
				<Button variant="outlined" onclick={onClose}>
					<Label>Cerrar</Label>
				</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; }
	.modal-card { background: #ffffff; border-radius: 16px; width: 100%; max-width: 560px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25); overflow: hidden; border: 1px solid #d5dedc; }
	.modal-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #edf2f0; }
	.modal-title { margin: 0; font-size: 1.15rem; font-weight: 800; color: #14201f; }
	.modal-subtitle { font-size: 0.75rem; color: #5e6b6a; margin-top: 2px; display: block; }
	.close-btn { background: transparent; border: none; font-size: 1.1rem; color: #5e6b6a; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
	.modal-body { padding: 18px 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
	.status-banner { background: #e6f4ea; color: #137333; padding: 8px 12px; border-radius: 8px; font-size: 0.8125rem; font-weight: 600; }
	.status-banner.error-banner { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
	.section-label { display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #4f5d5c; margin-bottom: 6px; }
	.create-row { display: flex; gap: 8px; }
	.text-input { flex: 1; border: 1px solid #d5dedc; background: #f6f8fb; border-radius: 8px; padding: 8px 12px; font-size: 0.875rem; color: #14201f; outline: none; }
	.text-input:focus { border-color: #004851; background: #ffffff; }
	.create-btn { border: none; background: #004851; color: #ffffff; border-radius: 8px; padding: 0 16px; font-size: 0.8125rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
	.create-btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.portfolio-list { display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto; }
	.portfolio-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1px solid #edf2f0; background: #fdfefe; }
	.active-item { border-color: #004851; background: #f0fdf4; }
	.item-main { flex: 1; min-width: 0; }
	.name-row { display: flex; align-items: center; gap: 8px; }
	.portfolio-name { font-size: 0.9375rem; font-weight: 700; color: #14201f; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.active-badge { background: #004851; color: #ffffff; font-size: 0.625rem; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; }
	.meta-row { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #64748b; margin-top: 2px; }
	.item-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
	.action-pill { border: 1px solid #d5dedc; background: #ffffff; color: #334155; font-size: 0.6875rem; font-weight: 600; padding: 4px 8px; border-radius: 6px; cursor: pointer; }
	.select-pill { background: #004851; color: #ffffff; border-color: #004851; }
	.delete-pill { color: #dc2626; }
	.action-pill:disabled { opacity: 0.4; cursor: not-allowed; }
	.rename-row { display: flex; align-items: center; gap: 6px; }
	.rename-input { padding: 4px 6px; font-size: 0.8125rem; }
	.mini-btn { border: 1px solid #cbd5e1; background: #ffffff; border-radius: 6px; padding: 4px 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
	.confirm-rename-btn { background: #10b981; color: #ffffff; border-color: #10b981; }
	.modal-footer { padding: 12px 20px; background: #f8fafc; border-top: 1px solid #edf2f0; display: flex; justify-content: flex-end; }
	:global(.dark) .modal-card { background: #131c30; border-color: #26334e; }
	:global(.dark) .modal-header, :global(.dark) .modal-footer { border-color: #1e293b; background: #0b1120; }
	:global(.dark) .modal-title, :global(.dark) .portfolio-name { color: #e7eef8; }
	:global(.dark) .modal-subtitle, :global(.dark) .section-label, :global(.dark) .meta-row, :global(.dark) .close-btn { color: #94a3b8; }
	:global(.dark) .text-input { background: #0b1120; border-color: #26334e; color: #e7eef8; }
	:global(.dark) .create-btn, :global(.dark) .select-pill { background: #10b981; color: #0b1120; border-color: #10b981; }
	:global(.dark) .portfolio-item { background: #18233a; border-color: #26334e; }
	:global(.dark) .active-item { border-color: #10b981; background: #14283c; }
	:global(.dark) .active-badge { background: #10b981; color: #0b1120; }
	:global(.dark) .action-pill { background: #0b1120; border-color: #26334e; color: #cbd5e1; }
	:global(.dark) .status-banner.error-banner { background: #450a0a; color: #f87171; border-color: #7f1d1d; }
</style>
