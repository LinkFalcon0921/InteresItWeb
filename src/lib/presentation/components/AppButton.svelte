<script lang="ts">
	import Button, { Label } from '@smui/button';
	import type { Snippet } from 'svelte';
	import './AppButton.css';

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
