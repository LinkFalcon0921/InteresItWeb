<script lang="ts">
	import Button, { Label } from '@smui/button';
	import type { SimulatorState } from '../state/SimulatorState.svelte';

	interface Props {
		state: SimulatorState;
		onStartTour?: () => void;
	}

	let { state, onStartTour }: Props = $props();

	async function handleSave(): Promise<void> {
		await state.saveCurrentPortfolio();
	}

	async function handleExport(): Promise<void> {
		await state.exportPDF();
	}
</script>

<header class="terminal-header">
	<div class="header-content">
		<div class="brand-section">
			<button
				type="button"
				class="mobile-menu-btn"
				onclick={() => {
					state.isDrawerOpen = true;
				}}
				aria-label="Abrir panel de parámetros"
			>
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="3" y1="12" x2="21" y2="12"></line>
					<line x1="3" y1="6" x2="21" y2="6"></line>
					<line x1="3" y1="18" x2="21" y2="18"></line>
				</svg>
			</button>

			<div class="brand-logo">
				<div class="logo-badge">II</div>
				<div>
					<h1 class="brand-title">InteresIt</h1>
					<span class="brand-subtitle">Terminal Financiera Multi-Escenario</span>
				</div>
			</div>
		</div>

		<div class="actions-section">
			<button
				type="button"
				class="action-btn portfolio-btn"
				id="portfolio-manager-btn"
				onclick={() => {
					state.isPortfolioDialogOpen = true;
				}}
				title="Administrar y alternar portafolios guardados"
				aria-label="Administrar portafolios"
			>
				<span class="btn-icon">💼</span>
				<span class="btn-text portfolio-chip-name">{state.currentPortfolioName}</span>
			</button>

			{#if onStartTour}
				<button
					type="button"
					class="action-btn guide-btn"
					id="tour-guide-btn"
					onclick={() => onStartTour?.()}
					title="Iniciar recorrido guiado interactivo"
					aria-label="Iniciar guía interactiva"
				>
					<span class="btn-icon">❓</span>
					<span class="btn-text">Guía</span>
				</button>
			{/if}

			<button
				type="button"
				class="action-btn diag-btn"
				id="btn-open-diagnostics"
				onclick={() => {
					state.isDiagnosticsDialogOpen = true;
				}}
				title="Ver diagnóstico del sistema, Service Worker e IndexedDB"
				aria-label="Diagnóstico del sistema"
			>
				<span class="btn-icon">🩺</span>
				<span class="btn-text">Diagnóstico</span>
			</button>

			<button
				type="button"
				class="action-btn theme-toggle-btn"
				onclick={() => state.toggleTheme()}
				aria-label="Cambiar tema de color"
				title="Cambiar tema de color"
			>
				<span class="btn-icon">{state.isDarkMode ? '☀️' : '🌙'}</span>
				<span class="btn-text">{state.isDarkMode ? 'Claro' : 'Oscuro'}</span>
			</button>

			<button
				type="button"
				class="action-btn save-btn"
				onclick={handleSave}
				title="Guardar en almacenamiento local del navegador"
				aria-label="Guardar configuración"
			>
				<span class="btn-icon">💾</span>
				<span class="btn-text">Guardar</span>
			</button>

			<button
				type="button"
				class="action-btn export-btn"
				id="tour-export"
				onclick={() => {
					state.isExportDialogOpen = true;
				}}
				title="Exportación y Portabilidad (PDF, CSV, Copia de Seguridad)"
				aria-label="Exportar simulación"
			>
				<span class="btn-icon">📄</span>
				<span class="btn-text">Exportar</span>
			</button>
		</div>
	</div>
</header>

<style>
	.terminal-header {
		background: #004851;
		color: #ffffff;
		border-bottom: 1px solid rgba(255, 255, 255, 0.12);
		position: sticky;
		top: 0;
		z-index: 50;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		max-width: 100vw;
		box-sizing: border-box;
		overflow-x: hidden;
	}

	.header-content {
		max-width: 1440px;
		margin: 0 auto;
		padding: 10px 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.brand-section {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.mobile-menu-btn {
		display: none;
		background: transparent;
		border: none;
		color: #ffffff;
		cursor: pointer;
		padding: 6px;
		border-radius: 6px;
	}

	.brand-logo {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.logo-badge {
		background: #d7ebec;
		color: #00292e;
		font-weight: 900;
		font-size: 1.1rem;
		padding: 4px 8px;
		border-radius: 8px;
		letter-spacing: -0.05em;
	}

	.brand-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.brand-subtitle {
		display: block;
		font-size: 0.6875rem;
		opacity: 0.85;
		letter-spacing: 0.02em;
		font-weight: 500;
	}

	.actions-section {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.action-btn {
		appearance: none;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.08);
		color: #ffffff;
		border-radius: 9px;
		padding: 7px 13px;
		min-height: 36px;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 5px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
		user-select: none;
	}

	.action-btn:hover {
		background: rgba(255, 255, 255, 0.18);
		border-color: rgba(255, 255, 255, 0.38);
		transform: translateY(-1px);
		box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
	}

	.action-btn:active {
		transform: translateY(0);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
	}

	.portfolio-btn {
		background: rgba(16, 185, 129, 0.18);
		border-color: rgba(16, 185, 129, 0.4);
		color: #10b981;
	}

	.portfolio-btn:hover {
		background: rgba(16, 185, 129, 0.28);
		border-color: #10b981;
		color: #34d399;
	}

	.portfolio-chip-name {
		max-width: 140px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: inline-block;
		vertical-align: middle;
	}

	.guide-btn {
		background: rgba(246, 231, 195, 0.18);
		border-color: rgba(246, 231, 195, 0.4);
		color: #f6e7c3;
	}

	.guide-btn:hover {
		background: rgba(246, 231, 195, 0.3);
		border-color: #f6e7c3;
	}

	.export-btn {
		background: #d7ebec;
		color: #00292e;
		border-color: transparent;
		font-weight: 700;
	}

	.export-btn:hover {
		background: #bce1e4;
		box-shadow: 0 3px 10px rgba(0, 41, 46, 0.3);
	}

	@media (max-width: 960px) {
		.mobile-menu-btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			min-width: 40px;
			min-height: 40px;
		}

		.brand-subtitle {
			display: none;
		}
	}

	@media (max-width: 600px) {
		.save-btn,
		.guide-btn {
			display: none;
		}

		.btn-text {
			display: none;
		}

		.header-content {
			padding: 8px 10px;
		}

		.brand-section {
			gap: 8px;
		}

		.brand-title {
			font-size: 1.1rem;
		}

		.logo-badge {
			font-size: 0.95rem;
			padding: 3px 6px;
		}

		.actions-section {
			gap: 6px;
		}

		.action-btn {
			min-width: 36px;
			min-height: 36px;
			padding: 6px 8px;
			justify-content: center;
		}
	}

	@media print {
		.terminal-header {
			display: none !important;
			visibility: hidden !important;
		}
	}
</style>
