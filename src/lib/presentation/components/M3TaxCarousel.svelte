<script lang="ts">
	interface Props {
		checked: boolean;
		customRate?: number;
		onTaxChange?: (mode: 'no-aplica' | '10-rd' | 'personalizado', rate: number) => void;
	}

	let { checked = $bindable(true), customRate = $bindable(10), onTaxChange }: Props = $props();

	type TaxOption = {
		id: 'no-aplica' | '10-rd' | 'personalizado';
		label: string;
		badge: string;
	};

	const TAX_OPTIONS: TaxOption[] = [
		{ id: 'no-aplica', label: 'No aplica', badge: '0% Exento' },
		{ id: '10-rd', label: '10% RD', badge: 'Deducción de Ley' },
		{ id: 'personalizado', label: 'Personalizado', badge: 'Tasa a medida' }
	];

	const PRESET_RATES = [5, 10, 15, 25, 27] as const;

	let activeIndex = $state<number>(checked ? 1 : 0);

	$effect(() => {
		if (!checked && activeIndex !== 0) {
			activeIndex = 0;
		} else if (checked && activeIndex === 0) {
			activeIndex = 1;
		}
	});

	const activeOption = $derived(TAX_OPTIONS[activeIndex] ?? TAX_OPTIONS[0]);

	function setOption(index: number): void {
		let newIndex = index;
		if (newIndex < 0) {
			newIndex = TAX_OPTIONS.length - 1;
		} else if (newIndex >= TAX_OPTIONS.length) {
			newIndex = 0;
		}
		activeIndex = newIndex;
		const opt = TAX_OPTIONS[newIndex];
		if (!opt) return;

		if (opt.id === 'no-aplica') {
			checked = false;
			onTaxChange?.(opt.id, 0);
		} else if (opt.id === '10-rd') {
			checked = true;
			onTaxChange?.(opt.id, 10);
		} else {
			checked = true;
			onTaxChange?.(opt.id, customRate);
		}
	}

	function prevOption(): void {
		setOption(activeIndex - 1);
	}

	function nextOption(): void {
		setOption(activeIndex + 1);
	}

	function handleCustomRateInput(event: Event): void {
		const target = event.currentTarget as HTMLInputElement;
		const val = parseFloat(target.value);
		if (!Number.isNaN(val) && val >= 0 && val <= 100) {
			customRate = val;
			onTaxChange?.('personalizado', val);
		}
	}
</script>

<div class="tax-carousel-wrapper">
	<div class="tax-main-row">
		<div class="tax-info">
			<span class="tax-title">Retención Fiscal</span>
			<span class="tax-desc">Deducción de ley sobre intereses</span>
		</div>

		<!-- 3-Element Carousel Component -->
		<div
			class="tax-carousel-box"
			role="region"
			aria-label="Selector carrusel de retención fiscal"
		>
			<!-- Botón Izquierdo Externo -->
			<button
				type="button"
				class="tax-arrow-btn"
				onclick={prevOption}
				aria-label="Opción de retención anterior"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
			</button>

			<!-- Elemento Céntrico Visor con Animación -->
			<div
				class="tax-display-center {activeOption.id === 'no-aplica' ? 'is-exempt' : 'is-taxed'}"
				role="button"
				tabindex="0"
				onclick={nextOption}
				onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), nextOption())}
				aria-label={`Retención: ${activeOption.label}. Pulsa para siguiente opción`}
			>
				{#key activeOption.id}
					<div class="tax-text-container">
						<span class="tax-label">{activeOption.label}</span>
						<span class="tax-badge">{activeOption.badge}</span>
					</div>
				{/key}
			</div>

			<!-- Botón Derecho Externo -->
			<button
				type="button"
				class="tax-arrow-btn"
				onclick={nextOption}
				aria-label="Siguiente opción de retención"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>
		</div>
	</div>

	<!-- Panel Personalizado con Fade In y Slide In Vertical -->
	{#if activeOption.id === 'personalizado'}
		<div class="custom-rate-drawer">
			<div class="custom-rate-inner">
				<label class="custom-rate-label" for="tasa-retencion-personalizada">
					<span>Porcentaje de Retención:</span>
					<span class="custom-rate-val">{customRate}%</span>
				</label>
				<div class="custom-input-box">
					<input
						id="tasa-retencion-personalizada"
						type="number"
						class="custom-rate-input"
						min="0"
						max="100"
						step="0.5"
						value={customRate}
						oninput={handleCustomRateInput}
						placeholder="10.0"
					/>
					<span class="custom-rate-suffix">%</span>
				</div>
				<div class="custom-presets-row" role="group" aria-label="Tasas frecuentes">
					{#each PRESET_RATES as rate}
						<button
							type="button"
							class="rate-chip {customRate === rate ? 'rate-chip--active' : ''}"
							onclick={() => {
								customRate = rate;
								onTaxChange?.('personalizado', rate);
							}}
						>
							{rate}%
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.tax-carousel-wrapper {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 10px 0;
	}

	.tax-main-row {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: 8px;
	}

	.tax-info {
		display: flex;
		flex-direction: column;
		min-width: 140px;
	}

	.tax-title {
		font-size: 0.8125rem;
		font-weight: 700;
		color: #14201f;
	}

	.tax-desc {
		font-size: 0.6875rem;
		color: #5e6b6a;
		font-weight: 500;
	}

	/* 3-element Carousel Box tomando el 100% del ancho */
	.tax-carousel-box {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		background: #f1f5f9;
		border: 1.5px solid #cbd5e1;
		border-radius: 9999px;
		padding: 3px;
		box-sizing: border-box;
		gap: 2px;
		transition: all 0.2s ease;
	}

	.tax-arrow-btn {
		background: transparent;
		border: none;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #475569;
		cursor: pointer;
		transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
		flex-shrink: 0;
	}
	.tax-arrow-btn:hover {
		background: #e2e8f0;
		color: #0f172a;
	}
	.tax-arrow-btn:active {
		transform: scale(0.92);
	}
	.tax-arrow-btn svg {
		width: 14px;
		height: 14px;
	}

	.tax-display-center {
		flex: 1;
		min-width: 0;
		padding: 4px 12px;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		cursor: pointer;
		transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
		user-select: none;
	}

	.tax-text-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		animation: m3-fade-x 0.18s cubic-bezier(0.2, 0, 0, 1);
	}

	.tax-label {
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: -0.01em;
		line-height: 1.1;
	}

	.tax-badge {
		font-size: 0.625rem;
		font-weight: 600;
		line-height: 1.1;
		opacity: 0.85;
	}

	.is-exempt {
		background: #ffffff;
		color: #475569;
		border: 1px solid #cbd5e1;
	}

	.is-taxed {
		background: #004851;
		color: #ffffff;
		box-shadow: 0 2px 6px rgba(0, 72, 81, 0.25);
	}

	/* Slide-in & Fade-in Vertical Drawer for Custom Rate */
	.custom-rate-drawer {
		margin-top: 8px;
		animation: m3-slide-down 0.25s cubic-bezier(0.2, 0, 0, 1) both;
		overflow: hidden;
	}

	.custom-rate-inner {
		background: #f8fafc;
		border: 1.5px dashed #cbd5e1;
		border-radius: 12px;
		padding: 10px 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.custom-rate-label {
		display: flex;
		justify-content: space-between;
		font-size: 0.6875rem;
		font-weight: 700;
		color: #475569;
	}

	.custom-rate-val {
		color: #004851;
		font-weight: 800;
	}

	.custom-input-box {
		display: flex;
		align-items: center;
		background: #ffffff;
		border: 1px solid #cbd5e1;
		border-radius: 8px;
		padding: 0 10px;
		height: 36px;
	}

	.custom-rate-input {
		border: none;
		outline: none;
		width: 100%;
		font-size: 0.8125rem;
		font-weight: 700;
		color: #0f172a;
		font-family: inherit;
		background: transparent;
	}

	.custom-rate-suffix {
		font-size: 0.75rem;
		font-weight: 700;
		color: #64748b;
	}

	.custom-presets-row {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.rate-chip {
		background: #ffffff;
		border: 1px solid #cbd5e1;
		font-family: inherit;
		font-size: 0.6875rem;
		font-weight: 700;
		color: #475569;
		padding: 2px 8px;
		border-radius: 9999px;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.rate-chip:hover {
		background: #f1f5f9;
		border-color: #004851;
		color: #004851;
	}
	.rate-chip--active {
		background: #004851 !important;
		color: #ffffff !important;
		border-color: #004851 !important;
	}

	/* Dark mode styles */
	:global(html.dark) .tax-title, :global(.dark) .tax-title { color: #f1f5f9; }
	:global(html.dark) .tax-desc, :global(.dark) .tax-desc { color: #94a3b8; }
	:global(html.dark) .tax-carousel-box, :global(.dark) .tax-carousel-box {
		background: #1e293b;
		border-color: #334155;
	}
	:global(html.dark) .tax-arrow-btn, :global(.dark) .tax-arrow-btn { color: #94a3b8; }
	:global(html.dark) .tax-arrow-btn:hover, :global(.dark) .tax-arrow-btn:hover { background: #334155; color: #f8fafc; }
	:global(html.dark) .is-exempt, :global(.dark) .is-exempt {
		background: #0f172a;
		color: #94a3b8;
		border-color: #334155;
	}
	:global(html.dark) .is-taxed, :global(.dark) .is-taxed {
		background: #10b981;
		color: #0f172a;
		box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
	}
	:global(html.dark) .custom-rate-inner, :global(.dark) .custom-rate-inner {
		background: #0f172a;
		border-color: #334155;
	}
	:global(html.dark) .custom-rate-label, :global(.dark) .custom-rate-label { color: #94a3b8; }
	:global(html.dark) .custom-rate-val, :global(.dark) .custom-rate-val { color: #34d399; }
	:global(html.dark) .custom-input-box, :global(.dark) .custom-input-box {
		background: #1e293b;
		border-color: #334155;
	}
	:global(html.dark) .custom-rate-input, :global(.dark) .custom-rate-input { color: #f8fafc; }
	:global(html.dark) .rate-chip, :global(.dark) .rate-chip {
		background: #1e293b;
		border-color: #334155;
		color: #cbd5e1;
	}
	:global(html.dark) .rate-chip:hover, :global(.dark) .rate-chip:hover {
		background: #334155;
		color: #34d399;
		border-color: #10b981;
	}
	:global(html.dark) .rate-chip--active, :global(.dark) .rate-chip--active {
		background: #10b981 !important;
		color: #0f172a !important;
		border-color: #10b981 !important;
	}

	@keyframes m3-fade-x {
		from { opacity: 0; transform: scale(0.96); }
		to { opacity: 1; transform: scale(1); }
	}

	@keyframes m3-slide-down {
		from { opacity: 0; transform: translateY(-8px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
