<script lang="ts">
	import { onMount } from 'svelte';
	import Snackbar, { Actions, Label } from '@smui/snackbar';
	import Button from '@smui/button';
	import { createSimulatorState } from '$di';
	import {
		DataEntrySMUI,
		ExportDialogSMUI,
		HeaderSMUI,
		HeroCardSMUI,
		ParametersDrawerSMUI,
		PairComparisonSMUI,
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

<div class="terminal-shell">
	<HeaderSMUI state={simState} />

	<div class="terminal-main-layout">
		<!-- Panel Lateral de Parámetros (Desktop) -->
		<aside class="desktop-sidebar" aria-label="Parámetros de Simulación">
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

			<HeroCardSMUI state={simState} />

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
						<ScenarioListSMUI state={simState} />
						<ProjectionTableSMUI state={simState} />
					</div>
				{:else if simState.activeTab === 'comparativa'}
					<div id="panel-comparativa" role="tabpanel" tabindex="0" aria-labelledby="tab-comparativa">
						<PairComparisonSMUI state={simState} />
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
		isOpen={isExportDialogOpen}
		onClose={() => {
			isExportDialogOpen = false;
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
</style>
