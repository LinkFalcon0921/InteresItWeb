import { test, expect } from '@playwright/test';

test.describe('Portabilidad de Datos & Exportación E2E', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('domcontentloaded');
	});

	test('debe exportar la proyección mensual en formato CSV con los encabezados requeridos', async ({ page }) => {
		// Abrir diálogo de exportación desde la pestaña de reporte o header
		const tabReporte = page.locator('#tab-reporte');
		await tabReporte.click();

		const configExportBtn = page.locator('.export-action-btn');
		await configExportBtn.click();

		const dialogTitle = page.locator('#export-dialog-title');
		await expect(dialogTitle).toBeVisible();

		// Cambiar a la pestaña de CSV
		const csvTabBtn = page.locator('#tab-btn-csv');
		await csvTabBtn.click();

		// Descargar CSV
		const downloadPromise = page.waitForEvent('download');
		const downloadCsvBtn = page.locator('#btn-download-csv');
		await downloadCsvBtn.click();
		const download = await downloadPromise;

		expect(download.suggestedFilename()).toContain('.csv');

		// Leer el contenido del archivo descargado
		const stream = await download.createReadStream();
		if (!stream) {
			throw new Error('No se pudo abrir el stream del archivo descargado.');
		}

		const chunks: Buffer[] = [];
		for await (const chunk of stream) {
			chunks.push(Buffer.from(chunk));
		}
		const csvContent = Buffer.concat(chunks).toString('utf-8');

		// Verificar encabezados exactos del core financiero
		expect(csvContent).toContain(
			'Período,Fecha de Corte,Días,Saldo Inicial,Interés Bruto,Retención Ley 10% (RD),Interés Neto,Aporte Mensual,Saldo Final'
		);
		// Debe contener datos de cálculo
		expect(csvContent).toContain('2026-');
	});

	test('debe permitir descargar un backup JSON y restaurarlo validando su integridad', async ({ page }) => {
		// 1. Abrir diálogo de exportación
		const exportBtn = page.locator('#tour-export');
		await exportBtn.click();

		// 2. Ir a pestaña de Backup
		const backupTabBtn = page.locator('#tab-btn-backup');
		await backupTabBtn.click();

		// 3. Descargar Backup JSON
		const downloadPromise = page.waitForEvent('download');
		const exportBackupBtn = page.locator('button', { hasText: 'Descargar Backup JSON' });
		await exportBackupBtn.click();
		const download = await downloadPromise;

		expect(download.suggestedFilename()).toContain('.json');

		const stream = await download.createReadStream();
		if (!stream) {
			throw new Error('No se pudo abrir el stream del backup JSON.');
		}

		const chunks: Buffer[] = [];
		for await (const chunk of stream) {
			chunks.push(Buffer.from(chunk));
		}
		const jsonString = Buffer.concat(chunks).toString('utf-8');
		const backupData = JSON.parse(jsonString) as {
			app: string;
			version: string;
			portfolios: Array<{ id: string; name: string }>;
			settings: { montoInicial: number };
		};

		expect(backupData.app).toBe('InteresIt');
		expect(backupData.version).toBe('2.2.0');
		expect(Array.isArray(backupData.portfolios)).toBe(true);
		expect(backupData.portfolios.length).toBeGreaterThan(0);

		// 4. Modificar un valor en el simulador
		const closeBtn = page.locator('.modal-header .close-btn');
		await closeBtn.click();

		const montoInput = page.locator('.desktop-sidebar #monto-inicial-input');
		await montoInput.fill('999999');
		await montoInput.dispatchEvent('input');

		// 5. Re-abrir y restaurar desde el archivo de backup
		await exportBtn.click();
		await backupTabBtn.click();

		// Subir el archivo descargado
		const fileInput = page.locator('#backup-file-input');
		await fileInput.setInputFiles({
			name: 'backup_test.json',
			mimeType: 'application/json',
			buffer: Buffer.from(jsonString)
		});

		// Verificar mensaje de confirmación
		await expect(page.locator('.status-box-ok')).toContainText('Copia de seguridad restaurada');
	});
});
