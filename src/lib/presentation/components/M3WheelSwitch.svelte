<script lang="ts">
	interface Props {
		checked?: boolean;
		offLabel?: string;
		onLabel?: string;
		id?: string;
		name?: string;
		ariaLabel?: string;
		disabled?: boolean;
		ontoggle?: (checked: boolean) => void;
	}

	let {
		checked = $bindable(false),
		offLabel = 'Normal',
		onLabel = 'Activo',
		id,
		name,
		ariaLabel,
		disabled = false,
		ontoggle
	}: Props = $props();

	let isSpinning = $state(false);

	function triggerSpin(): void {
		isSpinning = true;
		setTimeout(() => {
			isSpinning = false;
		}, 400);
	}

	function setChecked(value: boolean): void {
		if (disabled || checked === value) return;
		checked = value;
		triggerSpin();
		ontoggle?.(checked);
	}

	function toggle(): void {
		if (disabled) return;
		checked = !checked;
		triggerSpin();
		ontoggle?.(checked);
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (disabled) return;
		if (event.key === ' ' || event.key === 'Enter') {
			event.preventDefault();
			toggle();
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			setChecked(false);
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			setChecked(true);
		}
	}
</script>

<div
	class="m3-wheel-container"
	class:m3-wheel--checked={checked}
	class:m3-wheel--disabled={disabled}
	role="switch"
	aria-checked={checked}
	tabindex={disabled ? -1 : 0}
	{id}
	aria-label={ariaLabel ?? `${offLabel} o ${onLabel}`}
	onclick={toggle}
	onkeydown={handleKeydown}
>
	<!-- Pill deslizante animado con rueda de giro M3 Expressive -->
	<div class="m3-wheel-slider" class:m3-wheel-slider--on={checked}>
		<span class="m3-wheel-dial" class:m3-wheel-dial--spinning={isSpinning}>
			{#if checked}
				<svg class="m3-wheel-svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5">
					<circle cx="12" cy="12" r="9" stroke-dasharray="3 2"></circle>
					<polyline points="9 12 11.5 14.5 15.5 9.5"></polyline>
				</svg>
			{:else}
				<svg class="m3-wheel-svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="9" stroke-dasharray="2 2.5"></circle>
					<line x1="8.5" y1="12" x2="15.5" y2="12"></line>
				</svg>
			{/if}
		</span>
	</div>

	<!-- Opción 1: Inactivo / Off -->
	<button
		type="button"
		class="m3-wheel-item m3-wheel-item--off"
		class:m3-wheel-item--selected={!checked}
		tabindex="-1"
		onclick={(e) => {
			e.stopPropagation();
			setChecked(false);
		}}
	>
		<span class="m3-wheel-label">{offLabel}</span>
	</button>

	<!-- Opción 2: Activo / On -->
	<button
		type="button"
		class="m3-wheel-item m3-wheel-item--on"
		class:m3-wheel-item--selected={checked}
		tabindex="-1"
		onclick={(e) => {
			e.stopPropagation();
			setChecked(true);
		}}
	>
		<span class="m3-wheel-label">{onLabel}</span>
	</button>
</div>

<style>
	.m3-wheel-container {
		position: relative;
		display: inline-grid;
		grid-template-columns: 1fr 1fr;
		width: 154px;
		max-width: 100%;
		flex-shrink: 0;
		overflow: hidden;
		height: 36px;
		border-radius: 9999px;
		background: #f1f5f9;
		border: 1px solid #d5dedc;
		padding: 3px;
		cursor: pointer;
		user-select: none;
		box-sizing: border-box;
		transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
		outline: none;
	}

	.m3-wheel-container:hover {
		border-color: #94a3b8;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
	}

	.m3-wheel-container:focus-visible {
		box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.35);
		border-color: #10b981;
	}

	.m3-wheel--checked {
		background: rgba(16, 185, 129, 0.12);
		border-color: rgba(16, 185, 129, 0.45);
	}

	.m3-wheel--checked:hover {
		border-color: #10b981;
	}

	.m3-wheel--disabled {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}

	/* Pill deslizante que se mueve con M3 Expressive physics */
	.m3-wheel-slider {
		position: absolute;
		top: 3px;
		bottom: 3px;
		left: 3px;
		width: calc(50% - 3px);
		border-radius: 9999px;
		background: #ffffff;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.06);
		display: flex;
		align-items: center;
		justify-content: flex-start;
		padding: 0 6px;
		pointer-events: none;
		z-index: 1;
		transition: transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1),
			background-color 0.25s ease,
			box-shadow 0.25s ease;
	}

	.m3-wheel-slider--on {
		left: 50%;
		background: #004851;
		box-shadow: 0 3px 8px rgba(0, 72, 81, 0.25);
		justify-content: flex-start;
	}

	/* Ícono de rueda que gira en el cambio de valor */
	.m3-wheel-dial {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		color: #64748b;
		transition: transform 0.35s cubic-bezier(0.2, 0, 0, 1), color 0.2s ease;
	}

	.m3-wheel-slider--on .m3-wheel-dial {
		color: #10b981;
	}

	.m3-wheel-dial--spinning {
		animation: m3-wheel-roll 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes m3-wheel-roll {
		0% {
			transform: rotate(0deg) scale(0.9);
		}
		50% {
			transform: rotate(180deg) scale(1.15);
		}
		100% {
			transform: rotate(360deg) scale(1);
		}
	}

	.m3-wheel-svg {
		width: 15px;
		height: 15px;
	}

	/* Items de texto para cada una de las dos opciones */
	.m3-wheel-item {
		appearance: none;
		border: none;
		background: transparent;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: inherit;
		font-size: 0.75rem;
		font-weight: 600;
		color: #64748b;
		cursor: pointer;
		padding: 0 4px;
		white-space: nowrap;
		transition: color 0.25s ease, font-weight 0.25s ease;
		border-radius: 9999px;
	}

	.m3-wheel-item--selected {
		color: #14201f;
		font-weight: 700;
	}

	.m3-wheel--checked .m3-wheel-item--on.m3-wheel-item--selected {
		color: #ffffff;
		padding-left: 14px;
	}

	.m3-wheel-item--off.m3-wheel-item--selected {
		padding-left: 14px;
	}

	.m3-wheel-label {
		display: inline-block;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 65px;
	}

	/* Tema Oscuro */
	:global(html.dark) .m3-wheel-container,
	:global(.dark) .m3-wheel-container {
		background: #0b1120;
		border-color: #26334e;
	}

	:global(html.dark) .m3-wheel-container:hover,
	:global(.dark) .m3-wheel-container:hover {
		border-color: #3b82f6;
	}

	:global(html.dark) .m3-wheel--checked,
	:global(.dark) .m3-wheel--checked {
		background: rgba(16, 185, 129, 0.15);
		border-color: rgba(16, 185, 129, 0.5);
	}

	:global(html.dark) .m3-wheel-slider,
	:global(.dark) .m3-wheel-slider {
		background: #1e293b;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
	}

	:global(html.dark) .m3-wheel-slider--on,
	:global(.dark) .m3-wheel-slider--on {
		background: #0f2832;
		border: 1px solid rgba(16, 185, 129, 0.6);
		box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
	}

	:global(html.dark) .m3-wheel-item,
	:global(.dark) .m3-wheel-item {
		color: #94a3b8;
	}

	:global(html.dark) .m3-wheel-item--selected,
	:global(.dark) .m3-wheel-item--selected {
		color: #e7eef8;
	}

	:global(html.dark) .m3-wheel--checked .m3-wheel-item--on.m3-wheel-item--selected,
	:global(.dark) .m3-wheel--checked .m3-wheel-item--on.m3-wheel-item--selected {
		color: #10b981;
	}
</style>
