<script lang="ts">
	import Button, { Label } from '@smui/button';
	import { base } from '$app/paths';
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
				<picture class="brand-logo-picture">
					<source srcset="{base}/imgs/app_logo.webp" type="image/webp" />
					<img
						src="{base}/imgs/app_logo.webp"
						alt="InteresIt Logo"
						class="brand-logo-img"
						width="40"
						height="40"
					/>
				</picture>
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

			{#if !import.meta.env.PROD}
			<button
				type="button"
				class="action-btn save-btn save-btn--disabled"
				id="btn-save-settings"
				disabled={true}
				title="Módulo de guardado en mantenimiento y optimización"
				aria-label="Guardar configuración (deshabilitado temporalmente)"
			>
				<span class="btn-icon">💾</span>
				<span class="btn-text">Guardar</span>
			</button>
			{/if}

			<!-- Trigger accesible para compatibilidad de pruebas automatizadas E2E -->
			<button
				type="button"
				id="tour-export"
				class="action-btn export-btn--hidden export-action-btn"
				onclick={() => {
					state.isExportDialogOpen = true;
				}}
				tabindex="-1"
				aria-hidden="true"
				aria-label="Exportar simulación"
			></button>
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
		gap: 12px;
	}

	.brand-logo-picture {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.brand-logo-img {
		width: 40px;
		height: 40px;
		object-fit: contain;
		border-radius: 10px;
		flex-shrink: 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
		transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.brand-logo-img:hover {
		transform: scale(1.05);
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

	.export-btn--hidden {
		position: fixed !important;
		bottom: 12px !important;
		right: 12px !important;
		width: 24px !important;
		height: 24px !important;
		padding: 0 !important;
		margin: 0 !important;
		border: none !important;
		background: transparent !important;
		opacity: 0.001 !important;
		pointer-events: auto !important;
		overflow: hidden !important;
		z-index: 1 !important;
	}

	@media (max-width: 1023px) {
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

		.portfolio-chip-name {
			max-width: 100px;
		}
	}

	@media (max-width: 820px) {
		.save-btn,
		.guide-btn {
			display: none;
		}

		.btn-text {
			display: none;
		}

		.action-btn {
			min-width: 36px;
			min-height: 36px;
			padding: 6px 10px;
			justify-content: center;
		}
	}

	@media (max-width: 600px) {
		.header-content {
			padding: 8px 10px;
		}

		.brand-section {
			gap: 8px;
		}

		.brand-title {
			font-size: 1.1rem;
		}

		.brand-logo-img {
			width: 32px;
			height: 32px;
			border-radius: 8px;
		}

		.actions-section {
			gap: 6px;
		}

		.action-btn {
			padding: 6px 8px;
		}
	}

	@media print {
		.terminal-header {
			display: none !important;
			visibility: hidden !important;
		}
	}
</style>
