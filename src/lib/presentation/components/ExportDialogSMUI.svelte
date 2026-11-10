<script lang="ts">
	import { tick } from 'svelte';
	import AppButton from './AppButton.svelte';
	import AppDialog from './AppDialog.svelte';
	import AppSpinner from './AppSpinner.svelte';
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import ShareExportTab from './ShareExportTab.svelte';

	interface Props {
		state?: SimulatorState;
		simState?: SimulatorState;
		isOpen: boolean;
		onClose: () => void;
	}

	let { state: stateProp, simState: simStateProp, isOpen, onClose }: Props = $props();
	const currentSimState = $derived(simStateProp ?? stateProp);

	let activeExportTab = $state<'pdf' | 'csv' | 'backup' | 'share'>('pdf');

	// PDF state
	let pdfFileName = $state('');
	let isGeneratingPdf = $state(false);

	// CSV state
	let csvFileName = $state('');
	let selectedCsvScenario = $state<string>('');

	// Backup & Restore state
	let backupStatus = $state('');
	let isBackupError = $state(false);
	let isRestoring = $state(false);
	let fileInputRef = $state<HTMLInputElement | null>(null);

	// Synchronize default CSV scenario to leader
	$effect(() => {
		if (isOpen && currentSimState?.escenarioLider && !selectedCsvScenario) {
			selectedCsvScenario = currentSimState.escenarioLider.setting.id;
		}
	});

	async function handleExportPDF(): Promise<void> {
		if (!currentSimState) return;
		isGeneratingPdf = true;
		const name = pdfFileName.trim().length > 0 ? pdfFileName.trim() : undefined;
		try {
			await currentSimState.exportPDF(name);
		} finally {
			isGeneratingPdf = false;
			onClose();
		}
	}

	async function handlePrint(): Promise<void> {
		onClose();
		await tick();
		requestAnimationFrame(async () => {
			if (currentSimState) {
				await currentSimState.printReport();
			} else if (typeof window !== 'undefined') {
				window.print();
			}
		});
	}

	function handleExportCSV(): void {
		if (!currentSimState) return;
		const name = csvFileName.trim().length > 0 ? csvFileName.trim() : undefined;
		const scenId = selectedCsvScenario.trim().length > 0 ? selectedCsvScenario : undefined;
		currentSimState.exportCSV(scenId, name);
		onClose();
	}

	async function handleExportBackup(): Promise<void> {
		if (!currentSimState) return;
		backupStatus = '';
		isBackupError = false;
		const result = await currentSimState.exportBackup();
		if (result) {
			backupStatus = 'Copia de seguridad generada y descargada.';
			isBackupError = false;
		} else {
			backupStatus = currentSimState.errorMessage || 'Error al exportar la copia.';
			isBackupError = true;
		}
	}

	async function handleFileSelect(e: Event): Promise<void> {
		if (!(e.target instanceof HTMLInputElement)) return;
		const target = e.target;
		const file = target.files?.[0];
		if (!file || !currentSimState) return;

		isRestoring = true;
		backupStatus = '';
		isBackupError = false;

		try {
			const text = await file.text();
			const success = await currentSimState.importBackup(text);
			if (success) {
				backupStatus = 'Copia de seguridad restaurada exitosamente.';
				isBackupError = false;
				setTimeout(() => {
					onClose();
				}, 1000);
			} else {
				backupStatus = currentSimState.errorMessage || 'Error al validar o restaurar la copia.';
				isBackupError = true;
			}
		} catch (err) {
			backupStatus = err instanceof Error ? err.message : 'Error al leer el archivo.';
			isBackupError = true;
		} finally {
			isRestoring = false;
			if (target) target.value = '';
		}
	}
</script>

<AppDialog
	open={isOpen}
	title="Exportación y Portabilidad"
	subtitle="Genera reportes PDF / A4, exporta datos CSV y gestiona copias"
	icon="📄"
	titleId="export-dialog-title"
	maxWidth="560px"
	onclose={onClose}
>
	<!-- Navegación de pestañas internas estilo Material Tabs -->
	<div class="tab-bar-nav" role="tablist">
		<button
			type="button"
			role="tab"
			id="tab-btn-pdf"
			aria-selected={activeExportTab === 'pdf'}
			class="tab-nav-btn {activeExportTab === 'pdf' ? 'tab-nav-active' : ''}"
			onclick={() => { activeExportTab = 'pdf'; }}
		>
			<span class="tab-icon">📄</span>
			<span>Reporte PDF</span>
		</button>
		<button
			type="button"
			role="tab"
			id="tab-btn-csv"
			aria-selected={activeExportTab === 'csv'}
			class="tab-nav-btn {activeExportTab === 'csv' ? 'tab-nav-active' : ''}"
			onclick={() => { activeExportTab = 'csv'; }}
		>
			<span class="tab-icon">📊</span>
			<span>Proyección CSV</span>
		</button>
		<button
			type="button"
			role="tab"
			id="tab-btn-backup"
			aria-selected={activeExportTab === 'backup'}
			class="tab-nav-btn {activeExportTab === 'backup' ? 'tab-nav-active' : ''}"
			onclick={() => { activeExportTab = 'backup'; }}
		>
			<span class="tab-icon">💾</span>
			<span>Backup / Copia</span>
		</button>
		<button
			type="button"
			role="tab"
			id="tab-btn-share"
			aria-selected={activeExportTab === 'share'}
			class="tab-nav-btn {activeExportTab === 'share' ? 'tab-nav-active' : ''}"
			onclick={() => { activeExportTab = 'share'; }}
		>
			<span class="tab-icon">🔗</span>
			<span>Compartir</span>
		</button>
	</div>

	<div class="export-dialog-content">
		{#if activeExportTab === 'pdf'}
			<p class="modal-desc">
				El reporte se generará en formato A4 institucional con el resumen ejecutivo, tarjetas de
				escenarios y la tabla de capitalización mensual.
			</p>
			<div class="input-group">
				<label for="export-filename" class="input-label">Nombre del Documento (opcional)</label>
				<input
					id="export-filename"
					type="text"
					class="export-input"
					placeholder="Ej. InteresIt_Reporte_2026"
					bind:value={pdfFileName}
				/>
			</div>
		{:else if activeExportTab === 'csv'}
			<p class="modal-desc">
				Exporta la tabla completa de proyección financiera mensual a formato tabular .csv con
				los encabezados estándar de fiscalidad y capitalización.
			</p>
			<div class="input-group">
				<label for="csv-scenario-select" class="input-label">Escenario a Exportar</label>
				<select id="csv-scenario-select" class="export-select" bind:value={selectedCsvScenario}>
					{#if currentSimState}
						{#each currentSimState.inversiones as inv (inv.id)}
							<option value={inv.id}>
								{inv.nombre} ({inv.tasaAnual}% nominal)
								{inv.id === currentSimState.escenarioLider?.setting.id ? ' ★ Líder' : ''}
							</option>
						{/each}
						<option value="all">Todos los escenarios (con columna Escenario)</option>
					{/if}
				</select>
			</div>
			<div class="input-group" style="margin-top: 14px;">
				<label for="csv-filename" class="input-label">Nombre de archivo .csv (opcional)</label>
				<input
					id="csv-filename"
					type="text"
					class="export-input"
					placeholder="Ej. InteresIt_Proyeccion_Mensual"
					bind:value={csvFileName}
				/>
			</div>
		{:else if activeExportTab === 'backup'}
			<p class="modal-desc">
				Respalda todos tus portafolios y parámetros en un archivo .json seguro para transferirlos
				o restaurarlos en cualquier momento sin perder datos.
			</p>
			<div class="backup-actions-grid">
				<div class="backup-card">
					<span class="backup-card-title">📤 Exportar Backup</span>
					<span class="backup-card-sub">Descarga todos los portafolios en JSON</span>
					<AppButton variant="secondary" onclick={handleExportBackup} class="backup-btn">
						Descargar Backup JSON
					</AppButton>
				</div>
				<div class="backup-card">
					<span class="backup-card-title">📥 Restaurar Backup</span>
					<span class="backup-card-sub">Importa y valida un archivo de respaldo</span>
					<input
						type="file"
						accept=".json,application/json"
						id="backup-file-input"
						class="hidden-file-input"
						bind:this={fileInputRef}
						onchange={handleFileSelect}
					/>
					<AppButton
						variant="secondary"
						disabled={isRestoring}
						onclick={() => fileInputRef?.click()}
						class="backup-btn"
					>
						{#if isRestoring}
							<AppSpinner size="sm" color="#004851" />
							<span style="margin-left: 6px;">Restaurando...</span>
						{:else}
							<span>Seleccionar Archivo JSON</span>
						{/if}
					</AppButton>
				</div>
			</div>
			{#if backupStatus}
				<div class="status-box {isBackupError ? 'status-box-error' : 'status-box-ok'}">
					{backupStatus}
				</div>
			{/if}
		{:else if activeExportTab === 'share'}
			{#if currentSimState}
				<ShareExportTab state={currentSimState} />
			{/if}
		{/if}
	</div>

	{#snippet actions()}
		<AppButton variant="secondary" onclick={onClose}>
			Cerrar
		</AppButton>
		{#if activeExportTab === 'pdf'}
			<AppButton variant="secondary" onclick={handlePrint}>
				Imprimir
			</AppButton>
			<AppButton
				variant="primary"
				onclick={handleExportPDF}
				disabled={isGeneratingPdf}
				class="confirm-btn"
			>
				{#if isGeneratingPdf}
					<AppSpinner size="sm" color="#ffffff" />
					<span style="margin-left: 6px;">Generando...</span>
				{:else}
					<span>Guardar PDF</span>
				{/if}
			</AppButton>
		{:else if activeExportTab === 'csv'}
			<AppButton variant="primary" onclick={handleExportCSV} class="confirm-btn" id="btn-download-csv">
				Descargar CSV
			</AppButton>
		{/if}
	{/snippet}
</AppDialog>

<style>
	.tab-bar-nav { display: flex; border-bottom: 2px solid #edf2f0; margin: -6px -4px 18px -4px; gap: 4px; }
	.tab-nav-btn { appearance: none; border: none; background: transparent; padding: 10px 14px; font-size: 0.8125rem; font-weight: 600; color: #5e6b6a; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s ease; border-radius: 6px 6px 0 0; }
	.tab-nav-btn:hover { color: #14201f; background: rgba(0, 72, 81, 0.04); }
	.tab-nav-active { color: #004851; border-bottom-color: #004851; font-weight: 700; background: rgba(0, 72, 81, 0.05); }
	.tab-icon { font-size: 1rem; }
	.export-dialog-content { display: flex; flex-direction: column; gap: 16px; }
	.modal-desc { margin: 0; font-size: 0.8125rem; line-height: 1.5; color: #5e6b6a; }
	.input-group { display: flex; flex-direction: column; gap: 6px; }
	.input-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #4f5d5c; }
	.export-input, .export-select { width: 100%; box-sizing: border-box; background: #f6f8fb; border: 1px solid #d5dedc; border-radius: 10px; padding: 10px 14px; font-size: 0.875rem; font-weight: 600; color: #14201f; outline: none; transition: all 0.2s ease; }
	.export-input:focus, .export-select:focus { border-color: #004851; background: #ffffff; box-shadow: 0 0 0 3px rgba(0, 72, 81, 0.12); }
	.backup-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
	@media (max-width: 500px) { .backup-actions-grid { grid-template-columns: 1fr; } }
	.backup-card { display: flex; flex-direction: column; gap: 6px; padding: 14px; border: 1px solid #d5dedc; border-radius: 12px; background: #f8fafc; }
	.backup-card-title { font-size: 0.875rem; font-weight: 700; color: #14201f; }
	.backup-card-sub { font-size: 0.75rem; color: #5e6b6a; margin-bottom: 8px; }
	.hidden-file-input { display: none; }
	.status-box { padding: 12px 14px; border-radius: 10px; font-size: 0.8125rem; line-height: 1.4; font-weight: 600; }
	.status-box-ok { background: #e6f4ea; color: #137333; border: 1px solid #ceead6; }
	.status-box-error { background: #fce8e6; color: #c5221f; border: 1px solid #fad2cf; }

	:global(html.dark) .tab-bar-nav { border-bottom-color: #1e293b; }
	:global(html.dark) .tab-nav-btn { color: #a3b0c6; }
	:global(html.dark) .tab-nav-btn:hover { color: #e7eef8; background: rgba(127, 209, 216, 0.08); }
	:global(html.dark) .tab-nav-active { color: #7fd1d8; border-bottom-color: #7fd1d8; background: rgba(127, 209, 216, 0.12); }
	:global(html.dark) .modal-desc, :global(html.dark) .input-label, :global(html.dark) .backup-card-sub { color: #a3b0c6; }
	:global(html.dark) .backup-card-title { color: #e7eef8; }
	:global(html.dark) .export-input, :global(html.dark) .export-select, :global(html.dark) .backup-card { background: #0b1120; border-color: #26334e; color: #e7eef8; }
	:global(html.dark) .export-input:focus, :global(html.dark) .export-select:focus { border-color: #7fd1d8; box-shadow: 0 0 0 3px rgba(127, 209, 216, 0.2); }
	:global(html.dark) .status-box-ok { background: #064e3b; color: #6ee7b7; border-color: #047857; }
	:global(html.dark) .status-box-error { background: #450a0a; color: #f87171; border-color: #7f1d1d; }
</style>
