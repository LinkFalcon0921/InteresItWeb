import { test, expect } from '@playwright/test';

test.describe('Gestión de Multi-Portafolios E2E', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('domcontentloaded');
	});

	test('debe permitir crear, alternar, renombrar y eliminar portafolios', async ({ page }) => {
		// 1. Abrir diálogo de portafolios
		const portfolioBtn = page.locator('#portfolio-manager-btn');
		await expect(portfolioBtn).toBeVisible();
		await portfolioBtn.click();

		const dialogTitle = page.locator('#portfolio-dialog-title');
		await expect(dialogTitle).toBeVisible();

		// 2. Crear nuevo portafolio
		const newNameInput = page.locator('input[placeholder="Nombre del nuevo portafolio..."]');
		await newNameInput.fill('Fondo de Oportunidad');

		const createBtn = page.locator('button.create-btn');
		await createBtn.click();

		// Verificar banner y que el header refleje el nuevo portafolio activo
		await expect(page.locator('.status-banner')).toContainText('Portafolio creado y activado');
		await expect(portfolioBtn).toContainText('Fondo de Oportunidad');

		// Esperar que el modal se cierre automáticamente tras la creación
		await expect(dialogTitle).not.toBeVisible();

		// 3. Volver a abrir el diálogo para renombrar el nuevo portafolio
		await portfolioBtn.click();
		await expect(dialogTitle).toBeVisible();

		// Buscar el item de "Fondo de Oportunidad" para renombrarlo
		const nuevoItem = page.locator('.portfolio-item', { hasText: 'Fondo de Oportunidad' });
		const renameBtn = nuevoItem.locator('button', { hasText: 'Renombrar' });
		await renameBtn.click();

		const renameInput = page.locator('input.rename-input');
		await renameInput.fill('Fondo Inmobiliario 2026');

		const confirmRenameBtn = page.locator('button.confirm-rename-btn');
		await confirmRenameBtn.click();

		// Verificar que el nombre se actualizó en la lista
		await expect(page.locator('.portfolio-name', { hasText: 'Fondo Inmobiliario 2026' })).toBeVisible();

		// 4. Alternar de regreso a "Portafolio Principal"
		const principalItem = page.locator('.portfolio-item', { hasText: 'Portafolio Principal' });
		const activateBtn = principalItem.locator('button', { hasText: 'Activar' });
		await activateBtn.click();

		// Modal se cierra y el botón del header refleja el portafolio principal
		await expect(portfolioBtn).toContainText('Portafolio Principal');

		// 5. Eliminar el portafolio creado
		await portfolioBtn.click();
		await expect(dialogTitle).toBeVisible();

		const itemParaEliminar = page.locator('.portfolio-item', { hasText: 'Fondo Inmobiliario 2026' });
		const deleteBtn = itemParaEliminar.locator('button.delete-pill');
		await deleteBtn.click();

		// Verificar mensaje de éxito
		await expect(page.locator('.status-banner')).toContainText('Portafolio eliminado');
	});
});
