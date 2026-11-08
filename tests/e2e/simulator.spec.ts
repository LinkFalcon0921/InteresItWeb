import { test, expect } from '@playwright/test';

test.describe('Simulador Financiero E2E', () => {
	test.beforeEach(async ({ page }) => {
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

		// Verificar que el Hero Card refleje el saldo estimado y ganancia
		const heroCard = page.locator('#tour-hero');
		await expect(heroCard).toBeVisible();
		await expect(heroCard).toContainText('RD$');
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
});
