<script lang="ts">
	import AppButton from './AppButton.svelte';
	import type { SimulatorState } from '../state/SimulatorState.svelte';

	interface Props {
		state?: SimulatorState;
		simState?: SimulatorState;
	}

	let { state: stateProp, simState: simStateProp }: Props = $props();
	const currentSimState = $derived(simStateProp ?? stateProp);

	let copied = $state<boolean>(false);
	const shareUrl = $derived<string>(currentSimState?.getShareUrl() ?? '');

	async function handleCopy(): Promise<void> {
		if (!currentSimState) return;
		const success = await currentSimState.copyShareUrl();
		if (success) {
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 3000);
		}
	}
</script>

<div class="share-tab-container">
	<p class="share-desc">
		Genera un enlace autocontenido que codifica el estado completo de tu simulación en Base64 URL-safe
		para compartir tu análisis financiero instantáneamente sin necesidad de servidores.
	</p>

	<div class="share-box">
		<label for="share-url-input" class="share-label">Enlace Directo de Simulación</label>
		<div class="share-input-row">
			<input
				id="share-url-input"
				type="text"
				readonly
				class="share-url-field"
				value={shareUrl}
				onclick={(e) => {
					if (e.target instanceof HTMLInputElement) e.target.select();
				}}
			/>
			<AppButton variant="primary" onclick={handleCopy} class="copy-btn" id="btn-copy-share-url">
				{copied ? '✓ ¡Copiado!' : 'Copiar Enlace'}
			</AppButton>
		</div>
		{#if copied}
			<span class="copy-success-hint" role="status">
				✓ Enlace copiado al portapapeles. Listo para compartir.
			</span>
		{/if}
	</div>
</div>

<style>
	.share-tab-container {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.share-desc {
		font-size: 0.8125rem;
		color: #4f5d5c;
		margin: 0 0 12px 0;
		line-height: 1.45;
	}

	.share-box {
		background: #f7faf9;
		border: 1px solid #d5dedc;
		border-radius: 8px;
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.share-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: #14201f;
	}

	.share-input-row {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.share-url-field {
		flex: 1;
		padding: 8px 10px;
		font-size: 0.75rem;
		font-family: monospace;
		border: 1px solid #c2dbde;
		border-radius: 6px;
		background: #ffffff;
		color: #14201f;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.share-url-field:focus {
		outline: none;
		border-color: #004851;
		box-shadow: 0 0 0 2px rgba(0, 72, 81, 0.2);
	}

	:global(.copy-btn) {
		background: #004851 !important;
		color: #ffffff !important;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.copy-success-hint {
		font-size: 0.75rem;
		font-weight: 600;
		color: #059669;
		margin-top: 4px;
	}

	:global(body.dark) .share-desc {
		color: #94a3b8;
	}

	:global(body.dark) .share-box {
		background: #1e293b;
		border-color: #334155;
	}

	:global(body.dark) .share-label {
		color: #f1f5f9;
	}

	:global(body.dark) .share-url-field {
		background: #0f172a;
		border-color: #334155;
		color: #38bdf8;
	}

	:global(body.dark) .copy-success-hint {
		color: #34d399;
	}
</style>
