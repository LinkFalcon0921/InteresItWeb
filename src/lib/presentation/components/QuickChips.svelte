<script lang="ts">
	interface Props {
		onAdjust: (delta: number) => void;
	}

	let { onAdjust }: Props = $props();

	const deltas = [-100, -50, -20, 20, 50, 100] as const;
</script>

<div class="quick-chips-wrapper" role="group" aria-label="Ajustes rápidos de monto">
	{#each deltas as delta (delta)}
		<button
			type="button"
			class="quick-chip {delta > 0 ? 'quick-chip-positive' : 'quick-chip-negative'}"
			onclick={() => onAdjust(delta)}
			aria-label="{delta > 0 ? 'Aumentar' : 'Disminuir'} {Math.abs(delta)}"
		>
			{delta > 0 ? `+${delta}` : delta}
		</button>
	{/each}
</div>

<style>
	.quick-chips-wrapper {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 6px;
	}

	.quick-chip {
		appearance: none;
		border: 1px solid #d5dedc;
		background: #ffffff;
		border-radius: 9999px;
		padding: 3px 10px;
		font-size: 0.75rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		transition: all 0.15s ease-in-out;
		color: #14201f;
		user-select: none;
	}

	.quick-chip:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
	}

	.quick-chip:active {
		transform: translateY(0);
	}

	.quick-chip-positive {
		color: #0b7a4b;
		background: #f0fdf4;
		border-color: #bbf7d0;
	}

	.quick-chip-positive:hover {
		background: #dcfce7;
	}

	.quick-chip-negative {
		color: #5e6b6a;
		background: #f8fafc;
	}

	.quick-chip-negative:hover {
		background: #f1f5f9;
	}

	:global(.dark) .quick-chip {
		background: #131c30;
		border-color: #26334e;
		color: #e7eef8;
	}

	:global(.dark) .quick-chip-positive {
		background: rgba(11, 122, 75, 0.2);
		border-color: #0b7a4b;
		color: #86efac;
	}

	:global(.dark) .quick-chip-negative {
		background: #1e293b;
		border-color: #334155;
		color: #94a3b8;
	}
</style>
