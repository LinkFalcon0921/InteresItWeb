<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		subtitle?: string;
		icon?: string;
		maxWidth?: string;
		titleId?: string;
		onclose: () => void;
		children?: Snippet;
		actions?: Snippet;
	}

	let {
		open,
		title,
		subtitle,
		icon,
		maxWidth = '540px',
		titleId = 'app-dialog-title',
		onclose,
		children,
		actions
	}: Props = $props();

	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'Escape' && open) {
			e.preventDefault();
			onclose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="app-dialog-backdrop mdc-dialog mdc-dialog--open"
		onclick={(e) => {
			if (e.target === e.currentTarget) {
				onclose();
			}
		}}
		role="presentation"
	>
		<div class="mdc-dialog__scrim app-dialog-scrim"></div>
		<div class="mdc-dialog__container app-dialog-container">
			<div
				class="app-dialog-card modal-card mdc-dialog__surface"
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				style="max-width: {maxWidth};"
			>
				<header class="app-dialog-header modal-header mdc-dialog__header">
					<div class="app-dialog-title-group">
						{#if icon}
							<span class="app-dialog-icon" aria-hidden="true">{icon}</span>
						{/if}
						<div>
							<h2 class="app-dialog-title modal-title mdc-dialog__title" id={titleId}>{title}</h2>
							{#if subtitle}
								<span class="app-dialog-subtitle">{subtitle}</span>
							{/if}
						</div>
					</div>
					<button
						type="button"
						class="app-dialog-close-btn close-btn"
						onclick={onclose}
						aria-label="Cerrar diálogo"
					>
						✕
					</button>
				</header>

				<div class="app-dialog-body modal-body mdc-dialog__content">
					{@render children?.()}
				</div>

				{#if actions}
					<footer class="app-dialog-actions modal-actions modal-footer mdc-dialog__actions">
						{@render actions()}
					</footer>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.app-dialog-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(15, 23, 42, 0.65);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 16px;
		animation: dialog-fade-in 0.2s cubic-bezier(0, 0, 0.2, 1);
	}

	.app-dialog-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		max-height: 100%;
	}

	.app-dialog-card {
		background: #ffffff;
		border-radius: 18px;
		width: 100%;
		box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(0, 0, 0, 0.05);
		overflow: hidden;
		border: 1px solid #d5dedc;
		display: flex;
		flex-direction: column;
		max-height: calc(100vh - 32px);
		animation: dialog-scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.app-dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18px 24px;
		border-bottom: 1px solid #edf2f0;
		background: #fafcfb;
	}

	.app-dialog-title-group {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.app-dialog-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		border-radius: 10px;
		background: rgba(0, 72, 81, 0.08);
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.app-dialog-title {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 800;
		color: #14201f;
		letter-spacing: -0.015em;
		line-height: 1.25;
	}

	.app-dialog-subtitle {
		display: block;
		font-size: 0.75rem;
		color: #5e6b6a;
		font-weight: 500;
		margin-top: 3px;
	}

	.app-dialog-close-btn {
		appearance: none;
		border: none;
		background: transparent;
		font-size: 1.15rem;
		cursor: pointer;
		color: #5e6b6a;
		padding: 6px;
		min-width: 36px;
		min-height: 36px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		transition: all 0.15s ease;
	}

	.app-dialog-close-btn:hover {
		background: rgba(0, 0, 0, 0.06);
		color: #14201f;
	}

	.app-dialog-body {
		padding: 22px 24px;
		overflow-y: auto;
		flex: 1;
		color: #2e3b3a;
	}

	.app-dialog-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;
		padding: 16px 24px;
		border-top: 1px solid #edf2f0;
		background: #fbfdfc;
	}

	:global(html.dark) .app-dialog-backdrop {
		background: rgba(3, 7, 18, 0.75);
	}

	:global(html.dark) .app-dialog-card {
		background: #131c30;
		border-color: #26334e;
		box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.06);
	}

	:global(html.dark) .app-dialog-header {
		background: #0f172a;
		border-color: #26334e;
	}

	:global(html.dark) .app-dialog-icon {
		background: rgba(127, 209, 216, 0.12);
	}

	:global(html.dark) .app-dialog-actions {
		background: #0b1120;
		border-color: #26334e;
	}

	:global(html.dark) .app-dialog-title {
		color: #e7eef8;
	}

	:global(html.dark) .app-dialog-subtitle {
		color: #a3b0c6;
	}

	:global(html.dark) .app-dialog-close-btn {
		color: #a3b0c6;
	}

	:global(html.dark) .app-dialog-close-btn:hover {
		background: rgba(255, 255, 255, 0.08);
		color: #e7eef8;
	}

	:global(html.dark) .app-dialog-body {
		color: #cbd5e1;
	}

	@keyframes dialog-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes dialog-scale-in {
		from {
			opacity: 0;
			transform: scale(0.96) translateY(6px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	@media print {
		.app-dialog-backdrop,
		.app-dialog-container,
		.app-dialog-card,
		:global(.mdc-dialog),
		:global(.mdc-dialog__scrim) {
			display: none !important;
			visibility: hidden !important;
		}
	}
</style>
