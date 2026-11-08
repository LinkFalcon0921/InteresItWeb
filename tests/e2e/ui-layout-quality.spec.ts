import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import { createFakeParameters, QA_FAKER_SEED } from '../fakes/ParametersFactory';

/**
 * QA — Calidad visual y de layout (criterios QA-UI-001..007).
 * Oráculos independientes del código: el DOM no debe tener IDs duplicados, solo debe existir
 * un formulario de parámetros alcanzable, sin desbordes horizontales, con orden estable al
 * redimensionar, botones reutilizados (SMUI) y diálogos ocultos en modo impresión.
 * Cada prueba adjunta una captura al reporte HTML (playwright-report/).
 */

interface ViewportCase {
	name: string;
	width: number;
	height: number;
	isMobile: boolean;
}

// Anchos: SE (375), iPhone 16 (393x852), iPhone 16 Pro Max (440x956), tablet, laptop, 1080p.
// Breakpoint de la app: 960px (+page.svelte).
const VIEWPORTS: ViewportCase[] = [
	{ name: 'iPhone SE 375x667', width: 375, height: 667, isMobile: true },
	{ name: 'iPhone 16 393x852', width: 393, height: 852, isMobile: true },
	{ name: 'iPhone 16 Pro Max 440x956', width: 440, height: 956, isMobile: true },
	{ name: 'Tablet 768x1024', width: 768, height: 1024, isMobile: true },
	{ name: 'Laptop 1280x800', width: 1280, height: 800, isMobile: false },
	{ name: 'Desktop 1920x1080', width: 1920, height: 1080, isMobile: false }
];

const PARAM_INPUT_IDS = [
	'monto-inicial-input',
	'aporte-mensual-input',
	'fecha-inicio-input',
	'fecha-fin-input',
	'dia-corte-input',
	'tasa-inflacion-input'
];

async function attachScreenshot(page: Page, testInfo: TestInfo, label: string): Promise<void> {
	await testInfo.attach(label, {
		body: await page.screenshot({ fullPage: true }),
		contentType: 'image/png'
	});
}

/** Inputs de parámetros con caja dentro del viewport horizontal (alcanzables por el usuario). */
async function countReachableParamInputs(page: Page, id: string): Promise<number> {
	return page.evaluate((inputId: string) => {
		const nodes = Array.from(document.querySelectorAll<HTMLElement>(`[id="${inputId}"]`));
		return nodes.filter((el) => {
			const r = el.getBoundingClientRect();
			let node: HTMLElement | null = el;
			while (node) {
				const s = getComputedStyle(node);
				if (s.display === 'none' || s.visibility === 'hidden') return false;
				node = node.parentElement;
			}
			return r.width > 0 && r.height > 0 && r.right > 0 && r.left < window.innerWidth;
		}).length;
	}, id);
}

async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
	const b = await locator.boundingBox();
	if (!b) throw new Error('Elemento sin caja visible');
	return b;
}

async function assertLayoutOrder(page: Page, isDesktopWidth: boolean): Promise<void> {
	const hero = await box(page.locator('#tour-hero'));
	const tabs = await box(page.locator('.tabs-nav'));
	const panel = await box(page.locator('#panel-simulador'));
	// Orden vertical del área de trabajo: hero → pestañas → contenido
	expect(hero.y + hero.height, 'hero debe estar sobre las pestañas').toBeLessThanOrEqual(tabs.y + 1);
	expect(tabs.y + tabs.height, 'pestañas deben estar sobre el panel').toBeLessThanOrEqual(panel.y + 1);

	const sidebar = page.locator('.desktop-sidebar');
	if (isDesktopWidth) {
		const side = await box(sidebar);
		expect(side.x + side.width, 'sidebar a la izquierda del área de trabajo').toBeLessThanOrEqual(hero.x + 1);
	} else {
		await expect(sidebar, 'sidebar no debe ocupar espacio en móvil').toBeHidden();
	}
}

test.describe('QA-UI Calidad visual y reutilización', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('domcontentloaded');
	});

	for (const vp of VIEWPORTS) {
		test.describe(`@${vp.name}`, () => {
			const isDesktopWidth = vp.width > 960;

			test.beforeEach(async ({ page }) => {
				await page.setViewportSize({ width: vp.width, height: vp.height });
				await expect(page.locator('#tour-hero')).toBeVisible();
			});

			test('QA-UI-001 los IDs del DOM son únicos (sin módulos de parámetros duplicados)', async ({ page }, testInfo) => {
				const duplicates = await page.evaluate(() => {
					const counts = new Map<string, number>();
					document.querySelectorAll('[id]').forEach((el) => counts.set(el.id, (counts.get(el.id) ?? 0) + 1));
					return [...counts.entries()].filter(([, n]) => n > 1).map(([id, n]) => `${id} x${n}`);
				});
				await attachScreenshot(page, testInfo, `dom-ids-${vp.name}`);
				expect(duplicates, `IDs duplicados: ${duplicates.join(', ')}`).toEqual([]);
			});

			test('QA-UI-002 solo hay un formulario de parámetros alcanzable (cerrado el drawer)', async ({ page }, testInfo) => {
				const expected = isDesktopWidth ? 1 : 0;
				for (const id of PARAM_INPUT_IDS) {
					const reachable = await countReachableParamInputs(page, id);
					expect(reachable, `#${id} alcanzable ${reachable}x (esperado ${expected})`).toBe(expected);
				}
				await attachScreenshot(page, testInfo, `params-form-${vp.name}`);
			});

			test('QA-UI-003 sin desbordes horizontales y controles del encabezado dentro del viewport', async ({ page }, testInfo) => {
				const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
				expect.soft(overflow, `scrollWidth excede el viewport en ${overflow}px`).toBeLessThanOrEqual(1);

				const controls = page.locator(
					'.mobile-menu-btn, #portfolio-manager-btn, #btn-open-diagnostics, #tour-export, [aria-label="Cambiar tema de color"]'
				);
				const count = await controls.count();
				for (let i = 0; i < count; i++) {
					const c = controls.nth(i);
					if (!(await c.isVisible())) continue;
					const b = await box(c);
					const label = (await c.getAttribute('id')) ?? (await c.getAttribute('aria-label')) ?? `control-${i}`;
					expect.soft(b.x, `${label} no debe salir por la izquierda`).toBeGreaterThanOrEqual(-1);
					expect.soft(b.x + b.width, `${label} no debe salir por la derecha`).toBeLessThanOrEqual(vp.width + 1);
				}
				await attachScreenshot(page, testInfo, `header-overflow-${vp.name}`);
			});

			test('QA-UI-004 el orden del layout se cumple y se mantiene al redimensionar', async ({ page }, testInfo) => {
				await assertLayoutOrder(page, isDesktopWidth);
				// Redimensionar al extremo opuesto y volver: el orden no debe degradarse
				await page.setViewportSize({ width: isDesktopWidth ? 375 : 1440, height: 800 });
				await assertLayoutOrder(page, !isDesktopWidth);
				await page.setViewportSize({ width: vp.width, height: vp.height });
				await assertLayoutOrder(page, isDesktopWidth);
				await attachScreenshot(page, testInfo, `order-${vp.name}`);
			});

			test('QA-UI-005 botones reutilizan el componente SMUI y tienen tamaño táctil mínimo', async ({ page }, testInfo) => {
				const add = page.locator('.add-scenario-btn');
				await expect(add).toHaveCount(1);
				await expect.soft(add, 'botón Agregar Escenario debe ser un mdc-button').toHaveClass(/mdc-button/);
				expect.soft((await box(add)).height, 'altura mínima propuesta 36px').toBeGreaterThanOrEqual(36);

				await page.locator('#btn-open-diagnostics').click();
				const dialog = page.locator('[role="dialog"]:visible').first();
				await expect(dialog).toBeVisible();
				const actions = dialog.locator('button:not(.close-btn)');
				const n = await actions.count();
				expect(n).toBeGreaterThan(0);
				for (let i = 0; i < n; i++) {
					const b = actions.nth(i);
					const text = ((await b.innerText()) || '').trim();
					if (text.length < 2) continue;
					await expect.soft(b, `botón "${text}" del diálogo debe ser mdc-button`).toHaveClass(/mdc-button/);
					expect.soft((await box(b)).height, `botón "${text}" altura mínima 36px`).toBeGreaterThanOrEqual(36);
				}
				await attachScreenshot(page, testInfo, `buttons-${vp.name}`);
			});

			if (vp.width <= 960) {
				test('QA-UI-006 drawer móvil: un solo formulario, sin deformación, y se cierra limpio', async ({ page }, testInfo) => {
					const params = createFakeParameters();
					await testInfo.attach('faker-seed', { body: String(QA_FAKER_SEED), contentType: 'text/plain' });

					await page.locator('.mobile-menu-btn').click();
					const drawer = page.locator('.parameters-drawer');
					await expect(drawer).toBeVisible();

					expect.soft(await countReachableParamInputs(page, 'monto-inicial-input'), 'un solo formulario con drawer abierto').toBe(1);

					const drawerBox = await box(drawer);
					expect(drawerBox.x, 'drawer no sale por la izquierda').toBeGreaterThanOrEqual(-1);
					expect(drawerBox.x + drawerBox.width, 'drawer cabe en el viewport').toBeLessThanOrEqual(vp.width + 1);

					const monto = drawer.locator('#monto-inicial-input');
					const mb = await box(monto);
					expect.soft(mb.width, 'input de monto no debe estar comprimido').toBeGreaterThanOrEqual(120);
					expect(mb.x + mb.width, 'input dentro del drawer').toBeLessThanOrEqual(drawerBox.x + drawerBox.width + 1);

					const before = await page.locator('#tour-hero .balance-amount').innerText();
					await monto.fill(String(params.montoInicial));
					await monto.dispatchEvent('input');
					await attachScreenshot(page, testInfo, `drawer-open-${vp.name}`);

					await page.locator('.close-drawer-btn').click();
					await expect
						.poll(() => countReachableParamInputs(page, 'monto-inicial-input'), {
							message: 'tras cerrar no debe quedar un formulario alcanzable'
						})
						.toBe(0);
					expect(await countReachableParamInputs(page, 'monto-inicial-input'), 'tras cerrar no debe quedar un formulario visible').toBe(0);
					const after = await page.locator('#tour-hero .balance-amount').innerText();
					expect(after, 'el hero refleja el monto generado por faker').not.toBe(before);
				});
			}
		});
	}

	test('QA-UI-007 al imprimir, los diálogos/modales y el drawer no aparecen en el documento', async ({ page }, testInfo) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.addInitScript(() => {
			(window as unknown as { __printCalls: number }).__printCalls = 0;
			window.print = (): void => {
				(window as unknown as { __printCalls: number }).__printCalls += 1;
			};
		});
		await page.reload();
		await page.locator('#tour-export').click();
		const dialog = page.locator('[role="dialog"]:visible').first();
		await expect(dialog).toBeVisible();

		// Fase 1: con el modal ABIERTO (como en la vista previa de impresión) emular @media print
		await page.emulateMedia({ media: 'print' });
		await testInfo.attach('print-media.png', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
		await testInfo.attach('print-media.pdf', { body: await page.pdf({ format: 'A4' }), contentType: 'application/pdf' });
		const visibleOverlays = await page.evaluate(() =>
			Array.from(
				document.querySelectorAll<HTMLElement>(
					'[role="dialog"], .mdc-dialog, .mdc-dialog__scrim, .mdc-drawer-scrim, .parameters-drawer'
				)
			)
				.filter((el) => {
					const s = getComputedStyle(el);
					const r = el.getBoundingClientRect();
					return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
				})
				.map((el) => el.className || el.getAttribute('role') || el.tagName)
		);
		expect.soft(visibleOverlays, `UI visible en impresión: ${visibleOverlays.join(' | ')}`).toEqual([]);

		// Fase 2: el botón Imprimir debe invocar window.print()
		await page.emulateMedia({ media: 'screen' });
		await dialog.getByRole('button', { name: /Imprimir/i }).click();
		await expect
			.poll(() => page.evaluate(() => (window as unknown as { __printCalls: number }).__printCalls), {
				message: 'se esperaba una llamada a window.print()'
			})
			.toBeGreaterThan(0);
	});
});