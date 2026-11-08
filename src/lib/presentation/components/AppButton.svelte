<script lang="ts">
	import Button, { Label } from '@smui/button';
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'text' | 'icon';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		class?: string;
		id?: string;
		title?: string;
		'aria-label'?: string;
		onclick?: (event: MouseEvent) => void | Promise<void>;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		type = 'button',
		disabled = false,
		class: className = '',
		id,
		title,
		'aria-label': ariaLabel,
		onclick,
		children
	}: Props = $props();

	const smuiVariant = $derived(
		variant === 'primary' ? 'raised' : variant === 'secondary' ? 'outlined' : 'text'
	);
</script>

<Button
	variant={smuiVariant}
	{type}
	{disabled}
	{id}
	{title}
	aria-label={ariaLabel}
	{onclick}
	class="app-btn app-btn--{variant} {className}"
>
	{#if children}
		<Label>
			{@render children()}
		</Label>
	{/if}
</Button>

<style>
	:global(.app-btn) {
		min-height: 38px !important;
		box-sizing: border-box !important;
		display: inline-flex !important;
		align-items: center !important;
		justify-content: center !important;
		border-radius: 8px !important;
		font-family: inherit !important;
		font-weight: 600 !important;
		letter-spacing: 0.01em !important;
		text-transform: none !important;
		padding: 7px 16px !important;
		transition: all 0.2s ease !important;
	}

	:global(.app-btn--primary) {
		background-color: #004851 !important;
		color: #ffffff !important;
	}

	:global(.app-btn--primary:hover:not(:disabled)) {
		background-color: #00363d !important;
	}

	:global(.app-btn--secondary) {
		border: 1px solid #004851 !important;
		color: #004851 !important;
		background-color: transparent !important;
	}

	:global(.app-btn--secondary:hover:not(:disabled)) {
		background-color: rgba(0, 72, 81, 0.08) !important;
	}

	:global(.app-btn--text) {
		color: #004851 !important;
		background-color: transparent !important;
	}

	:global(.app-btn--text:hover:not(:disabled)) {
		background-color: rgba(0, 72, 81, 0.06) !important;
	}

	:global(.app-btn:disabled) {
		opacity: 0.55 !important;
		cursor: not-allowed !important;
	}

	:global(html.dark .app-btn--primary) {
		background-color: #7fd1d8 !important;
		color: #0b1120 !important;
	}

	:global(html.dark .app-btn--primary:hover:not(:disabled)) {
		background-color: #9fe2e7 !important;
	}

	:global(html.dark .app-btn--secondary) {
		border-color: #7fd1d8 !important;
		color: #7fd1d8 !important;
	}

	:global(html.dark .app-btn--secondary:hover:not(:disabled)) {
		background-color: rgba(127, 209, 216, 0.12) !important;
	}

	:global(html.dark .app-btn--text) {
		color: #7fd1d8 !important;
	}

	@media (max-width: 600px) {
		:global(.app-btn) {
			min-height: 40px !important;
		}
	}
</style>
