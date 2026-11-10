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
		BottomNavBarSMUI,
		NavigationTab,
		ResponsiveBreakpoint,
		PairComparisonSMUI,
		PortfolioDialogSMUI,
		ProjectionTableSMUI,
		ScenarioListSMUI
	} from '$presentation';

	const simState = createSimulatorState();

	// PATRÓN ELEGIDO PARA UI-001/UI-002: (b) Montaje condicional responsivo con matchMedia.
	// Garantiza exactamente UNA sola instancia de DataEntrySMUI en el DOM en cualquier momento:
	// - Desktop (>=1200px): DataEntrySMUI se monta en <aside class="desktop-sidebar">. ParametersDrawerSMUI no se monta.
	// - Móvil, Foldable y Tablet (<1200px): <aside class="desktop-sidebar"> no monta DataEntrySMUI. ParametersDrawerSMUI monta DataEntrySMUI
	//   únicamente cuando state.isDrawerOpen es true. Con el drawer cerrado, reachable inputs = 0.
	// - Al redimensionar entre viewports, los valores se preservan 100% íntegros a través de SimulatorState.
	let isDesktop = $state(
		typeof window !== 'undefined' ? window.innerWidth >= ResponsiveBreakpoint.Desktop : true
	);

	let isExportDialogOpen = $state(false);
	let snackbar: Snackbar | null = $state(null);

	onMount(() => {
		if (typeof window !== 'undefined') {
			const mql = window.matchMedia(`(min-width: ${ResponsiveBreakpoint.Desktop}px)`);
			const updateLayout = () => {
				const desktopNow = window.innerWidth >= ResponsiveBreakpoint.Desktop;
				isDesktop = desktopNow;
				if (desktopNow && simState.isDrawerOpen) {
					simState.isDrawerOpen = false;
				}
			};
			simState.syncThemeToDom();
			updateLayout();
			mql.addEventListener('change', updateLayout);
			window.addEventListener('resize', updateLayout);

			void (async () => {
				if (window.location.hash.includes('#sim=')) {
					simState.loadFromUrlHash(window.location.hash);
				} else {
					await simState.loadFromStorage();
					simState.syncThemeToDom();
				}
			})();

			return () => {
				mql.removeEventListener('change', updateLayout);
				window.removeEventListener('resize', updateLayout);
			};
		}
	});

	function handleHashChange(): void {
		if (typeof window !== 'undefined' && window.location.hash.includes('#sim=')) {
			simState.loadFromUrlHash(window.location.hash);
		}
	}

	$effect(() => {
		if (simState.saveNotificationVisible && snackbar) {
			snackbar.open();
			simState.saveNotificationVisible = false;
		}
	});

	interface TabDefinition {
		readonly id: NavigationTab;
		readonly label: string;
		readonly icon: string;
	}
	const tabs: readonly TabDefinition[] = [
		{ id: NavigationTab.Simulador, label: 'Simulador', icon: '📊' },
		{ id: NavigationTab.Comparativa, label: 'Rendimientos Comparados', icon: '⚖️' },
		{ id: NavigationTab.Reporte, label: 'Tabla de Proyección', icon: '📋' }
	];
</script>

<svelte:window onhashchange={handleHashChange} />

<svelte:head>
	<title>InteresIt — Terminal Financiera Multi-Escenario</title>
</svelte:head>

<svelte:boundary>
	<div class="terminal-shell">
		<HeaderSMUI state={simState} />

	<div class="terminal-main-layout">
		<!-- Panel Lateral de Parámetros (Desktop) -->
		<aside id="tour-data" class="desktop-sidebar" aria-label="Parámetros de Simulación">
			{#if isDesktop}
				<DataEntrySMUI state={simState} />
			{/if}
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
						onclick={(e) => {
							simState.activeTab = tab.id;
							(e.currentTarget as HTMLElement)?.scrollIntoView({
								behavior: 'smooth',
								inline: 'center',
								block: 'nearest'
							});
						}}
					>
						<span class="tab-icon">{tab.icon}</span>
						<span>{tab.label}</span>
					</button>
				{/each}
			</div>

			<!-- Contenido de las Pestañas -->
			<div class="tab-panels">
				{#if simState.activeTab === NavigationTab.Simulador}
					<div id="panel-simulador" role="tabpanel" tabindex="0" aria-labelledby="tab-simulador" class="tab-panel-animated">
						<div id="tour-scenarios">
							<ScenarioListSMUI state={simState} />
						</div>
						<div id="tour-table">
							<ProjectionTableSMUI state={simState} />
						</div>
					</div>
				{:else if simState.activeTab === NavigationTab.Comparativa}
					<div id="panel-comparativa" role="tabpanel" tabindex="0" aria-labelledby="tab-comparativa" class="tab-panel-animated">
						<div id="tour-pairs">
							<PairComparisonSMUI state={simState} />
						</div>
						<ScenarioListSMUI state={simState} />
					</div>
				{:else if simState.activeTab === NavigationTab.Reporte}
					<div id="panel-reporte" role="tabpanel" tabindex="0" aria-labelledby="tab-reporte" class="tab-panel-animated">
						<ProjectionTableSMUI state={simState} />
					</div>
				{/if}
			</div>
		</main>
	</div>

	<!-- Drawer Móvil de Parámetros -->
	<ParametersDrawerSMUI state={simState} />
	<BottomNavBarSMUI state={simState} />

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
	:global(html),
	:global(body) {
		min-height: 100%;
		width: 100%;
		margin: 0;
		padding: 0;
		background: #f5f7f6;
		color: #14201f;
		font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		-webkit-font-smoothing: antialiased;
	}

	:global(body.dark),
	:global(html.dark),
	:global(html.dark body) {
		background: #0b1120 !important;
		color: #e7eef8 !important;
	}

	.terminal-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 100vw;
		overflow-x: hidden;
		background: #f5f7f6;
		color: #14201f;
	}

	:global(html.dark) .terminal-shell,
	:global(.dark) .terminal-shell {
		background: #0b1120 !important;
		color: #e7eef8 !important;
	}

	.terminal-main-layout {
		max-width: 1440px;
		margin: 0 auto;
		width: 100%;
		box-sizing: border-box;
		padding: 20px 20px 48px 20px;
		display: grid;
		grid-template-columns: 340px 1fr;
		gap: 24px;
		align-items: start;
		flex: 1 0 auto;
	}

	.desktop-sidebar {
		position: sticky;
		top: 76px;
		z-index: 20;
		max-height: calc(100vh - 96px);
		overflow-y: auto;
		padding-right: 6px;
		box-sizing: border-box;
		scrollbar-width: thin;
		scrollbar-color: #cbd5e1 transparent;
	}

	.desktop-sidebar::-webkit-scrollbar {
		width: 6px;
	}

	.desktop-sidebar::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 9999px;
	}

	:global(html.dark) .desktop-sidebar,
	:global(.dark) .desktop-sidebar {
		scrollbar-color: #334155 transparent;
	}

	:global(html.dark) .desktop-sidebar::-webkit-scrollbar-thumb,
	:global(.dark) .desktop-sidebar::-webkit-scrollbar-thumb {
		background: #334155;
	}

	.workspace-area {
		min-width: 0;
		overflow: visible;
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
		scroll-behavior: smooth;
		scrollbar-width: none;
	}

	.tabs-nav::-webkit-scrollbar {
		display: none;
	}

	@media (min-width: 640px) {
		.tabs-nav {
			justify-content: center;
		}
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

	.tab-panel-animated {
		animation: m3-tab-enter 0.28s cubic-bezier(0.2, 0, 0, 1) both;
		will-change: transform, opacity;
	}

	@keyframes m3-tab-enter {
		from {
			opacity: 0;
			transform: translateX(12px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@media (min-width: 1024px) {
		:global(.parameters-drawer),
		:global(.drawer-scrim) {
			display: none !important;
			visibility: hidden !important;
			pointer-events: none !important;
		}
	}

	@media (max-width: 1023px) {
		.terminal-main-layout {
			grid-template-columns: 1fr;
			padding: 16px 16px 88px 16px;
		}

		.desktop-sidebar {
			display: none;
		}

		.workspace-area {
			padding-bottom: 0;
		}
	}

	:global(.dark) .terminal-main-layout { background: #0b1120; }
	:global(.dark) .tabs-nav { border-bottom-color: #26334e; }
	:global(.dark) .tab-btn { color: #a3b0c6; }
	:global(.dark) .tab-btn:hover { color: #7fd1d8; background: rgba(127, 209, 216, 0.08); }
	:global(.dark) .tab-btn-active { background: #7fd1d8 !important; color: #0b1120 !important; }

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

	:global(.dark) .boundary-recovery-container { background: #0b1120; }
	:global(.dark) .recovery-card { background: #131c30; border-color: #26334e; }
	:global(.dark) .recovery-title { color: #e7eef8; }
	:global(.dark) .recovery-desc { color: #a3b0c6; }
	:global(.dark) .recovery-error-detail { background: #0b1120; border-color: #26334e; }
	:global(.dark) .recovery-btn-primary { background: #7fd1d8; color: #0b1120; }
	:global(.dark) .recovery-btn-secondary { background: #1e293b; color: #e7eef8; }

	@media print {
		:global([role="dialog"]),
		:global(.mdc-dialog),
		:global(.mdc-dialog__scrim),
		:global(.mdc-drawer-scrim),
		:global(.drawer-scrim),
		:global(.parameters-drawer),
		:global(.modal-backdrop),
		:global(.modal-card),
		:global(.app-dialog-backdrop),
		:global(.app-dialog-card),
		:global(.terminal-header),
		:global(.tabs-nav),
		:global(.report-actions-bar),
		:global(.desktop-sidebar),
		:global(.mdc-snackbar) {
			display: none !important;
			visibility: hidden !important;
		}

		:global(body) {
			background: #ffffff !important;
			color: #000000 !important;
		}

		.terminal-main-layout {
			display: block !important;
			max-width: 100% !important;
			padding: 0 !important;
			margin: 0 !important;
		}

		.workspace-area {
			width: 100% !important;
		}
	}
</style>
