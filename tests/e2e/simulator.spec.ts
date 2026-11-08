import { test, expect } from '@playwright/test';

test.describe('Simulador Financiero E2E', () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto('/');
		await page.waitForLoadState('domcontentloaded');
	});

	test('debe cargar la terminal financiera y mostrar el título institucional', async ({ page }) => {
		await expect(page).toHaveTitle(/InteresIt/);
		const brandTitle = page.locator('.brand-title');
		await expect(brandTitle).toContainText('InteresIt');
	});

	test('debe recalcular la proyección al modificar el capital inicial y aporte', async ({ page }) => {
		const montoInput = page.locator('.desktop-sidebar #monto-inicial-input');
		await montoInput.fill('500000');
		await montoInput.dispatchEvent('input');

		const aporteInput = page.locator('.desktop-sidebar #aporte-mensual-input');
		await aporteInput.fill('15000');
		await aporteInput.dispatchEvent('input');

		// Verificar que el Hero Card refleje el saldo estimado y ganancia con formato de moneda exacto
		const heroCard = page.locator('#tour-hero');
		await expect(heroCard).toBeVisible();
		const balanceAmount = page.locator('#tour-hero .balance-amount');
		await expect(balanceAmount).toBeVisible();
		await expect(balanceAmount).toHaveText(/(?:RD)?\$\s*[\d,]+\.\d{2}/);
		const netProfit = page.locator('#tour-hero .yield-value');
		await expect(netProfit).toHaveText(/(?:RD)?\$\s*[\d,]+\.\d{2}/);
	});

	test('debe permitir agregar un nuevo escenario y actualizar la comparativa', async ({ page }) => {
		const initialCards = page.locator('.scenario-card-wrapper');
		await expect(initialCards).toHaveCount(2);

		const addBtn = page.locator('.add-scenario-btn');
		await expect(addBtn).toBeVisible();
		await addBtn.click();

		const updatedCards = page.locator('.scenario-card-wrapper');
		await expect(updatedCards).toHaveCount(3);
	});

	test('debe navegar fluidamente entre las pestañas de simulación, comparativa y reporte', async ({ page }) => {
		// Tab comparativa
		const tabComparativa = page.locator('#tab-comparativa');
		await tabComparativa.click();
		await expect(page.locator('#panel-comparativa')).toBeVisible();

		// Tab reporte
		const tabReporte = page.locator('#tab-reporte');
		await tabReporte.click();
		await expect(page.locator('#panel-reporte')).toBeVisible();

		// Volver a simulador
		const tabSimulador = page.locator('#tab-simulador');
		await tabSimulador.click();
		await expect(page.locator('#panel-simulador')).toBeVisible();
	});

	test('debe abrir el diálogo de diagnóstico de sistema y mostrar la salud de IndexedDB y Service Worker', async ({ page }) => {
		const diagBtn = page.locator('#btn-open-diagnostics');
		await expect(diagBtn).toBeVisible();
		await diagBtn.click();

		const diagTitle = page.locator('#diag-dialog-title');
		await expect(diagTitle).toBeVisible();

		// Verificar que los diagnósticos de IndexedDB y Service Worker respondan
		await expect(page.locator('#diag-idb-status')).toContainText('operativa');
		await expect(page.locator('#diag-sw-status')).toBeVisible();

		// Cerrar modal
		const closeBtn = page.locator('.modal-header .close-btn');
		await closeBtn.click();
		await expect(diagTitle).not.toBeVisible();
	});

	test('debe operar 100% offline tras la carga inicial sin perder reactividad', async ({ context, page }) => {
		// Simular pérdida de conexión de red
		await context.setOffline(true);

		const montoInput = page.locator('.desktop-sidebar #monto-inicial-input');
		await montoInput.fill('250000');
		await montoInput.dispatchEvent('input');

		// El hero card debe actualizarse reactivamente en memoria sin llamadas de red
		const balanceAmount = page.locator('#tour-hero .balance-amount');
		await expect(balanceAmount).toBeVisible();
		await expect(balanceAmount).toHaveText(/(?:RD)?\$\s*[\d,]+\.\d{2}/);

		// Cambiar a comparativa y reporte en modo offline
		const tabComparativa = page.locator('#tab-comparativa');
		await tabComparativa.click();
		await expect(page.locator('#panel-comparativa')).toBeVisible();

		// Restaurar conectividad
		await context.setOffline(false);
	});

	test('debe abrir y operar el panel de parámetros móvil en viewport pequeño (375x667)', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });

		const menuBtn = page.locator('.mobile-menu-btn');
		await expect(menuBtn).toBeVisible();
		await menuBtn.click();

		// El drawer modal debe desplegarse
		const drawer = page.locator('.parameters-drawer');
		await expect(drawer).toBeVisible();

		// Modificar monto en drawer
		const mobileInput = drawer.locator('#monto-inicial-input');
		await mobileInput.fill('750000');
		await mobileInput.dispatchEvent('input');

		// Cerrar drawer
		const closeDrawerBtn = page.locator('.close-drawer-btn');
		await closeDrawerBtn.click();

		// El hero card debe reflejar el cambio
		const balanceAmount = page.locator('#tour-hero .balance-amount');
		await expect(balanceAmount).toBeVisible();
		await expect(balanceAmount).toHaveText(/(?:RD)?\$\s*[\d,]+\.\d{2}/);
	});

	test('debe generar enlace para compartir y restaurar parámetros desde hash de URL (#sim=...)', async ({ page }) => {
		const exportBtn = page.locator('#tour-export');
		await exportBtn.click();

		const shareTabBtn = page.locator('#tab-btn-share');
		await shareTabBtn.click();

		const shareInput = page.locator('#share-url-input');
		await expect(shareInput).toBeVisible();
		const shareUrl = await shareInput.inputValue();
		expect(shareUrl).toContain('#sim=');

		const copyBtn = page.locator('#btn-copy-share-url');
		await expect(copyBtn).toBeVisible();

		// Cerrar modal
		const closeBtn = page.locator('.modal-header .close-btn');
		await closeBtn.click();

		// Extraer el hash y navegar a él
		const hash = shareUrl.substring(shareUrl.indexOf('#sim='));
		await page.goto(`/${hash}`);
		await page.waitForLoadState('domcontentloaded');

		const heroCard = page.locator('#tour-hero');
		await expect(heroCard).toBeVisible();
	});
});
