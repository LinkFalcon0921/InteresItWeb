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
		margin-top: 8px;
	}

	.quick-chip {
		appearance: none;
		border: 1px solid #d5dedc;
		background: #ffffff;
		border-radius: 9999px;
		padding: 4px 12px;
		min-height: 28px;
		font-size: 0.75rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
		color: #14201f;
		user-select: none;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
	}

	.quick-chip:hover {
		transform: translateY(-1px);
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
	}

	.quick-chip:active {
		transform: translateY(0);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
	}

	.quick-chip-positive {
		color: #047857;
		background: #ecfdf5;
		border-color: #a7f3d0;
	}

	.quick-chip-positive:hover {
		background: #d1fae5;
		border-color: #6ee7b7;
	}

	.quick-chip-negative {
		color: #475569;
		background: #f8fafc;
		border-color: #e2e8f0;
	}

	.quick-chip-negative:hover {
		background: #f1f5f9;
		border-color: #cbd5e1;
	}

	:global(html.dark) .quick-chip,
	:global(.dark) .quick-chip {
		background: #131c30;
		border-color: #26334e;
		color: #e7eef8;
	}

	:global(html.dark) .quick-chip-positive,
	:global(.dark) .quick-chip-positive {
		background: rgba(16, 185, 129, 0.15);
		border-color: rgba(16, 185, 129, 0.4);
		color: #6ee7b7;
	}

	:global(html.dark) .quick-chip-positive:hover,
	:global(.dark) .quick-chip-positive:hover {
		background: rgba(16, 185, 129, 0.25);
		border-color: #10b981;
	}

	:global(html.dark) .quick-chip-negative,
	:global(.dark) .quick-chip-negative {
		background: #1e293b;
		border-color: #334155;
		color: #94a3b8;
	}

	:global(html.dark) .quick-chip-negative:hover,
	:global(.dark) .quick-chip-negative:hover {
		background: #334155;
		border-color: #475569;
	}
</style>
