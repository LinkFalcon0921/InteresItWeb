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
	/* Material Design 3 (M3) Expressive Motion Tokens */
	:global(:root) {
		--m3-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
		--m3-sys-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
		--m3-sys-motion-easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
		--m3-sys-motion-easing-emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
		--m3-sys-motion-easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
		--m3-sys-motion-duration-short: 200ms;
		--m3-sys-motion-duration-medium: 350ms;
		--m3-sys-motion-duration-long: 500ms;
	}

	/* Scrollbars Modernos y Fluidos (Light & Dark) */
	:global(*) {
		scrollbar-width: thin;
		scrollbar-color: #cbd5e1 transparent;
	}

	:global(::-webkit-scrollbar) {
		width: 7px;
		height: 7px;
	}

	:global(::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(::-webkit-scrollbar-thumb) {
		background: #cbd5e1;
		border-radius: 9999px;
		border: 1px solid transparent;
		background-clip: padding-box;
		transition: background-color 0.2s ease;
	}

	:global(::-webkit-scrollbar-thumb:hover) {
		background: #10b981;
	}

	:global(html.dark *) {
		scrollbar-color: #334155 transparent;
	}

	:global(html.dark ::-webkit-scrollbar-thumb) {
		background: #334155;
	}

	:global(html.dark ::-webkit-scrollbar-thumb:hover) {
		background: #10b981;
	}

	/* Ocultar flechas nativas toscas de inputs de tipo number */
	:global(input[type='number']::-webkit-inner-spin-button),
	:global(input[type='number']::-webkit-outer-spin-button) {
		-webkit-appearance: none;
		margin: 0;
	}

	:global(input[type='number']) {
		-moz-appearance: textfield;
		appearance: textfield;
	}

	/* Material Design Snackbar */
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
