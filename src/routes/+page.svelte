<script lang="ts">
	import { onMount } from 'svelte';
	import Snackbar, { Actions, Label } from '@smui/snackbar';
	import Button from '@smui/button';
	import { createSimulatorState, getAppContainer } from '$di';
	import {
		DataEntrySMUI,
		DiagnosticsDialogSMUI,
		ExportDialogSMUI,
		HeaderSMUI,
		HeroCardSMUI,
		ParametersDrawerSMUI,
		PairComparisonSMUI,
		PortfolioDialogSMUI,
		ProjectionTableSMUI,
		ScenarioListSMUI
	} from '$presentation';

	const simState = createSimulatorState();

	let isExportDialogOpen = $state(false);
	let snackbar: Snackbar | null = $state(null);

	onMount(async () => {
		await simState.loadFromStorage();
	});

	$effect(() => {
		if (simState.saveNotificationVisible && snackbar) {
			snackbar.open();
			simState.saveNotificationVisible = false;
		}
	});

	type TabType = 'simulador' | 'comparativa' | 'reporte';
	const tabs: Array<{ id: TabType; label: string; icon: string }> = [
		{ id: 'simulador', label: 'Simulador', icon: '📊' },
		{ id: 'comparativa', label: 'Rendimientos Comparados', icon: '⚖️' },
		{ id: 'reporte', label: 'Tabla de Proyección', icon: '📋' }
	];
</script>

<svelte:head>
	<title>InteresIt — Terminal Financiera Multi-Escenario</title>
</svelte:head>

<svelte:boundary>
	<div class="terminal-shell">
		<HeaderSMUI state={simState} />

	<div class="terminal-main-layout">
		<!-- Panel Lateral de Parámetros (Desktop) -->
		<aside id="tour-data" class="desktop-sidebar" aria-label="Parámetros de Simulación">
			<DataEntrySMUI state={simState} />
		</aside>

		<!-- Área Principal de Trabajo -->
		<main class="workspace-area">
			{#if simState.errorMessage}
				<div class="error-banner" role="alert">
					<span class="error-icon">⚠️</span>
					<span class="error-text">{simState.errorMessage}</span>
				</div>
			{/if}

			<div id="tour-hero">
				<HeroCardSMUI state={simState} />
			</div>

			<!-- Navegación por Pestañas -->
			<div class="tabs-nav" role="tablist" aria-label="Secciones de la terminal">
				{#each tabs as tab (tab.id)}
					<button
						type="button"
						role="tab"
						id="tab-{tab.id}"
						aria-selected={simState.activeTab === tab.id}
						aria-controls="panel-{tab.id}"
						class="tab-btn {simState.activeTab === tab.id ? 'tab-btn-active' : ''}"
						onclick={() => {
							simState.activeTab = tab.id;
						}}
					>
						<span class="tab-icon">{tab.icon}</span>
						<span>{tab.label}</span>
					</button>
				{/each}
			</div>

			<!-- Contenido de las Pestañas -->
			<div class="tab-panels">
				{#if simState.activeTab === 'simulador'}
					<div id="panel-simulador" role="tabpanel" tabindex="0" aria-labelledby="tab-simulador">
						<div id="tour-scenarios">
							<ScenarioListSMUI state={simState} />
						</div>
						<div id="tour-table">
							<ProjectionTableSMUI state={simState} />
						</div>
					</div>
				{:else if simState.activeTab === 'comparativa'}
					<div id="panel-comparativa" role="tabpanel" tabindex="0" aria-labelledby="tab-comparativa">
						<div id="tour-pairs">
							<PairComparisonSMUI state={simState} />
						</div>
						<ScenarioListSMUI state={simState} />
					</div>
				{:else if simState.activeTab === 'reporte'}
					<div id="panel-reporte" role="tabpanel" tabindex="0" aria-labelledby="tab-reporte">
						<div class="report-actions-bar">
							<Button
								variant="raised"
								onclick={() => {
									isExportDialogOpen = true;
								}}
								class="export-action-btn"
							>
								<Label>📄 Configurar Exportación PDF / A4</Label>
							</Button>
						</div>
						<ProjectionTableSMUI state={simState} />
					</div>
				{/if}
			</div>
		</main>
	</div>

	<!-- Drawer Móvil de Parámetros -->
	<ParametersDrawerSMUI state={simState} />

	<!-- Diálogo de Exportación -->
	<ExportDialogSMUI
		simState={simState}
		isOpen={isExportDialogOpen || simState.isExportDialogOpen}
		onClose={() => {
			isExportDialogOpen = false;
			simState.isExportDialogOpen = false;
		}}
	/>

	<!-- Diálogo de Portafolios -->
	<PortfolioDialogSMUI
		simState={simState}
		isOpen={simState.isPortfolioDialogOpen}
		onClose={() => {
			simState.isPortfolioDialogOpen = false;
		}}
	/>

	<!-- Diálogo de Diagnóstico -->
	<DiagnosticsDialogSMUI
		simState={simState}
		isOpen={simState.isDiagnosticsDialogOpen}
		onClose={() => {
			simState.isDiagnosticsDialogOpen = false;
		}}
	/>

	<!-- Snackbar de Guardado -->
	<Snackbar bind:this={snackbar}>
		<Label>Configuración guardada en IndexedDB exitosamente.</Label>
		<Actions>
			<Button>Cerrar</Button>
		</Actions>
	</Snackbar>
</div>

{#snippet failed(error: unknown, reset: () => void)}
	<div class="boundary-recovery-container" role="alert">
		<div class="recovery-card">
			<div class="recovery-badge">🛡️ Resiliencia del Sistema</div>
			<h2 class="recovery-title">Interrupción Inesperada en la Terminal</h2>
			<p class="recovery-desc">
				Ocurrió un error inesperado al procesar la simulación o renderizar la interfaz. Puedes
				restaurar el estado seguro para recuperar la sesión sin perder tus portafolios guardados.
			</p>
			<div class="recovery-error-detail">
				<code>{error instanceof Error ? error.message : String(error)}</code>
			</div>
			<div class="recovery-actions">
				<button
					type="button"
					class="recovery-btn recovery-btn-primary"
					id="btn-restore-safe-state"
					onclick={async () => {
						await simState.resetToSafeDefaults();
						reset();
					}}
				>
					Restaurar estado seguro
				</button>
				<button
					type="button"
					class="recovery-btn recovery-btn-secondary"
					onclick={() => {
						if (typeof window !== 'undefined') window.location.reload();
					}}
				>
					Recargar aplicación
				</button>
			</div>
		</div>
	</div>
{/snippet}
</svelte:boundary>

<style>
	:global(body) {
		margin: 0;
		background: #f5f7f6;
		color: #14201f;
		font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		-webkit-font-smoothing: antialiased;
	}

	:global(body.dark),
	:global(html.dark) {
		background: #0b1120;
		color: #e7eef8;
	}

	.terminal-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.terminal-main-layout {
		max-width: 1440px;
		margin: 0 auto;
		width: 100%;
		box-sizing: border-box;
		padding: 20px;
		display: grid;
		grid-template-columns: 340px 1fr;
		gap: 24px;
		align-items: start;
	}

	.desktop-sidebar {
		position: sticky;
		top: 76px;
	}

	.workspace-area {
		min-width: 0;
	}

	.error-banner {
		background: #fee2e2;
		border: 1px solid #fca5a5;
		color: #991b1b;
		padding: 12px 16px;
		border-radius: 10px;
		margin-bottom: 16px;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.error-icon {
		font-size: 1.1rem;
	}

	.tabs-nav {
		display: flex;
		gap: 8px;
		border-bottom: 2px solid #d5dedc;
		margin-bottom: 20px;
		overflow-x: auto;
	}

	.tab-btn {
		appearance: none;
		border: none;
		background: transparent;
		padding: 10px 18px;
		font-size: 0.875rem;
		font-weight: 700;
		color: #5e6b6a;
		cursor: pointer;
		border-radius: 8px 8px 0 0;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	.tab-btn:hover {
		color: #004851;
		background: rgba(0, 72, 81, 0.05);
	}

	.tab-btn-active {
		color: #ffffff !important;
		background: #004851 !important;
	}

	.report-actions-bar {
		margin-bottom: 16px;
		display: flex;
		justify-content: flex-end;
	}

	:global(.export-action-btn) {
		background: #004851 !important;
		color: #ffffff !important;
		border-radius: 8px !important;
	}

	@media (max-width: 960px) {
		.terminal-main-layout {
			grid-template-columns: 1fr;
			padding: 16px;
		}

		.desktop-sidebar {
			display: none;
		}
	}

	:global(.dark) .terminal-main-layout {
		background: #0b1120;
	}

	:global(.dark) .tabs-nav {
		border-bottom-color: #26334e;
	}

	:global(.dark) .tab-btn {
		color: #a3b0c6;
	}

	:global(.dark) .tab-btn:hover {
		color: #7fd1d8;
		background: rgba(127, 209, 216, 0.08);
	}

	:global(.dark) .tab-btn-active {
		background: #7fd1d8 !important;
		color: #0b1120 !important;
	}

	:global(.dark) :global(.export-action-btn) {
		background: #7fd1d8 !important;
		color: #0b1120 !important;
	}

	.boundary-recovery-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		background: #f5f7f6;
	}

	.recovery-card {
		background: #ffffff;
		border: 1px solid #d5dedc;
		border-radius: 16px;
		max-width: 480px;
		padding: 28px;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.recovery-badge {
		font-size: 0.75rem;
		font-weight: 700;
		color: #c5221f;
		background: #fce8e6;
		padding: 4px 10px;
		border-radius: 9999px;
		width: fit-content;
	}

	.recovery-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 800;
		color: #14201f;
	}

	.recovery-desc {
		margin: 0;
		font-size: 0.875rem;
		color: #5e6b6a;
		line-height: 1.5;
	}

	.recovery-error-detail {
		background: #f6f8fb;
		padding: 10px 12px;
		border-radius: 8px;
		border: 1px solid #edf2f0;
		font-size: 0.75rem;
		color: #c5221f;
		word-break: break-all;
	}

	.recovery-actions {
		display: flex;
		gap: 10px;
		margin-top: 6px;
	}

	.recovery-btn {
		flex: 1;
		appearance: none;
		border: none;
		padding: 10px 14px;
		border-radius: 8px;
		font-size: 0.8125rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.recovery-btn-primary {
		background: #004851;
		color: #ffffff;
	}

	.recovery-btn-secondary {
		background: #edf2f0;
		color: #14201f;
	}

	:global(.dark) .boundary-recovery-container {
		background: #0b1120;
	}

	:global(.dark) .recovery-card {
		background: #131c30;
		border-color: #26334e;
	}

	:global(.dark) .recovery-title {
		color: #e7eef8;
	}

	:global(.dark) .recovery-desc {
		color: #a3b0c6;
	}

	:global(.dark) .recovery-error-detail {
		background: #0b1120;
		border-color: #26334e;
	}

	:global(.dark) .recovery-btn-primary {
		background: #7fd1d8;
		color: #0b1120;
	}

	:global(.dark) .recovery-btn-secondary {
		background: #1e293b;
		color: #e7eef8;
	}
</style>
