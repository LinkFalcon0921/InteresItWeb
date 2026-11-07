<script lang="ts">
	import '@fontsource/public-sans/400.css';
	import '@fontsource/public-sans/600.css';
	import '@fontsource/public-sans/700.css';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

{@render children?.()}
