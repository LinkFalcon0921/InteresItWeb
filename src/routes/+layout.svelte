<script lang="ts">
	import '@fontsource/public-sans/400.css';
	import '@fontsource/public-sans/600.css';
	import '@fontsource/public-sans/700.css';
	import '../app.css';
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
