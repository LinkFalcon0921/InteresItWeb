<script lang="ts">
	interface Props {
		checked: boolean;
		onChange?: (omitir: boolean) => void;
	}

	let { checked = $bindable(false), onChange }: Props = $props();

	type CutOption = {
		id: 'normal' | 'omitir';
		label: string;
		badge: string;
	};

	const CUT_OPTIONS: CutOption[] = [
		{ id: 'normal', label: 'Normal', badge: 'Con intereses' },
		{ id: 'omitir', label: 'Omitir', badge: '0% si mes incompleto' }
	];

	let activeIndex = $state<number>(checked ? 1 : 0);

	$effect(() => {
		if (checked && activeIndex !== 1) {
			activeIndex = 1;
		} else if (!checked && activeIndex !== 0) {
			activeIndex = 0;
		}
	});

	const activeOption = $derived(CUT_OPTIONS[activeIndex] ?? CUT_OPTIONS[0]);

	function setOption(index: number): void {
		let newIndex = index;
		if (newIndex < 0) {
			newIndex = CUT_OPTIONS.length - 1;
		} else if (newIndex >= CUT_OPTIONS.length) {
			newIndex = 0;
		}
		activeIndex = newIndex;
		const opt = CUT_OPTIONS[newIndex];
		if (!opt) return;

		const isOmit = opt.id === 'omitir';
		checked = isOmit;
		onChange?.(isOmit);
	}

	function toggleOption(): void {
		setOption(activeIndex === 0 ? 1 : 0);
	}

	function prevOption(): void {
		setOption(activeIndex - 1);
	}

	function nextOption(): void {
		setOption(activeIndex + 1);
	}
</script>

<div class="cut-carousel-wrapper">
	<div class="cut-main-col">
		<div class="cut-info">
			<span class="cut-title">1º corte parcial</span>
			<span class="cut-desc">Si el 1º ciclo no completa el mes</span>
		</div>

		<!-- Carrusel de 3 elementos a 100% width -->
		<div
			class="cut-carousel-box"
			role="region"
			aria-label="Selector carrusel de primer corte parcial"
		>
			<!-- Botón Izquierdo Externo -->
			<button
				type="button"
				class="cut-arrow-btn"
				onclick={prevOption}
				aria-label="Opción de corte anterior"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
			</button>

			<!-- Elemento Céntrico Visor con Animación y Click para Alternar -->
			<div
				class="cut-display-center {activeOption.id === 'omitir' ? 'is-omit' : 'is-normal'}"
				role="button"
				tabindex="0"
				onclick={toggleOption}
				onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggleOption())}
				aria-label="Corte parcial: {activeOption.label}. Pulsa para alternar"
			>
				{#key activeOption.id}
					<div class="cut-text-container">
						<span class="cut-label">{activeOption.label}</span>
						<span class="cut-badge">{activeOption.badge}</span>
					</div>
				{/key}
			</div>

			<!-- Botón Derecho Externo -->
			<button
				type="button"
				class="cut-arrow-btn"
				onclick={nextOption}
				aria-label="Siguiente opción de corte"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>
		</div>
	</div>

	<!-- Checkbox accesible superpuesto o referenciable -->
	<input
		type="checkbox"
		id="switch-omitir-primer-corte"
		bind:checked
		class="accessible-hidden-input"
		aria-label="Omitir primer corte parcial si no completa el mes"
		tabindex="-1"
	/>

	<!-- Banner informativo cuando Omitir está activo -->
	{#if checked}
		<div class="omit-info-banner" role="status" aria-live="polite">
			<svg class="omit-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="16" x2="12" y2="12"></line>
				<line x1="12" y1="8" x2="12.01" y2="8"></line>
			</svg>
			<span class="omit-info-text">
				<strong>1º corte omitido:</strong> Si los días iniciales no completan un mes entero, el primer período capitaliza sin generar intereses (RD$0.00).
			</span>
		</div>
	{/if}
</div>

<style>
	.cut-carousel-wrapper {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 6px 0;
	}

	.cut-main-col {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: 8px;
	}

	.cut-info {
		display: flex;
		flex-direction: column;
		min-width: 140px;
	}

	.cut-title {
		font-size: 0.8125rem;
		font-weight: 700;
		color: #14201f;
		line-height: 1.25;
	}

	.cut-desc {
		font-size: 0.6875rem;
		color: #5e6b6a;
		font-weight: 500;
		margin-top: 2px;
	}

	/* 3-element Carousel Box tomando el 100% del ancho */
	.cut-carousel-box {
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

	.cut-arrow-btn {
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
	.cut-arrow-btn:hover {
		background: #e2e8f0;
		color: #0f172a;
	}
	.cut-arrow-btn:active {
		transform: scale(0.92);
	}
	.cut-arrow-btn svg {
		width: 14px;
		height: 14px;
	}

	.cut-display-center {
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

	.cut-text-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		animation: m3-fade-x 0.18s cubic-bezier(0.2, 0, 0, 1);
	}

	.cut-label {
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: -0.01em;
		line-height: 1.1;
	}

	.cut-badge {
		font-size: 0.625rem;
		font-weight: 600;
		line-height: 1.1;
		opacity: 0.85;
	}

	.is-normal {
		background: #ffffff;
		color: #475569;
		border: 1px solid #cbd5e1;
	}

	.is-omit {
		background: #004851;
		color: #ffffff;
		box-shadow: 0 2px 6px rgba(0, 72, 81, 0.25);
	}

	.accessible-hidden-input {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
		pointer-events: none;
	}

	.omit-info-banner {
		margin-top: 8px;
		background: #ecfdf5;
		border: 1px solid #a7f3d0;
		border-radius: 8px;
		padding: 8px 10px;
		display: flex;
		align-items: flex-start;
		gap: 8px;
		animation: m3-slide-fade 0.25s cubic-bezier(0.2, 0, 0, 1) both;
	}
	.omit-info-icon {
		width: 16px;
		height: 16px;
		color: #059669;
		flex-shrink: 0;
		margin-top: 1px;
	}
	.omit-info-text {
		font-size: 0.6875rem;
		color: #065f46;
		line-height: 1.35;
	}

	/* Dark mode */
	:global(html.dark) .cut-title, :global(.dark) .cut-title { color: #f1f5f9; }
	:global(html.dark) .cut-desc, :global(.dark) .cut-desc { color: #94a3b8; }
	:global(html.dark) .cut-carousel-box, :global(.dark) .cut-carousel-box {
		background: #1e293b;
		border-color: #334155;
	}
	:global(html.dark) .cut-arrow-btn, :global(.dark) .cut-arrow-btn { color: #94a3b8; }
	:global(html.dark) .cut-arrow-btn:hover, :global(.dark) .cut-arrow-btn:hover { background: #334155; color: #f8fafc; }
	:global(html.dark) .is-normal, :global(.dark) .is-normal {
		background: #0f172a;
		color: #94a3b8;
		border-color: #334155;
	}
	:global(html.dark) .is-omit, :global(.dark) .is-omit {
		background: #10b981;
		color: #0f172a;
		box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
	}
	:global(html.dark) .omit-info-banner, :global(.dark) .omit-info-banner {
		background: rgba(16, 185, 129, 0.12);
		border-color: rgba(16, 185, 129, 0.3);
	}
	:global(html.dark) .omit-info-icon, :global(.dark) .omit-info-icon { color: #10b981; }
	:global(html.dark) .omit-info-text, :global(.dark) .omit-info-text { color: #a7f3d0; }

	@keyframes m3-fade-x {
		from { opacity: 0; transform: scale(0.96); }
		to { opacity: 1; transform: scale(1); }
	}

	@keyframes m3-slide-fade {
		from { opacity: 0; transform: translateY(-6px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
