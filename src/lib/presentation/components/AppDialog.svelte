<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		subtitle?: string;
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
		class="app-dialog-backdrop"
		onclick={(e) => {
			if (e.target === e.currentTarget) {
				onclose();
			}
		}}
		role="presentation"
	>
		<div
			class="app-dialog-card modal-card"
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			style="max-width: {maxWidth};"
		>
			<header class="app-dialog-header modal-header">
				<div class="app-dialog-title-group">
					<h2 class="app-dialog-title modal-title" id={titleId}>{title}</h2>
					{#if subtitle}
						<span class="app-dialog-subtitle">{subtitle}</span>
					{/if}
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

			<div class="app-dialog-body modal-body">
				{@render children?.()}
			</div>

			{#if actions}
				<footer class="app-dialog-actions modal-actions modal-footer">
					{@render actions()}
				</footer>
			{/if}
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
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: 16px;
	}

	.app-dialog-card {
		background: #ffffff;
		border-radius: 16px;
		width: 100%;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
		overflow: hidden;
		border: 1px solid #d5dedc;
		display: flex;
		flex-direction: column;
		max-height: 90vh;
	}

	.app-dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid #edf2f0;
	}

	.app-dialog-title {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 800;
		color: #14201f;
		letter-spacing: -0.01em;
	}

	.app-dialog-subtitle {
		display: block;
		font-size: 0.75rem;
		color: #5e6b6a;
		font-weight: 500;
		margin-top: 2px;
	}

	.app-dialog-close-btn {
		appearance: none;
		border: none;
		background: transparent;
		font-size: 1.15rem;
		cursor: pointer;
		color: #5e6b6a;
		padding: 6px 10px;
		min-width: 36px;
		min-height: 36px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
	}

	.app-dialog-close-btn:hover {
		background: rgba(0, 0, 0, 0.05);
		color: #14201f;
	}

	.app-dialog-body {
		padding: 20px;
		overflow-y: auto;
		flex: 1;
	}

	.app-dialog-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 12px;
		padding: 14px 20px;
		border-top: 1px solid #edf2f0;
		background: #fbfdfc;
	}

	:global(html.dark) .app-dialog-card {
		background: #131c30;
		border-color: #26334e;
	}

	:global(html.dark) .app-dialog-header,
	:global(html.dark) .app-dialog-actions {
		border-color: #26334e;
	}

	:global(html.dark) .app-dialog-actions {
		background: #0f172a;
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

	@media print {
		.app-dialog-backdrop,
		.app-dialog-card {
			display: none !important;
			visibility: hidden !important;
		}
	}
</style>
