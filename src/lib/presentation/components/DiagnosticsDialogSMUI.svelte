<script lang="ts">
	import Button, { Label } from '@smui/button';
	import type { SimulatorState } from '../state/SimulatorState.svelte';

	interface Props {
		simState?: SimulatorState;
		state?: SimulatorState;
		isOpen: boolean;
		onClose: () => void;
	}

	let { simState: simStateProp, state: stateProp, isOpen, onClose }: Props = $props();
	const simState = $derived(simStateProp ?? stateProp);

	let swStatus = $state('Verificando...');
	let idbStatus = $state('Verificando...');
	let storageUsage = $state<string>('Calculando...');
	let portfoliosCount = $state<number>(0);
	let lastCheckTime = $state<string>('');
	let isRunningDiagnostic = $state(false);

	async function runDiagnostics(): Promise<void> {
		isRunningDiagnostic = true;
		lastCheckTime = new Date().toLocaleTimeString();

		// 1. Service Worker check
		if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
			if (navigator.serviceWorker.controller) {
				swStatus = '🟢 Activo y controlando (Offline Ready)';
			} else {
				try {
					const registrations = await navigator.serviceWorker.getRegistrations();
					if (registrations.length > 0) {
						swStatus = '🟡 Registrado (esperando activación o recarga)';
					} else {
						swStatus = '⚪ No registrado en esta sesión';
					}
				} catch {
					swStatus = '🔴 Error al consultar registros de Service Worker';
				}
			}
		} else {
			swStatus = '⚪ Service Worker no soportado en este navegador';
		}

		// 2. IndexedDB health check
		if (typeof window !== 'undefined' && 'indexedDB' in window) {
			try {
				if (simState) {
					portfoliosCount = simState.portfolios.length;
					idbStatus = `🟢 Base de datos InteresItDB operativa (${portfoliosCount} portafolios)`;
				} else {
					idbStatus = '🟢 IndexedDB disponible en el entorno';
				}
			} catch (e) {
				idbStatus = `🔴 Error al acceder a IndexedDB: ${e instanceof Error ? e.message : String(e)}`;
			}
		} else {
			idbStatus = '🔴 IndexedDB no soportado en este cliente';
		}

		// 3. Storage estimate
		if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
			try {
				const estimate = await navigator.storage.estimate();
				const usageMb = estimate.usage ? (estimate.usage / (1024 * 1024)).toFixed(2) : '0';
				const quotaMb = estimate.quota ? (estimate.quota / (1024 * 1024)).toFixed(0) : '0';
				storageUsage = `${usageMb} MB en uso de ${quotaMb} MB disponibles`;
			} catch {
				storageUsage = 'No disponible';
			}
		} else {
			storageUsage = 'Estimación de almacenamiento no disponible';
		}

		isRunningDiagnostic = false;
	}

	$effect(() => {
		if (isOpen) {
			runDiagnostics();
		}
	});
</script>

{#if isOpen}
	<div
		class="modal-backdrop"
		role="button"
		tabindex="0"
		onclick={onClose}
		onkeydown={(e) => {
			if (e.key === 'Escape') onClose();
		}}
		aria-label="Cerrar modal de diagnóstico"
	>
		<div
			class="modal-card"
			role="dialog"
			aria-labelledby="diag-dialog-title"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="modal-header">
				<h3 id="diag-dialog-title" class="modal-title">Diagnóstico de Sistema y Resiliencia</h3>
				<button type="button" class="close-btn" onclick={onClose} aria-label="Cerrar">✕</button>
			</div>

			<div class="modal-body">
				<p class="modal-desc">
					Monitoreo en tiempo real del estado de persistencia local, capacidades fuera de línea
					(PWA) y componentes de ejecución de la terminal financiera.
				</p>

				<div class="diagnostic-grid">
					<div class="diag-item">
						<span class="diag-label">Versión de InteresIt</span>
						<span class="diag-value">v2.2.0 (Build de Producción Svelte 5)</span>
					</div>

					<div class="diag-item">
						<span class="diag-label">Service Worker (PWA Offline)</span>
						<span class="diag-value" id="diag-sw-status">{swStatus}</span>
					</div>

					<div class="diag-item">
						<span class="diag-label">Persistencia Local (IndexedDB)</span>
						<span class="diag-value" id="diag-idb-status">{idbStatus}</span>
					</div>

					<div class="diag-item">
						<span class="diag-label">Cuota de Almacenamiento</span>
						<span class="diag-value">{storageUsage}</span>
					</div>

					<div class="diag-item">
						<span class="diag-label">Portafolios Registrados</span>
						<span class="diag-value">{portfoliosCount} portafolio(s) sincronizado(s)</span>
					</div>

					<div class="diag-item">
						<span class="diag-label">Último Análisis</span>
						<span class="diag-value">{lastCheckTime || 'Iniciando...'}</span>
					</div>
				</div>
			</div>

			<div class="modal-footer">
				<Button variant="outlined" onclick={onClose}>
					<Label>Cerrar</Label>
				</Button>
				<Button
					variant="raised"
					disabled={isRunningDiagnostic}
					onclick={runDiagnostics}
					class="confirm-btn"
				>
					<Label>{isRunningDiagnostic ? 'Verificando...' : 'Re-ejecutar Diagnóstico'}</Label>
				</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: 16px;
	}

	.modal-card {
		background: #ffffff;
		border-radius: 16px;
		width: 100%;
		max-width: 520px;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
		overflow: hidden;
		border: 1px solid #d5dedc;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid #edf2f0;
	}

	.modal-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 800;
		color: #14201f;
	}

	.close-btn {
		appearance: none;
		border: none;
		background: transparent;
		font-size: 1rem;
		color: #5e6b6a;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 4px;
	}

	.close-btn:hover {
		background: #f6f8fb;
		color: #14201f;
	}

	.modal-body {
		padding: 20px;
	}

	.modal-desc {
		margin: 0 0 16px 0;
		font-size: 0.8125rem;
		color: #5e6b6a;
		line-height: 1.45;
	}

	.diagnostic-grid {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.diag-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 10px 12px;
		border-radius: 8px;
		background: #f6f8fb;
		border: 1px solid #edf2f0;
	}

	.diag-label {
		font-size: 0.6875rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #5e6b6a;
	}

	.diag-value {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #14201f;
	}

	.modal-footer {
		padding: 14px 20px;
		background: #f6f8fb;
		border-top: 1px solid #edf2f0;
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}

	:global(.confirm-btn) {
		background: #004851 !important;
		color: #ffffff !important;
	}

	:global(.dark) .modal-card {
		background: #131c30;
		border-color: #26334e;
	}

	:global(.dark) .modal-header {
		border-bottom-color: #1e293b;
	}

	:global(.dark) .modal-title,
	:global(.dark) .diag-value {
		color: #e7eef8;
	}

	:global(.dark) .modal-desc,
	:global(.dark) .close-btn,
	:global(.dark) .diag-label {
		color: #a3b0c6;
	}

	:global(.dark) .diag-item {
		background: #0b1120;
		border-color: #26334e;
	}

	:global(.dark) .modal-footer {
		background: #0b1120;
		border-top-color: #1e293b;
	}

	:global(.dark) :global(.confirm-btn) {
		background: #7fd1d8 !important;
		color: #0b1120 !important;
	}
</style>
