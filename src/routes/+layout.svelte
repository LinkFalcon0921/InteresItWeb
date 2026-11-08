<script lang="ts">
	import '@fontsource/public-sans/400.css';
	import '@fontsource/public-sans/600.css';
	import '@fontsource/public-sans/700.css';
	import { createAppContainer, setContainerContext } from '$di';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();

	const container = createAppContainer();
	setContainerContext(container);
</script>

{@render children?.()}

<style>
	:global(.mdc-snackbar) {
		position: fixed !important;
		bottom: 24px !important;
		left: 0 !important;
		right: 0 !important;
		display: none;
		align-items: center !important;
		justify-content: center !important;
		box-sizing: border-box !important;
		pointer-events: none !important;
		z-index: 1000 !important;
		margin: 0 auto !important;
	}

	:global(.mdc-snackbar:not(.mdc-snackbar--open):not(.mdc-snackbar--opening):not(.mdc-snackbar--closing)) {
		display: none !important;
		visibility: hidden !important;
		pointer-events: none !important;
	}

	:global(.mdc-snackbar--open),
	:global(.mdc-snackbar--opening),
	:global(.mdc-snackbar--closing) {
		display: flex !important;
		visibility: visible !important;
	}

	:global(.mdc-snackbar__surface) {
		background: #0f172a !important;
		color: #ffffff !important;
		border-radius: 12px !important;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35) !important;
		border: 1px solid rgba(255, 255, 255, 0.12) !important;
		padding: 6px 16px !important;
		min-width: 320px !important;
		max-width: 560px !important;
		pointer-events: auto !important;
		display: flex !important;
		align-items: center !important;
		justify-content: space-between !important;
	}

	:global(.mdc-snackbar__label) {
		font-family: inherit !important;
		font-size: 0.875rem !important;
		font-weight: 600 !important;
		color: #f1f5f9 !important;
		padding: 8px 12px 8px 0 !important;
		margin: 0 !important;
		visibility: visible !important;
	}

	:global(.mdc-snackbar__actions) {
		display: flex !important;
		align-items: center !important;
		flex-shrink: 0 !important;
		visibility: visible !important;
	}

	:global(.mdc-snackbar__action) {
		color: #10b981 !important;
		font-family: inherit !important;
		font-weight: 700 !important;
		text-transform: none !important;
		font-size: 0.8125rem !important;
		cursor: pointer !important;
		min-height: 36px !important;
		padding: 6px 12px !important;
		border-radius: 6px !important;
		transition: background 0.15s ease !important;
	}

	:global(.mdc-snackbar__action:hover) {
		background: rgba(16, 185, 129, 0.15) !important;
	}

	:global(.dark) :global(.mdc-snackbar__surface) {
		background: #1e293b !important;
		border-color: rgba(16, 185, 129, 0.35) !important;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.65) !important;
	}

	:global(.dark) :global(.mdc-snackbar__label) {
		color: #e7eef8 !important;
	}

	:global(.dark) :global(.mdc-snackbar__action) {
		color: #34d399 !important;
	}

	:global(.dark) :global(.mdc-snackbar__action:hover) {
		background: rgba(52, 211, 153, 0.2) !important;
	}
</style>
