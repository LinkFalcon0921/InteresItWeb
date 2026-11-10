<script lang="ts">
	import { onDestroy } from 'svelte';
	import { SYSTEM_LIMITS } from '$domain';
	import AppButton from './AppButton.svelte';
	import AppDialog from './AppDialog.svelte';
	import AppSpinner from './AppSpinner.svelte';
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
	let feedbackTimer: ReturnType<typeof setTimeout> | undefined;

	function setFeedbackTimer(fn: () => void, ms: number): void {
		if (feedbackTimer) clearTimeout(feedbackTimer);
		feedbackTimer = setTimeout(() => {
			feedbackTimer = undefined;
			fn();
		}, ms);
	}

	onDestroy(() => {
		if (feedbackTimer) {
			clearTimeout(feedbackTimer);
			feedbackTimer = undefined;
		}
	});

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
			setFeedbackTimer(() => {
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
		if (simState.portfolios.length >= SYSTEM_LIMITS.MAX_PORTFOLIOS) {
			isErrorStatus = true;
			statusMessage = `Límite alcanzado: no se pueden crear más de ${SYSTEM_LIMITS.MAX_PORTFOLIOS} portafolios.`;
			return;
		}
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
			setFeedbackTimer(() => {
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
			setFeedbackTimer(() => {
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
		if (e.key === 'Escape' && isOpen && renamingPortfolioId !== null) {
			cancelRename();
		}
	}}
/>

{#if simState}
	<AppDialog
		open={isOpen}
		title="Gestión de Portafolios"
		subtitle="Organiza, alterna y administra tus escenarios financieros"
		icon="💼"
		titleId="portfolio-dialog-title"
		maxWidth="580px"
		onclose={onClose}
	>
		{#if statusMessage}
			<div class="status-banner" class:error-banner={isErrorStatus} role="status">
				{statusMessage}
			</div>
		{/if}

		<section class="create-section" aria-label="Crear nuevo portafolio">
			<span class="section-label">Nuevo Portafolio</span>
			<div class="create-row">
				<input
					type="text"
					class="text-input"
					placeholder={simState && simState.portfolios.length >= SYSTEM_LIMITS.MAX_PORTFOLIOS ? `Límite máximo de ${SYSTEM_LIMITS.MAX_PORTFOLIOS} portafolios alcanzado` : 'Nombre del nuevo portafolio...'}
					maxlength="80"
					bind:value={newPortfolioName}
					disabled={isProcessing || Boolean(simState && simState.portfolios.length >= SYSTEM_LIMITS.MAX_PORTFOLIOS)}
					onkeydown={(e) => {
						if (e.key === 'Enter') handleCreate();
					}}
				/>
				<AppButton
					variant="primary"
					onclick={handleCreate}
					disabled={isProcessing || !newPortfolioName.trim() || Boolean(simState && simState.portfolios.length >= SYSTEM_LIMITS.MAX_PORTFOLIOS)}
					class="create-btn"
				>
					{#if isProcessing}
						<AppSpinner size="sm" color="#ffffff" />
						<span style="margin-left: 6px;">Creando...</span>
					{:else}
						<span>+ Crear</span>
					{/if}
				</AppButton>
			</div>
		</section>

		<section class="list-section" aria-label="Lista de portafolios guardados">
			<div class="list-header-row">
				<span class="section-label">Portafolios Guardados</span>
				<span class="count-badge">{simState.portfolios.length} / {SYSTEM_LIMITS.MAX_PORTFOLIOS}</span>
			</div>

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
									>✓</button>
									<button
										type="button"
										class="mini-btn"
										onclick={cancelRename}
										title="Cancelar"
									>✕</button>
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
									>Activar</button>
								{/if}
								<button
									type="button"
									class="action-pill"
									onclick={() => startRename(p.id, p.name)}
									disabled={isProcessing}
									title="Renombrar portafolio"
								>Renombrar</button>
								<button
									type="button"
									class="action-pill delete-pill"
									onclick={() => handleDelete(p.id)}
									disabled={isProcessing || simState.portfolios.length <= 1}
									title={simState.portfolios.length <= 1 ? 'No se puede eliminar el único portafolio' : 'Eliminar portafolio'}
								>Eliminar</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>

		{#snippet actions()}
			<AppButton variant="secondary" onclick={onClose}>
				Cerrar
			</AppButton>
		{/snippet}
	</AppDialog>
{/if}

<style>
	.status-banner { background: #e6f4ea; color: #137333; padding: 10px 14px; border-radius: 10px; font-size: 0.8125rem; font-weight: 600; margin-bottom: 16px; border: 1px solid #ceead6; }
	.status-banner.error-banner { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
	.create-section { margin-bottom: 20px; }
	.section-label { display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #4f5d5c; margin-bottom: 8px; }
	.list-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
	.count-badge { background: rgba(0, 72, 81, 0.08); color: #004851; font-size: 0.6875rem; font-weight: 800; padding: 2px 8px; border-radius: 12px; }
	.create-row { display: flex; gap: 10px; }
	.text-input { flex: 1; border: 1px solid #d5dedc; background: #f6f8fb; border-radius: 10px; padding: 10px 14px; font-size: 0.875rem; color: #14201f; outline: none; transition: all 0.2s ease; }
	.text-input:focus { border-color: #004851; background: #ffffff; box-shadow: 0 0 0 3px rgba(0, 72, 81, 0.12); }
	.portfolio-list { display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto; padding-right: 4px; }
	.portfolio-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border-radius: 12px; border: 1px solid #edf2f0; background: #fdfefe; transition: all 0.15s ease; }
	.portfolio-item:hover { border-color: #cbd5e1; background: #ffffff; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04); }
	.active-item { border-color: #10b981; background: rgba(16, 185, 129, 0.06); }
	.item-main { flex: 1; min-width: 0; }
	.name-row { display: flex; align-items: center; gap: 8px; }
	.portfolio-name { font-size: 0.9375rem; font-weight: 700; color: #14201f; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.active-badge { background: #10b981; color: #ffffff; font-size: 0.625rem; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 6px; letter-spacing: 0.04em; }
	.meta-row { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #64748b; margin-top: 3px; }
	.item-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
	.action-pill { border: 1px solid #d5dedc; background: #ffffff; color: #334155; font-size: 0.75rem; font-weight: 600; padding: 6px 10px; border-radius: 8px; cursor: pointer; min-height: 32px; transition: all 0.15s ease; }
	.action-pill:hover:not(:disabled) { background: #f1f5f9; border-color: #94a3b8; }
	.select-pill { background: #004851; color: #ffffff; border-color: #004851; }
	.select-pill:hover:not(:disabled) { background: #00363d; border-color: #00363d; }
	.delete-pill { color: #dc2626; border-color: rgba(220, 38, 38, 0.2); }
	.delete-pill:hover:not(:disabled) { background: #fef2f2; border-color: #dc2626; }
	.action-pill:disabled { opacity: 0.4; cursor: not-allowed; }
	.rename-row { display: flex; align-items: center; gap: 6px; }
	.rename-input { padding: 6px 10px; font-size: 0.8125rem; }
	.mini-btn { border: 1px solid #cbd5e1; background: #ffffff; border-radius: 6px; padding: 6px 10px; font-size: 0.75rem; font-weight: 700; cursor: pointer; min-height: 30px; }
	.confirm-rename-btn { background: #10b981; color: #ffffff; border-color: #10b981; }

	:global(html.dark) .status-banner { background: #064e3b; color: #6ee7b7; border-color: #047857; }
	:global(html.dark) .status-banner.error-banner { background: #450a0a; color: #f87171; border-color: #7f1d1d; }
	:global(html.dark) .section-label, :global(html.dark) .meta-row { color: #94a3b8; }
	:global(html.dark) .count-badge { background: rgba(16, 185, 129, 0.15); color: #10b981; }
	:global(html.dark) .text-input { background: #0b1120; border-color: #26334e; color: #e7eef8; }
	:global(html.dark) .text-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
	:global(html.dark) .portfolio-item { background: #18233a; border-color: #26334e; }
	:global(html.dark) .portfolio-item:hover { border-color: #3b82f6; background: #1e293b; }
	:global(html.dark) .active-item { border-color: #10b981; background: rgba(16, 185, 129, 0.12); }
	:global(html.dark) .portfolio-name { color: #e7eef8; }
	:global(html.dark) .action-pill { background: #0b1120; border-color: #26334e; color: #cbd5e1; }
	:global(html.dark) .action-pill:hover:not(:disabled) { background: #1e293b; border-color: #475569; }
	:global(html.dark) .select-pill { background: #10b981; color: #0b1120; border-color: #10b981; }
	:global(html.dark) .mini-btn { background: #0b1120; border-color: #334155; color: #e2e8f0; }
</style>
