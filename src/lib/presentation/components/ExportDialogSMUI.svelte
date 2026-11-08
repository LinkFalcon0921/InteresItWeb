<script lang="ts">
	import Button, { Label } from '@smui/button';
	import type { SimulatorState } from '../state/SimulatorState.svelte';

	interface Props {
		state?: SimulatorState;
		simState?: SimulatorState;
		isOpen: boolean;
		onClose: () => void;
	}

	let { state: stateProp, simState: simStateProp, isOpen, onClose }: Props = $props();
	const currentSimState = $derived(simStateProp ?? stateProp);

	let activeExportTab = $state<'pdf' | 'csv' | 'backup'>('pdf');

	// PDF state
	let pdfFileName = $state('');

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
		const name = pdfFileName.trim().length > 0 ? pdfFileName.trim() : undefined;
		if (currentSimState) {
			await currentSimState.exportPDF(name);
		}
		onClose();
	}

	async function handlePrint(): Promise<void> {
		if (currentSimState) {
			await currentSimState.printReport();
		}
		onClose();
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

{#if isOpen}
	<div
		class="modal-backdrop"
		role="button"
		tabindex="0"
		onclick={onClose}
		onkeydown={(e) => {
			if (e.key === 'Escape') onClose();
		}}
		aria-label="Cerrar modal de exportación"
	>
		<div
			class="modal-card"
			role="dialog"
			aria-labelledby="export-dialog-title"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<div class="modal-header">
				<h3 id="export-dialog-title" class="modal-title">Exportación y Portabilidad</h3>
				<button type="button" class="close-btn" onclick={onClose} aria-label="Cerrar">✕</button>
			</div>

			<!-- Navegación de pestañas internas -->
			<div class="tab-bar-nav" role="tablist">
				<button
					type="button"
					role="tab"
					id="tab-btn-pdf"
					aria-selected={activeExportTab === 'pdf'}
					class="tab-nav-btn {activeExportTab === 'pdf' ? 'tab-nav-active' : ''}"
					onclick={() => {
						activeExportTab = 'pdf';
					}}
				>
					📄 Reporte PDF / A4
				</button>
				<button
					type="button"
					role="tab"
					id="tab-btn-csv"
					aria-selected={activeExportTab === 'csv'}
					class="tab-nav-btn {activeExportTab === 'csv' ? 'tab-nav-active' : ''}"
					onclick={() => {
						activeExportTab = 'csv';
					}}
				>
					📊 Proyección CSV
				</button>
				<button
					type="button"
					role="tab"
					id="tab-btn-backup"
					aria-selected={activeExportTab === 'backup'}
					class="tab-nav-btn {activeExportTab === 'backup' ? 'tab-nav-active' : ''}"
					onclick={() => {
						activeExportTab = 'backup';
					}}
				>
					💾 Backup / Restaurar
				</button>
			</div>

			<div class="modal-body">
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

					<div class="input-group" style="margin-top: 12px;">
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
							<Button variant="outlined" onclick={handleExportBackup} class="backup-btn">
								<Label>Descargar Backup JSON</Label>
							</Button>
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
							<Button
								variant="outlined"
								disabled={isRestoring}
								onclick={() => fileInputRef?.click()}
								class="backup-btn"
							>
								<Label>{isRestoring ? 'Restaurando...' : 'Seleccionar Archivo JSON'}</Label>
							</Button>
						</div>
					</div>

					{#if backupStatus}
						<div class="status-box {isBackupError ? 'status-box-error' : 'status-box-ok'}">
							{backupStatus}
						</div>
					{/if}
				{/if}
			</div>

			<div class="modal-footer">
				<Button variant="outlined" onclick={onClose}>
					<Label>Cerrar</Label>
				</Button>

				{#if activeExportTab === 'pdf'}
					<Button variant="outlined" onclick={handlePrint}>
						<Label>Imprimir</Label>
					</Button>
					<Button variant="raised" onclick={handleExportPDF} class="confirm-btn">
						<Label>Guardar PDF</Label>
					</Button>
				{:else if activeExportTab === 'csv'}
					<Button variant="raised" onclick={handleExportCSV} class="confirm-btn" id="btn-download-csv">
						<Label>Descargar CSV</Label>
					</Button>
				{/if}
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

	.tab-bar-nav {
		display: flex;
		border-bottom: 1px solid #edf2f0;
		background: #f6f8fb;
	}

	.tab-nav-btn {
		flex: 1;
		appearance: none;
		border: none;
		background: transparent;
		padding: 10px 12px;
		font-size: 0.75rem;
		font-weight: 700;
		color: #5e6b6a;
		cursor: pointer;
		border-bottom: 2px solid transparent;
		transition: all 0.15s ease;
	}

	.tab-nav-btn:hover {
		color: #004851;
	}

	.tab-nav-active {
		color: #004851;
		background: #ffffff;
		border-bottom-color: #004851;
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

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.input-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #4f5d5c;
	}

	.export-input,
	.export-select {
		border: 1px solid #d5dedc;
		background: #f6f8fb;
		border-radius: 8px;
		padding: 10px 12px;
		font-size: 0.875rem;
		color: #14201f;
		outline: none;
	}

	.export-input:focus,
	.export-select:focus {
		border-color: #004851;
		background: #ffffff;
	}

	.backup-actions-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.backup-card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 12px;
		border: 1px solid #d5dedc;
		border-radius: 10px;
		background: #f6f8fb;
	}

	.backup-card-title {
		font-size: 0.8125rem;
		font-weight: 700;
		color: #14201f;
	}

	.backup-card-sub {
		font-size: 0.6875rem;
		color: #5e6b6a;
		margin-bottom: 6px;
	}

	.hidden-file-input {
		display: none;
	}

	.status-box {
		margin-top: 14px;
		padding: 10px 12px;
		border-radius: 8px;
		font-size: 0.8125rem;
		line-height: 1.4;
	}

	.status-box-ok {
		background: #e6f4ea;
		color: #137333;
		border: 1px solid #ceead6;
	}

	.status-box-error {
		background: #fce8e6;
		color: #c5221f;
		border: 1px solid #fad2cf;
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

	:global(.dark) .modal-header,
	:global(.dark) .tab-bar-nav {
		border-bottom-color: #1e293b;
		background: #0b1120;
	}

	:global(.dark) .tab-nav-btn {
		color: #a3b0c6;
	}

	:global(.dark) .tab-nav-active {
		color: #7fd1d8;
		background: #131c30;
		border-bottom-color: #7fd1d8;
	}

	:global(.dark) .modal-title {
		color: #e7eef8;
	}

	:global(.dark) .modal-desc,
	:global(.dark) .input-label,
	:global(.dark) .close-btn,
	:global(.dark) .backup-card-sub {
		color: #a3b0c6;
	}

	:global(.dark) .backup-card-title {
		color: #e7eef8;
	}

	:global(.dark) .close-btn:hover {
		background: #1e293b;
		color: #e7eef8;
	}

	:global(.dark) .export-input,
	:global(.dark) .export-select,
	:global(.dark) .backup-card {
		background: #0b1120;
		border-color: #26334e;
		color: #e7eef8;
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
