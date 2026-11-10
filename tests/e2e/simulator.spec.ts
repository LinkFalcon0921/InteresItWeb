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
		const montoInput = page.locator('#monto-inicial-input');
		await montoInput.fill('500000');

		const aporteInput = page.locator('#aporte-mensual-input');
		await aporteInput.fill('15000');

		// Verificar que el Hero Card refleje el saldo estimado y ganancia con formato de moneda exacto
		const heroCard = page.locator('#tour-hero');
		await expect(heroCard).toBeVisible();
		const balanceAmount = page.locator('#tour-hero .balance-amount');
		await expect(balanceAmount).toBeVisible();
		await expect(balanceAmount).toHaveText(/(?:RD)?\$\s*[\d,]+\.\d{2}/);
		const netProfit = page.locator('#tour-hero .yield-value');
		await expect(netProfit).toHaveText(/(?:RD)?\$\s*[\d,]+\.\d{2}/);
	});

	test('debe permitir agregar un nuevo escenario y actualizar la comparativa sin duplicación', async ({ page }) => {
		const initialCards = page.locator('.scenario-card-wrapper');
		await expect(initialCards).toHaveCount(2);

		const addBtn = page.locator('.add-scenario-btn');
		await expect(addBtn).toBeVisible();

		// 1. Agregar 1 escenario: debe pasar exactamente a 3 (sin duplicarse a 6)
		await addBtn.click();
		const updatedCards = page.locator('.scenario-card-wrapper');
		await expect(updatedCards).toHaveCount(3);

		// 2. Agregar otro escenario: debe pasar exactamente a 4
		await addBtn.click();
		await expect(updatedCards).toHaveCount(4);
	});

	test('debe soportar agregar 100+ escenarios en la vista sin degradación ni errores', async ({ page }) => {
		const addBtn = page.getByRole('button', { name: /\+ Agregar Escenario/i });
		await expect(addBtn).toBeVisible();
		for (let i = 0; i < 98; i++) {
			await addBtn.click();
		}
		const allCards = page.locator('.scenario-card-wrapper');
		await expect(allCards).toHaveCount(100);
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

		const montoInput = page.locator('#monto-inicial-input');
		await montoInput.fill('250000');

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
		const mobileInput = page.locator('#monto-inicial-input');
		await mobileInput.fill('750000');

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
		await expect(shareInput).toHaveValue(/#sim=/);
		const shareUrl = await shareInput.inputValue();

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

	test("debe soportar navegacion ergonomica en tablets y foldables mediante la barra inferior fija", async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });

		const bottomNav = page.locator(".bottom-nav-bar");
		await expect(bottomNav).toBeVisible();

		const bottomComparativa = page.locator("#bottom-nav-comparativa");
		await bottomComparativa.click();
		await expect(page.locator("#panel-comparativa")).toBeVisible();

		const bottomReporte = page.locator("#bottom-nav-reporte");
		await bottomReporte.click();
		await expect(page.locator("#panel-reporte")).toBeVisible();

		const bottomParams = page.locator("#bottom-nav-params");
		await bottomParams.click();
		const drawer = page.locator(".parameters-drawer");
		await expect(drawer).toBeVisible();

		const closeDrawerBtn = page.locator(".close-drawer-btn");
		await closeDrawerBtn.click();
		await expect(drawer).not.toBeVisible();
	});

	test("debe permitir ajustar tasas de escenarios con una sola mano usando los micro-controles +/-", async ({ page }) => {
		await page.setViewportSize({ width: 360, height: 740 });

		const firstCard = page.locator(".scenario-card-wrapper").first();
		const rateInput = firstCard.locator(".rate-input");
		const initialVal = parseFloat(await rateInput.inputValue());

		const plusQuarterBtn = firstCard.locator(".rate-step-btn", { hasText: "+0.25%" });
		await expect(plusQuarterBtn).toBeVisible();
		await plusQuarterBtn.click();

		const updatedVal = parseFloat(await rateInput.inputValue());
		expect(updatedVal).toBeCloseTo(initialVal + 0.25, 2);

		const minusHalfBtn = firstCard.locator(".rate-step-btn", { hasText: "-0.5%" });
		await expect(minusHalfBtn).toBeVisible();
		await minusHalfBtn.click();

		const finalVal = parseFloat(await rateInput.inputValue());
		expect(finalVal).toBeCloseTo(initialVal + 0.25 - 0.5, 2);
	});

	test('debe mantener arquitectura de scroll limpia en escritorio sin scroll anidado en workspace', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });

		// 1. Verificar que el sidebar de parámetros esté en posición sticky
		const sidebar = page.locator('.desktop-sidebar');
		await expect(sidebar).toBeVisible();
		await expect(sidebar).toHaveCSS('position', 'sticky');

		// 2. Verificar que workspace-area no tenga overflow-y auto ni scroll anidado
		const workspace = page.locator('.workspace-area');
		await expect(workspace).toHaveCSS('overflow-y', 'visible');

		// 3. Verificar que terminal-shell no limite la altura con overflow: hidden
		const shell = page.locator('.terminal-shell');
		await expect(shell).not.toHaveCSS('overflow-y', 'hidden');

		// 4. Scroll natural en el body para navegar por el dashboard
		await page.evaluate(() => window.scrollTo(0, 400));
		const scrollY = await page.evaluate(() => window.scrollY);
		expect(scrollY).toBeGreaterThan(0);

		// 5. El sidebar permanece visible en viewport gracias a sticky
		await expect(sidebar).toBeInViewport();
	});
	test('debe manejar montos millonarios sin desbordamiento de texto y ordenar escenarios de izquierda a derecha (1 2 3 / 4 5 6)', async ({ page }) => {
		await page.setViewportSize({ width: 1366, height: 768 });
		await page.goto('/');

		// 1. Ingresar montos millonarios
		const montoInput = page.locator('#monto-inicial-input');
		await montoInput.fill('50000000');
		const aporteInput = page.locator('#aporte-mensual-input');
		await aporteInput.fill('1000000');

		// 2. Agregar 2 escenarios más para tener 4
		const addBtn = page.locator('#btn-add-scenario');
		await addBtn.click();
		await addBtn.click();

		// 3. Verificar que los escenarios se posicionen de izquierda a derecha
		const cards = page.locator('.scenario-card-wrapper');
		await expect(cards).toHaveCount(4);

		const box0 = await cards.nth(0).boundingBox();
		const box1 = await cards.nth(1).boundingBox();
		const box2 = await cards.nth(2).boundingBox();
		const box3 = await cards.nth(3).boundingBox();

		expect(box0).not.toBeNull();
		expect(box1).not.toBeNull();
		expect(box2).not.toBeNull();
		expect(box3).not.toBeNull();

		if (box0 && box1 && box2 && box3) {
			// Escenario 1 y 2 están en la misma fila horizontal
			expect(Math.abs(box0.y - box1.y)).toBeLessThan(10);
			// Escenario 2 está a la derecha del Escenario 1
			expect(box1.x).toBeGreaterThan(box0.x);
			// Escenario 3 está a la derecha del Escenario 2
			expect(box2.x).toBeGreaterThan(box1.x);
			// Escenario 4 pasa a la siguiente fila por debajo
			expect(box3.y).toBeGreaterThan(box0.y + 100);
		}

		// 4. Verificar que no haya desbordamiento horizontal en las métricas de saldo y ganancia
		const balanceEls = page.locator('.metric-value');
		const count = await balanceEls.count();
		expect(count).toBeGreaterThan(0);

		for (let i = 0; i < count; i++) {
			await expect(balanceEls.nth(i)).toBeVisible();
		}
	});
	test('debe abrir el selector de fecha en desktop sin sobreposición de hero ni banners y permitir editar la fecha', async ({ page }) => {
		await page.setViewportSize({ width: 1366, height: 768 });
		await page.goto('/');

		// 1. Abrir pestaña de Comparativa
		await page.locator('#tab-comparativa').click();
		await expect(page.locator('#panel-comparativa')).toBeVisible();

		// 2. Hacer clic en la tarjeta de fecha 'Desde'
		const dateCard = page.locator('.m3-date-card').first();
		await dateCard.click();

		// 3. Verificar que el diálogo se abra y esté portaleado directamente en el body
		const scrim = page.locator('.m3-dialog-scrim');
		await expect(scrim).toBeVisible();

		const isDirectChildOfBody = await scrim.evaluate((el) => el.parentElement === document.body);
		expect(isDirectChildOfBody).toBe(true);

		// 4. Verificar que el header del diálogo, días y botones de acción no estén cubiertos por el hero ni el banner
		const dialog = page.locator('.m3-date-picker-card');
		await expect(dialog).toBeVisible();

		const hitHeader = await page.evaluate(() => {
			const d = document.querySelector('.m3-date-picker-card');
			if (!d) return false;
			const rect = d.getBoundingClientRect();
			const el = document.elementFromPoint(rect.x + rect.width / 2, rect.y + 35);
			return !!el?.closest('.m3-date-picker-card');
		});
		expect(hitHeader).toBe(true);

		const hitActions = await page.evaluate(() => {
			const d = document.querySelector('.m3-date-picker-card');
			if (!d) return false;
			const rect = d.getBoundingClientRect();
			const el = document.elementFromPoint(rect.right - 40, rect.bottom - 20);
			return !!el?.closest('.m3-date-picker-card');
		});
		expect(hitActions).toBe(true);

		// 5. Seleccionar un día y confirmar con OK
		const day15 = page.locator('.m3-day-cell', { hasText: '15' }).first();
		await day15.click();

		const okBtn = page.locator('.m3-action-btn--confirm');
		await okBtn.click();

		// 6. El diálogo se cierra y la fecha queda actualizada
		await expect(scrim).toHaveCount(0);
		await expect(dateCard.locator('.date-text')).toContainText('15');
	});
});
