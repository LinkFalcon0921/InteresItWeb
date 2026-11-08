<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg' | number;
		color?: string;
		class?: string;
		'aria-label'?: string;
	}

	let {
		size = 'md',
		color = '#10b981',
		class: className = '',
		'aria-label': ariaLabel = 'Cargando...'
	}: Props = $props();

	const pixelSize = $derived(
		typeof size === 'number' ? size : size === 'sm' ? 18 : size === 'lg' ? 48 : 32
	);
	const strokeWidth = $derived(pixelSize <= 20 ? 3 : pixelSize <= 36 ? 3.5 : 4);
</script>

<div
	class="app-spinner-container {className}"
	role="progressbar"
	aria-label={ariaLabel}
	style="width: {pixelSize}px; height: {pixelSize}px;"
>
	<svg class="app-spinner-svg" viewBox="0 0 50 50" style="stroke: {color};">
		<circle
			class="app-spinner-circle"
			cx="25"
			cy="25"
			r="20"
			fill="none"
			stroke-width={strokeWidth}
		/>
	</svg>
</div>

<style>
	.app-spinner-container {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		vertical-align: middle;
		flex-shrink: 0;
	}

	.app-spinner-svg {
		animation: app-spinner-rotate 1.4s linear infinite;
		width: 100%;
		height: 100%;
		transform-origin: center center;
	}

	.app-spinner-circle {
		stroke-linecap: round;
		animation: app-spinner-dash 1.4s ease-in-out infinite;
	}

	@keyframes app-spinner-rotate {
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes app-spinner-dash {
		0% {
			stroke-dasharray: 1, 150;
			stroke-dashoffset: 0;
		}
		50% {
			stroke-dasharray: 90, 150;
			stroke-dashoffset: -35;
		}
		100% {
			stroke-dasharray: 90, 150;
			stroke-dashoffset: -124;
		}
	}
</style>
