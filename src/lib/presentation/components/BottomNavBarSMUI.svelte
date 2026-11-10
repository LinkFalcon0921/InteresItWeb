<script lang="ts">
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import { NavigationTab } from '../enums/NavigationTab';

	interface Props {
		state: SimulatorState;
	}

	let { state }: Props = $props();

	interface NavItem {
		readonly id: NavigationTab;
		readonly label: string;
		readonly icon: string;
		readonly testId: string;
	}

	const navItems: readonly NavItem[] = [
		{
			id: NavigationTab.Simulador,
			label: 'Simulador',
			icon: '📊',
			testId: 'bottom-nav-simulador'
		},
		{
			id: NavigationTab.Comparativa,
			label: 'Comparativa',
			icon: '⚖️',
			testId: 'bottom-nav-comparativa'
		},
		{
			id: NavigationTab.Reporte,
			label: 'Reporte',
			icon: '📋',
			testId: 'bottom-nav-reporte'
		}
	];

	function selectTab(tabId: NavigationTab): void {
		state.activeTab = tabId;
		if (typeof window !== 'undefined') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function toggleParameters(): void {
		state.isDrawerOpen = !state.isDrawerOpen;
	}
</script>

<nav class="bottom-nav-bar" aria-label="Navegación inferior táctil">
	<div class="bottom-nav-content">
		{#each navItems as item (item.id)}
			{@const isActive = state.activeTab === item.id}
			<button
				type="button"
				class="nav-item-btn"
				class:nav-item-active={isActive}
				id={item.testId}
				aria-pressed={isActive}
				aria-label={item.label}
				onclick={() => selectTab(item.id)}
			>
				<span class="nav-icon-indicator" aria-hidden="true">
					<span class="nav-icon">{item.icon}</span>
				</span>
				<span class="nav-label">{item.label}</span>
			</button>
		{/each}

		<button
			type="button"
			class="nav-item-btn nav-item-params"
			class:nav-item-active={state.isDrawerOpen}
			id="bottom-nav-params"
			aria-label="Abrir panel de parámetros"
			aria-expanded={state.isDrawerOpen}
			onclick={toggleParameters}
		>
			<span class="nav-icon-indicator nav-icon-indicator--accent" aria-hidden="true">
				<span class="nav-icon">⚙️</span>
			</span>
			<span class="nav-label">Parámetros</span>
		</button>
	</div>
</nav>

<style>
	.bottom-nav-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 75;
		background: #ffffff;
		border-top: 1px solid #d5dedc;
		box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
		padding-bottom: max(6px, env(safe-area-inset-bottom));
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		user-select: none;
	}

	@media (min-width: 1024px) {
		.bottom-nav-bar {
			display: none !important;
		}
	}

	.bottom-nav-content {
		max-width: 800px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		align-items: center;
		height: 58px;
		padding: 0 4px;
	}

	.nav-item-btn {
		appearance: none;
		border: none;
		background: transparent;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		height: 100%;
		padding: 4px 2px;
		cursor: pointer;
		color: #5e6b6a;
		transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
		min-width: 44px;
		min-height: 48px;
		border-radius: 8px;
	}

	.nav-item-btn:hover {
		color: #004851;
	}

	.nav-icon-indicator {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 28px;
		border-radius: 14px;
		transition: all 0.25s cubic-bezier(0.2, 0, 0, 1);
	}

	.nav-icon {
		font-size: 1.15rem;
		line-height: 1;
	}

	.nav-label {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.01em;
		transition: color 0.2s ease;
	}

	.nav-item-active .nav-icon-indicator {
		background: #d7ebec;
		transform: scale(1.05);
	}

	.nav-item-active {
		color: #004851;
	}

	.nav-item-active .nav-label {
		font-weight: 800;
		color: #004851;
	}

	.nav-item-params .nav-icon-indicator--accent {
		background: rgba(0, 72, 81, 0.06);
	}

	.nav-item-params.nav-item-active .nav-icon-indicator--accent {
		background: #10b981;
		color: #ffffff;
	}

	:global(html.dark) .bottom-nav-bar,
	:global(.dark) .bottom-nav-bar {
		background: #0f172a;
		border-top-color: #26334e;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.35);
	}

	:global(html.dark) .nav-item-btn,
	:global(.dark) .nav-item-btn {
		color: #94a3b8;
	}

	:global(html.dark) .nav-item-btn:hover,
	:global(.dark) .nav-item-btn:hover {
		color: #7fd1d8;
	}

	:global(html.dark) .nav-item-active,
	:global(.dark) .nav-item-active {
		color: #7fd1d8;
	}

	:global(html.dark) .nav-item-active .nav-icon-indicator,
	:global(.dark) .nav-item-active .nav-icon-indicator {
		background: #1e3a47;
	}

	:global(html.dark) .nav-item-active .nav-label,
	:global(.dark) .nav-item-active .nav-label {
		color: #7fd1d8;
	}

	:global(html.dark) .nav-item-params.nav-item-active .nav-icon-indicator--accent,
	:global(.dark) .nav-item-params.nav-item-active .nav-icon-indicator--accent {
		background: #10b981;
	}

	@media print {
		.bottom-nav-bar {
			display: none !important;
		}
	}
</style>
