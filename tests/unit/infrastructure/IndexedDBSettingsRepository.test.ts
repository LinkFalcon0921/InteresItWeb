import { describe, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import {
	DB_NAME,
	DB_VERSION,
	STORE_NAME,
	CURRENT_SETTINGS_KEY,
	IndexedDBSettingsRepository
} from '$infrastructure';
import {
	DEFAULT_PORTFOLIO_ID,
	DEFAULT_PORTFOLIO_NAME,
	DEFAULT_SETTINGS_DTO,
	type PortfolioDTO,
	type SettingsDTO
} from '$application';

describe('IndexedDBSettingsRepository with real fake-indexeddb engine', () => {
	it('exports valid constants matching legacy InteresIt configuration', () => {
		expect(DB_NAME).toBe('InteresItDB');
		expect(DB_VERSION).toBe(1);
		expect(STORE_NAME).toBe('settings');
		expect(CURRENT_SETTINGS_KEY).toBe('current');
	});

	it('returns DEFAULT_SETTINGS_DTO when factory is not available', async () => {
		const repository = new IndexedDBSettingsRepository(undefined);
		const result = await repository.loadSettings();

		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toEqual(DEFAULT_SETTINGS_DTO);
		}
	});

	it('returns error on saveSettings when factory is not available', async () => {
		const repository = new IndexedDBSettingsRepository(undefined);
		const result = await repository.saveSettings(DEFAULT_SETTINGS_DTO);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.message).toContain('IndexedDB no está disponible');
		}
	});

	it('returns DEFAULT_SETTINGS_DTO when database is empty', async () => {
		const factory = new IDBFactory();
		const repository = new IndexedDBSettingsRepository(factory);

		const result = await repository.loadSettings();
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toEqual(DEFAULT_SETTINGS_DTO);
		}
		repository.close();
	});

	it('saves settings and loads them back correctly via real IndexedDB transaction', async () => {
		const factory = new IDBFactory();
		const repository = new IndexedDBSettingsRepository(factory);

		const customSettings: SettingsDTO = {
			id: 'current',
			montoInicial: 5000,
			aporteMensual: 250,
			inversiones: [
				{ id: 'inv-1', nombre: 'Certificado Banreservas', tasaAnual: 13.5, color: 'blue' },
				{ id: 'inv-2', nombre: 'Fondo Mutuo Pioneer', tasaAnual: 11.2, color: 'emerald' }
			],
			fechaInicio: '2026-01-15',
			fechaFin: '2026-12-15',
			diaCorte: 15,
			omitirPrimerCorte: true,
			aplicarImpuesto: true,
			isDarkMode: true
		};

		const saveResult = await repository.saveSettings(customSettings);
		expect(saveResult.ok).toBe(true);

		const loadResult = await repository.loadSettings();
		expect(loadResult.ok).toBe(true);
		if (loadResult.ok) {
			expect(loadResult.value.montoInicial).toBe(5000);
			expect(loadResult.value.aporteMensual).toBe(250);
			expect(loadResult.value.diaCorte).toBe(15);
			expect(loadResult.value.omitirPrimerCorte).toBe(true);
			expect(loadResult.value.aplicarImpuesto).toBe(true);
			expect(loadResult.value.isDarkMode).toBe(true);
			expect(loadResult.value.inversiones).toHaveLength(2);
			expect(loadResult.value.inversiones[0]?.tasaAnual).toBe(13.5);
			expect(loadResult.value.inversiones[1]?.tasaAnual).toBe(11.2);
		}
		repository.close();
	});

	it('maintains backwards compatibility with legacy format from index.html', async () => {
		const factory = new IDBFactory();
		const repository = new IndexedDBSettingsRepository(factory);

		// Initialize DB
		await repository.loadSettings();

		// Put legacy raw format directly into real IndexedDB store
		await new Promise<void>((resolve, reject) => {
			const req = factory.open(DB_NAME, DB_VERSION);
			req.onsuccess = () => {
				const db = req.result;
				const tx = db.transaction([STORE_NAME], 'readwrite');
				const store = tx.objectStore(STORE_NAME);
				store.put({
					id: 'current',
					montoInicial: '12500.50',
					aporteMensual: '500',
					inversiones: [
						{ nombre: 'Fondo Acelerador', tasa: '14.25', color: 'cyan' },
						{ nombre: 'Depósito Plazo', tasa: '9.0', color: 'orange' }
					],
					fechaInicio: '2026-03-01',
					fechaFin: '2026-09-01',
					diaCorte: '28',
					omitirPrimerCorte: false,
					aplicarImpuesto: true,
					isDarkMode: false
				});
				tx.oncomplete = () => {
					db.close();
					resolve();
				};
				tx.onerror = () => reject(tx.error);
			};
		});

		// Close repository cached handle so it reads updated raw store
		repository.close();

		const result = await repository.loadSettings();
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.montoInicial).toBe(12500.5);
			expect(result.value.aporteMensual).toBe(500);
			expect(result.value.diaCorte).toBe(28);
			expect(result.value.inversiones).toHaveLength(2);
			expect(result.value.inversiones[0]?.nombre).toBe('Fondo Acelerador');
			expect(result.value.inversiones[0]?.tasaAnual).toBe(14.25);
			expect(result.value.inversiones[1]?.nombre).toBe('Depósito Plazo');
			expect(result.value.inversiones[1]?.tasaAnual).toBe(9.0);
		}
		repository.close();
	});

	it('falls back to DEFAULT_SETTINGS_DTO gracefully when stored data is corrupted', async () => {
		const factory = new IDBFactory();
		const repository = new IndexedDBSettingsRepository(factory);

		await repository.loadSettings();

		await new Promise<void>((resolve, reject) => {
			const req = factory.open(DB_NAME, DB_VERSION);
			req.onsuccess = () => {
				const db = req.result;
				const tx = db.transaction([STORE_NAME], 'readwrite');
				const store = tx.objectStore(STORE_NAME);
				store.put({
					id: 'current',
					montoInicial: 'INVALID_NUMBER_STRING',
					fechaInicio: 'NOT_A_DATE'
				});
				tx.oncomplete = () => {
					db.close();
					resolve();
				};
				tx.onerror = () => reject(tx.error);
			};
		});

		repository.close();

		const result = await repository.loadSettings();
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toEqual(DEFAULT_SETTINGS_DTO);
		}
		repository.close();
	});

	it('handles failure when factory open fails', async () => {
		const faultyFactory = {
			open: () => {
				const req = {} as IDBOpenDBRequest;
				setTimeout(() => {
					Object.defineProperty(req, 'error', { value: new Error('Error simulado en hardware o cuota') });
					req.onerror?.call(req, new Event('error'));
				}, 0);
				return req;
			}
		} as unknown as IDBFactory;

		const repository = new IndexedDBSettingsRepository(faultyFactory);
		const loadResult = await repository.loadSettings();
		expect(loadResult.ok).toBe(false);
		if (!loadResult.ok) {
			expect(loadResult.error.message).toContain('Error simulado en hardware o cuota');
		}

		const saveResult = await repository.saveSettings(DEFAULT_SETTINGS_DTO);
		expect(saveResult.ok).toBe(false);
	});

	describe('Multi-portfolio persistence & Contract compliance', () => {
		it('returns default portfolio on listPortfolios when store is empty', async () => {
			const factory = new IDBFactory();
			const repository = new IndexedDBSettingsRepository(factory);

			const listResult = await repository.listPortfolios();
			expect(listResult.ok).toBe(true);
			if (listResult.ok) {
				expect(listResult.value.length).toBeGreaterThanOrEqual(1);
				expect(listResult.value[0]?.id).toBe(DEFAULT_PORTFOLIO_ID);
				expect(listResult.value[0]?.name).toBe(DEFAULT_PORTFOLIO_NAME);
			}
			repository.close();
		});

		it('saves and loads custom portfolio successfully', async () => {
			const factory = new IDBFactory();
			const repository = new IndexedDBSettingsRepository(factory);

			const customPortfolio: PortfolioDTO = {
				id: 'custom-p1',
				name: 'Mi Portafolio Agresivo',
				settings: {
					...DEFAULT_SETTINGS_DTO,
					montoInicial: 50000,
					aporteMensual: 2500
				},
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			};

			const saveRes = await repository.savePortfolio(customPortfolio);
			expect(saveRes.ok).toBe(true);

			const loadRes = await repository.loadPortfolio('custom-p1');
			expect(loadRes.ok).toBe(true);
			if (loadRes.ok) {
				expect(loadRes.value.id).toBe('custom-p1');
				expect(loadRes.value.name).toBe('Mi Portafolio Agresivo');
				expect(loadRes.value.settings.montoInicial).toBe(50000);
			}
			repository.close();
		});

		it('updates an existing portfolio in place', async () => {
			const factory = new IDBFactory();
			const repository = new IndexedDBSettingsRepository(factory);

			const portfolio: PortfolioDTO = {
				id: 'port-edit',
				name: 'Nombre Original',
				settings: DEFAULT_SETTINGS_DTO,
				createdAt: '2026-01-01',
				updatedAt: '2026-01-01'
			};

			await repository.savePortfolio(portfolio);
			const updatedPortfolio = { ...portfolio, name: 'Nombre Modificado' };
			await repository.savePortfolio(updatedPortfolio);

			const loadRes = await repository.loadPortfolio('port-edit');
			expect(loadRes.ok).toBe(true);
			if (loadRes.ok) {
				expect(loadRes.value.name).toBe('Nombre Modificado');
			}
			repository.close();
		});

		it('deletes a portfolio by id', async () => {
			const factory = new IDBFactory();
			const repository = new IndexedDBSettingsRepository(factory);

			await repository.savePortfolio({
				id: 'port-to-delete',
				name: 'Eliminar Este',
				settings: DEFAULT_SETTINGS_DTO,
				createdAt: '2026-01-01',
				updatedAt: '2026-01-01'
			});

			const delRes = await repository.deletePortfolio('port-to-delete');
			expect(delRes.ok).toBe(true);

			const loadRes = await repository.loadPortfolio('port-to-delete');
			expect(loadRes.ok).toBe(false);
			repository.close();
		});

		it('returns error when loading non-existent portfolio', async () => {
			const factory = new IDBFactory();
			const repository = new IndexedDBSettingsRepository(factory);

			const result = await repository.loadPortfolio('inexistente');
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toContain('no encontrado');
			}
			repository.close();
		});

		it('bootstraps default portfolio on loadPortfolio when store is empty', async () => {
			const factory = new IDBFactory();
			const repository = new IndexedDBSettingsRepository(factory);

			const loadRes = await repository.loadPortfolio(DEFAULT_PORTFOLIO_ID);
			expect(loadRes.ok).toBe(true);
			if (loadRes.ok) {
				expect(loadRes.value.id).toBe(DEFAULT_PORTFOLIO_ID);
				expect(loadRes.value.name).toBe(DEFAULT_PORTFOLIO_NAME);
			}
			repository.close();
		});

		it('persists and retrieves tutorial completion status', async () => {
			const factory = new IDBFactory();
			const repository = new IndexedDBSettingsRepository(factory);

			const initial = await repository.isTutorialCompleted();
			expect(initial.ok).toBe(true);
			if (initial.ok) {
				expect(initial.value).toBe(false);
			}

			const setResult = await repository.setTutorialCompleted(true);
			expect(setResult.ok).toBe(true);

			const updated = await repository.isTutorialCompleted();
			expect(updated.ok).toBe(true);
			if (updated.ok) {
				expect(updated.value).toBe(true);
			}
			repository.close();
		});

		it('handles multi-tab versionchange and close() cleanly', async () => {
			const factory = new IDBFactory();
			const repository = new IndexedDBSettingsRepository(factory);

			await repository.saveSettings(DEFAULT_SETTINGS_DTO);

			// Calling close releases activeDb connection
			repository.close();

			// Subsequent operation automatically reconnects cleanly
			const loadRes = await repository.loadSettings();
			expect(loadRes.ok).toBe(true);
			if (loadRes.ok) {
				expect(loadRes.value.montoInicial).toBe(DEFAULT_SETTINGS_DTO.montoInicial);
			}
			repository.close();
		});
	});
});
