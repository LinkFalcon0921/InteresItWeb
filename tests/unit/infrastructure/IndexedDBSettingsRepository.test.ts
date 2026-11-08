import { describe, expect, it } from 'vitest';
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

// Helper para crear un mock ligero y determinista de IndexedDB para Node/Vitest
interface MockStore {
	records: Map<string, unknown>;
}

function createMockIndexedDB(options?: {
	shouldFailOpen?: boolean;
	shouldFailRead?: boolean;
	shouldFailWrite?: boolean;
}): {
	factory: IDBFactory;
	stores: Map<string, MockStore>;
} {
	const stores = new Map<string, MockStore>();

	const factory = {
		open: (_name: string, _version?: number): IDBOpenDBRequest => {
			const request = {} as IDBOpenDBRequest;
			setTimeout(() => {
				if (options?.shouldFailOpen) {
					Object.defineProperty(request, 'error', { value: new Error('Fallo simulado al abrir IndexedDB') });
					request.onerror?.call(request, new Event('error'));
					return;
				}
				const db = {
					name: _name,
					version: _version ?? 1,
					objectStoreNames: { contains: (name: string): boolean => stores.has(name) },
					createObjectStore: (name: string): IDBObjectStore => {
						stores.set(name, { records: new Map() });
						return {} as IDBObjectStore;
					},
					transaction: (): IDBTransaction => ({
						objectStore: (storeName: string): IDBObjectStore => ({
							get: (key: IDBValidKey): IDBRequest => {
								const getReq = {} as IDBRequest;
								setTimeout(() => {
									if (options?.shouldFailRead) {
										Object.defineProperty(getReq, 'error', { value: new Error('Fallo simulado al leer registro') });
										getReq.onerror?.call(getReq, new Event('error'));
										return;
									}
									const result = stores.get(storeName)?.records.get(String(key));
									Object.defineProperty(getReq, 'result', { value: result });
									getReq.onsuccess?.call(getReq, new Event('success'));
								}, 0);
								return getReq;
							},
							put: (value: unknown): IDBRequest => {
								const putReq = {} as IDBRequest;
								setTimeout(() => {
									if (options?.shouldFailWrite) {
										Object.defineProperty(putReq, 'error', { value: new Error('Fallo simulado al escribir registro') });
										putReq.onerror?.call(putReq, new Event('error'));
										return;
									}
									if (stores.has(storeName) && typeof value === 'object' && value !== null) {
										const id = 'id' in value ? String(value.id) : CURRENT_SETTINGS_KEY;
										stores.get(storeName)!.records.set(id, value);
									}
									Object.defineProperty(putReq, 'result', { value });
									putReq.onsuccess?.call(putReq, new Event('success'));
								}, 0);
								return putReq;
							}
						}) as unknown as IDBObjectStore
					}) as unknown as IDBTransaction
				} as unknown as IDBDatabase;

				Object.defineProperty(request, 'result', { value: db });
				if (!stores.has(STORE_NAME) && request.onupgradeneeded) {
					request.onupgradeneeded.call(request, new Event('upgradeneeded') as IDBVersionChangeEvent);
				}
				request.onsuccess?.call(request, new Event('success'));
			}, 0);
			return request;
		}
	} as unknown as IDBFactory;

	return { factory, stores };
}

describe('IndexedDBSettingsRepository', () => {
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
		const { factory } = createMockIndexedDB();
		const repository = new IndexedDBSettingsRepository(factory);

		const result = await repository.loadSettings();
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toEqual(DEFAULT_SETTINGS_DTO);
		}
	});

	it('saves settings and loads them back correctly', async () => {
		const { factory } = createMockIndexedDB();
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
	});

	it('maintains backwards compatibility with legacy format from index.html', async () => {
		const { factory, stores } = createMockIndexedDB();
		const repository = new IndexedDBSettingsRepository(factory);

		// Primero abrimos la DB para inicializar el store
		await repository.loadSettings();

		// Insertamos registro en formato exacto legacy (strings en lugar de numbers, tasa en lugar de tasaAnual)
		const legacyRecord = {
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
		};

		const settingsStore = stores.get(STORE_NAME);
		settingsStore?.records.set('current', legacyRecord);

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
	});

	it('falls back to DEFAULT_SETTINGS_DTO gracefully when stored data is corrupted', async () => {
		const { factory, stores } = createMockIndexedDB();
		const repository = new IndexedDBSettingsRepository(factory);

		await repository.loadSettings();

		const corruptedRecord = {
			id: 'current',
			montoInicial: 'INVALID_NUMBER_STRING',
			fechaInicio: 'NOT_A_DATE'
		};

		const settingsStore = stores.get(STORE_NAME);
		settingsStore?.records.set('current', corruptedRecord);

		const result = await repository.loadSettings();
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toEqual(DEFAULT_SETTINGS_DTO);
		}
	});

	it('returns error when opening database fails', async () => {
		const { factory } = createMockIndexedDB({ shouldFailOpen: true });
		const repository = new IndexedDBSettingsRepository(factory);

		const loadResult = await repository.loadSettings();
		expect(loadResult.ok).toBe(false);
		if (!loadResult.ok) {
			expect(loadResult.error.message).toContain('Fallo simulado al abrir IndexedDB');
		}

		const saveResult = await repository.saveSettings(DEFAULT_SETTINGS_DTO);
		expect(saveResult.ok).toBe(false);
		if (!saveResult.ok) {
			expect(saveResult.error.message).toContain('Fallo simulado al abrir IndexedDB');
		}
	});

	it('returns error when reading database record fails', async () => {
		const { factory } = createMockIndexedDB({ shouldFailRead: true });
		const repository = new IndexedDBSettingsRepository(factory);

		const loadResult = await repository.loadSettings();
		expect(loadResult.ok).toBe(false);
		if (!loadResult.ok) {
			expect(loadResult.error.message).toContain('Fallo simulado al leer registro');
		}
	});

	it('returns error when writing database record fails', async () => {
		const { factory } = createMockIndexedDB({ shouldFailWrite: true });
		const repository = new IndexedDBSettingsRepository(factory);

		const saveResult = await repository.saveSettings(DEFAULT_SETTINGS_DTO);
		expect(saveResult.ok).toBe(false);
		if (!saveResult.ok) {
			expect(saveResult.error.message).toContain('Fallo simulado al escribir registro');
		}
	});

	describe('Multi-portfolio persistence (Phase 11)', () => {
		it('returns default portfolio on listPortfolios when store is empty', async () => {
			const { factory } = createMockIndexedDB();
			const repository = new IndexedDBSettingsRepository(factory);

			const listResult = await repository.listPortfolios();
			expect(listResult.ok).toBe(true);
			if (listResult.ok) {
				expect(listResult.value.length).toBeGreaterThanOrEqual(1);
				expect(listResult.value[0]?.id).toBe(DEFAULT_PORTFOLIO_ID);
				expect(listResult.value[0]?.name).toBe(DEFAULT_PORTFOLIO_NAME);
			}
		});

		it('saves and loads custom portfolio successfully', async () => {
			const { factory } = createMockIndexedDB();
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
		});

		it('updates an existing portfolio in place', async () => {
			const { factory } = createMockIndexedDB();
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
			if (loadRes.ok) {
				expect(loadRes.value.name).toBe('Nombre Modificado');
			}
		});

		it('deletes a portfolio by id', async () => {
			const { factory } = createMockIndexedDB();
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
		});

		it('returns error when loading non-existent portfolio', async () => {
			const { factory } = createMockIndexedDB();
			const repository = new IndexedDBSettingsRepository(factory);

			const result = await repository.loadPortfolio('inexistente');
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toContain('no encontrado');
			}
		});

		it('handles environment without IndexedDB gracefully for portfolios', async () => {
			const repository = new IndexedDBSettingsRepository(undefined);

			const listRes = await repository.listPortfolios();
			expect(listRes.ok).toBe(true);
			if (listRes.ok) {
				expect(listRes.value[0]?.id).toBe(DEFAULT_PORTFOLIO_ID);
			}

			const loadRes = await repository.loadPortfolio(DEFAULT_PORTFOLIO_ID);
			expect(loadRes.ok).toBe(true);

			const saveRes = await repository.savePortfolio({
				id: 'p1', name: 'P1', settings: DEFAULT_SETTINGS_DTO, createdAt: '', updatedAt: ''
			});
			expect(saveRes.ok).toBe(false);
		});

		it('bootstraps default portfolio on loadPortfolio when store is empty', async () => {
			const { factory } = createMockIndexedDB();
			const repository = new IndexedDBSettingsRepository(factory);

			const loadRes = await repository.loadPortfolio(DEFAULT_PORTFOLIO_ID);
			expect(loadRes.ok).toBe(true);
			if (loadRes.ok) {
				expect(loadRes.value.id).toBe(DEFAULT_PORTFOLIO_ID);
				expect(loadRes.value.name).toBe(DEFAULT_PORTFOLIO_NAME);
			}
		});

		it('preserves original createdAt when updating an existing portfolio', async () => {
			const { factory } = createMockIndexedDB();
			const repository = new IndexedDBSettingsRepository(factory);
			const initialCreatedAt = '2025-12-01T10:00:00.000Z';

			await repository.savePortfolio({
				id: 'port-created-test',
				name: 'Initial Name',
				settings: DEFAULT_SETTINGS_DTO,
				createdAt: initialCreatedAt,
				updatedAt: initialCreatedAt
			});
			await repository.savePortfolio({
				id: 'port-created-test',
				name: 'Updated Name',
				settings: DEFAULT_SETTINGS_DTO,
				createdAt: '2026-06-01T12:00:00.000Z',
				updatedAt: '2026-06-01T12:00:00.000Z'
			});

			const loadRes = await repository.loadPortfolio('port-created-test');
			expect(loadRes.ok).toBe(true);
			if (loadRes.ok) {
				expect(loadRes.value.name).toBe('Updated Name');
				expect(loadRes.value.createdAt).toBe(initialCreatedAt);
			}
		});

		it('saves and loads activePortfolioId in settings', async () => {
			const { factory } = createMockIndexedDB();
			const repository = new IndexedDBSettingsRepository(factory);

			const saveRes = await repository.saveSettings({
				...DEFAULT_SETTINGS_DTO,
				activePortfolioId: 'portfolio-custom-xyz'
			});
			expect(saveRes.ok).toBe(true);

			const loadRes = await repository.loadSettings();
			expect(loadRes.ok).toBe(true);
			if (loadRes.ok) {
				expect(loadRes.value.activePortfolioId).toBe('portfolio-custom-xyz');
			}
		});
	});
});
