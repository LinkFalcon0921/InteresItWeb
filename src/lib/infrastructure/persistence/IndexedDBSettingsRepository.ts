import {
	err,
	ok,
	SettingsParser,
	SYSTEM_LIMITS,
	type Result
} from '$domain';
import {
	DEFAULT_SETTINGS_DTO,
	type SettingsDTO,
	type SettingsRepositoryPort
} from '$application';

export const DB_NAME = 'InteresItDB';
export const DB_VERSION = 1;
export const STORE_NAME = 'settings';
export const CURRENT_SETTINGS_KEY = 'current';
export const PORTFOLIOS_KEY = 'portfolios';
export const TUTORIAL_KEY = 'tutorial';

import {
	DEFAULT_PORTFOLIO_ID,
	DEFAULT_PORTFOLIO_NAME,
	type PortfolioDTO,
	type PortfolioSummaryDTO
} from '$application';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export class IndexedDBSettingsRepository implements SettingsRepositoryPort {
	private activeDb: IDBDatabase | null = null;

	constructor(private readonly idbFactory?: IDBFactory) {}

	private getFactory(): IDBFactory | undefined {
		if (this.idbFactory) {
			return this.idbFactory;
		}
		if (typeof window !== 'undefined' && window.indexedDB) {
			return window.indexedDB;
		}
		if (typeof indexedDB !== 'undefined') {
			return indexedDB;
		}
		return undefined;
	}

	public close(): void {
		if (this.activeDb) {
			this.activeDb.close();
			this.activeDb = null;
		}
	}

	private getDatabase(): Promise<IDBDatabase> {
		if (this.activeDb) {
			return Promise.resolve(this.activeDb);
		}

		const factory = this.getFactory();
		if (!factory) {
			return Promise.reject(new Error('IndexedDB no está disponible en este entorno.'));
		}

		return new Promise((resolve, reject) => {
			const request = factory.open(DB_NAME, DB_VERSION);

			request.onblocked = (event) => {
				console.warn('Conexión a IndexedDB bloqueada por otra pestaña u operación en curso.', event);
			};

			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					db.createObjectStore(STORE_NAME, { keyPath: 'id' });
				}
			};

			request.onsuccess = () => {
				const db = request.result;
				this.activeDb = db;

				db.onversionchange = () => {
					db.close();
					this.activeDb = null;
					console.warn('Conexión a IndexedDB cerrada debido a un cambio de versión en otra pestaña.');
				};

				db.onclose = () => {
					this.activeDb = null;
				};

				resolve(db);
			};

			request.onerror = () => {
				reject(request.error ?? new Error('Error al abrir la base de datos IndexedDB.'));
			};
		});
	}

	private readRecord(db: IDBDatabase, key: string): Promise<unknown> {
		return new Promise((resolve, reject) => {
			const transaction = db.transaction([STORE_NAME], 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.get(key);

			request.onsuccess = () => {
				resolve(request.result);
			};

			request.onerror = () => {
				reject(request.error ?? new Error(`Error leyendo el registro con clave "${key}".`));
			};
		});
	}

	private writeRecord(db: IDBDatabase, record: Record<string, unknown>): Promise<void> {
		return new Promise((resolve, reject) => {
			const transaction = db.transaction([STORE_NAME], 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.put(record);

			request.onsuccess = () => {
				resolve();
			};

			request.onerror = () => {
				reject(request.error ?? new Error('Error guardando la configuración en IndexedDB.'));
			};
		});
	}

	private parsePortfoliosRecord(raw: unknown): PortfolioDTO[] {
		if (!isRecord(raw)) return [];
		const rawItems = raw['items'];
		if (!Array.isArray(rawItems)) return [];

		const list: PortfolioDTO[] = [];
		for (const item of rawItems) {
			if (!isRecord(item)) continue;
			const id = typeof item['id'] === 'string' ? item['id'] : '';
			const name = typeof item['name'] === 'string' ? item['name'] : '';
			if (!id || !name || !item['settings']) continue;

			const parsedSettings = SettingsParser.parseSettings(item['settings']);
			if (!parsedSettings.ok) continue;

			const ps = parsedSettings.value;
			const settingsDto: SettingsDTO = {
				id,
				montoInicial: ps.montoInicial.amount,
				aporteMensual: ps.aporteMensual.amount,
				fechaInicio: ps.fechaInicio.iso,
				fechaFin: ps.fechaFin.iso,
				diaCorte: ps.diaCorte.value,
				omitirPrimerCorte: ps.omitirPrimerCorte,
				aplicarImpuesto: ps.aplicarImpuesto,
				isDarkMode: ps.isDarkMode,
				tasaInflacion: ps.tasaInflacion?.percentage ?? 0,
				aportesExtraordinarios: ps.aportesExtraordinarios?.map((a) => ({
					id: a.id,
					monto: a.monto.amount,
					fecha: a.fecha.iso,
					descripcion: a.descripcion
				})) ?? [],
				inversiones: ps.inversiones.map((inv) => ({
					id: inv.id,
					nombre: inv.nombre,
					tasaAnual: inv.tasaAnual.percentage,
					color: inv.color
				}))
			};

			list.push({
				id,
				name,
				settings: settingsDto,
				createdAt: typeof item['createdAt'] === 'string' ? item['createdAt'] : new Date().toISOString(),
				updatedAt: typeof item['updatedAt'] === 'string' ? item['updatedAt'] : new Date().toISOString()
			});
		}
		return list;
	}

	public async loadSettings(): Promise<Result<SettingsDTO, Error>> {
		const factory = this.getFactory();
		if (!factory) {
			return ok(DEFAULT_SETTINGS_DTO);
		}

		try {
			const db = await this.getDatabase();
			const raw = await this.readRecord(db, CURRENT_SETTINGS_KEY);

			if (raw === undefined || raw === null) {
				return ok(DEFAULT_SETTINGS_DTO);
			}

			const parsedResult = SettingsParser.parseSettings(raw);
			if (!parsedResult.ok) {
				return ok(DEFAULT_SETTINGS_DTO);
			}

			const activePortfolioId =
				isRecord(raw) && typeof raw['activePortfolioId'] === 'string'
					? raw['activePortfolioId']
					: undefined;

			const p = parsedResult.value;
			const dto: SettingsDTO = {
				id: CURRENT_SETTINGS_KEY,
				activePortfolioId,
				montoInicial: p.montoInicial.amount,
				aporteMensual: p.aporteMensual.amount,
				fechaInicio: p.fechaInicio.iso,
				fechaFin: p.fechaFin.iso,
				diaCorte: p.diaCorte.value,
				omitirPrimerCorte: p.omitirPrimerCorte,
				aplicarImpuesto: p.aplicarImpuesto,
				isDarkMode: p.isDarkMode,
				tasaInflacion: p.tasaInflacion?.percentage ?? 0,
				aportesExtraordinarios: p.aportesExtraordinarios?.map((a) => ({
					id: a.id,
					monto: a.monto.amount,
					fecha: a.fecha.iso,
					descripcion: a.descripcion
				})) ?? [],
				inversiones: p.inversiones.map((inv) => ({
					id: inv.id,
					nombre: inv.nombre,
					tasaAnual: inv.tasaAnual.percentage,
					color: inv.color
				}))
			};

			return ok(dto);
		} catch (error) {
			return err(error instanceof Error ? error : new Error(String(error)));
		}
	}

	public async saveSettings(settings: SettingsDTO): Promise<Result<void, Error>> {
		const factory = this.getFactory();
		if (!factory) {
			return err(new Error('IndexedDB no está disponible en este entorno.'));
		}

		try {
			const db = await this.getDatabase();
			const record: Record<string, unknown> = {
				...settings,
				id: CURRENT_SETTINGS_KEY
			};

			await this.writeRecord(db, record);
			return ok(undefined);
		} catch (error) {
			return err(error instanceof Error ? error : new Error(String(error)));
		}
	}

	public async listPortfolios(): Promise<Result<PortfolioSummaryDTO[], Error>> {
		const factory = this.getFactory();
		if (!factory) {
			return ok([
				{
					id: DEFAULT_PORTFOLIO_ID,
					name: DEFAULT_PORTFOLIO_NAME,
					updatedAt: new Date().toISOString(),
					escenariosCount: DEFAULT_SETTINGS_DTO.inversiones.length,
					montoInicial: DEFAULT_SETTINGS_DTO.montoInicial
				}
			]);
		}

		try {
			const db = await this.getDatabase();
			const raw = await this.readRecord(db, PORTFOLIOS_KEY);
			let portfolios = this.parsePortfoliosRecord(raw);

			if (portfolios.length === 0) {
				const currentSettingsResult = await this.loadSettings();
				const initialSettings = currentSettingsResult.ok ? currentSettingsResult.value : DEFAULT_SETTINGS_DTO;
				const defaultPortfolio: PortfolioDTO = {
					id: DEFAULT_PORTFOLIO_ID,
					name: DEFAULT_PORTFOLIO_NAME,
					settings: initialSettings,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				};
				portfolios = [defaultPortfolio];
				await this.writeRecord(db, { id: PORTFOLIOS_KEY, items: portfolios });
			}

			const summaries: PortfolioSummaryDTO[] = portfolios.map((p) => ({
				id: p.id,
				name: p.name,
				updatedAt: p.updatedAt,
				escenariosCount: p.settings.inversiones.length,
				montoInicial: p.settings.montoInicial
			}));

			return ok(summaries);
		} catch (error) {
			return err(error instanceof Error ? error : new Error(String(error)));
		}
	}

	public async loadPortfolio(id: string): Promise<Result<PortfolioDTO, Error>> {
		const factory = this.getFactory();
		if (!factory) {
			return ok({
				id: DEFAULT_PORTFOLIO_ID,
				name: DEFAULT_PORTFOLIO_NAME,
				settings: DEFAULT_SETTINGS_DTO,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			});
		}

		try {
			const db = await this.getDatabase();
			const raw = await this.readRecord(db, PORTFOLIOS_KEY);
			let portfolios = this.parsePortfoliosRecord(raw);
			let match = portfolios.find((p) => p.id === id);

			if (!match && id === DEFAULT_PORTFOLIO_ID) {
				const currentSettingsResult = await this.loadSettings();
				const initialSettings = currentSettingsResult.ok ? currentSettingsResult.value : DEFAULT_SETTINGS_DTO;
				const defaultPortfolio: PortfolioDTO = {
					id: DEFAULT_PORTFOLIO_ID,
					name: DEFAULT_PORTFOLIO_NAME,
					settings: initialSettings,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				};
				portfolios = [defaultPortfolio, ...portfolios];
				await this.writeRecord(db, { id: PORTFOLIOS_KEY, items: portfolios });
				match = defaultPortfolio;
			}

			if (!match) {
				return err(new Error(`Portafolio con identificador "${id}" no encontrado.`));
			}

			return ok(match);
		} catch (error) {
			return err(error instanceof Error ? error : new Error(String(error)));
		}
	}

	public async savePortfolio(portfolio: PortfolioDTO): Promise<Result<void, Error>> {
		const factory = this.getFactory();
		if (!factory) {
			return err(new Error('IndexedDB no está disponible en este entorno.'));
		}

		try {
			const db = await this.getDatabase();
			const raw = await this.readRecord(db, PORTFOLIOS_KEY);
			const portfolios = this.parsePortfoliosRecord(raw);
			const existingIndex = portfolios.findIndex((p) => p.id === portfolio.id);

			if (existingIndex >= 0) {
				const existing = portfolios[existingIndex];
				portfolios[existingIndex] = {
					...portfolio,
					createdAt: existing?.createdAt || portfolio.createdAt
				};
			} else {
				if (portfolios.length >= SYSTEM_LIMITS.MAX_PORTFOLIOS) {
					return err(new Error(`Límite alcanzado: no se pueden almacenar más de ${SYSTEM_LIMITS.MAX_PORTFOLIOS} portafolios en el sistema.`));
				}
				portfolios.push(portfolio);
			}

			await this.writeRecord(db, { id: PORTFOLIOS_KEY, items: portfolios });
			return ok(undefined);
		} catch (error) {
			return err(error instanceof Error ? error : new Error(String(error)));
		}
	}

	public async deletePortfolio(id: string): Promise<Result<void, Error>> {
		const factory = this.getFactory();
		if (!factory) {
			return err(new Error('IndexedDB no está disponible en este entorno.'));
		}

		try {
			const db = await this.getDatabase();
			const raw = await this.readRecord(db, PORTFOLIOS_KEY);
			const portfolios = this.parsePortfoliosRecord(raw);
			const filtered = portfolios.filter((p) => p.id !== id);

			await this.writeRecord(db, { id: PORTFOLIOS_KEY, items: filtered });
			return ok(undefined);
		} catch (error) {
			return err(error instanceof Error ? error : new Error(String(error)));
		}
	}

	public async isTutorialCompleted(): Promise<Result<boolean, Error>> {
		const factory = this.getFactory();
		if (!factory) {
			return ok(false);
		}

		try {
			const db = await this.getDatabase();
			const raw = await this.readRecord(db, TUTORIAL_KEY);
			if (isRecord(raw)) {
				return ok(raw['completed'] === true);
			}
			return ok(false);
		} catch (error) {
			return err(error instanceof Error ? error : new Error(String(error)));
		}
	}

	public async setTutorialCompleted(completed: boolean): Promise<Result<void, Error>> {
		const factory = this.getFactory();
		if (!factory) {
			return err(new Error('IndexedDB no está disponible en este entorno.'));
		}

		try {
			const db = await this.getDatabase();
			await this.writeRecord(db, { id: TUTORIAL_KEY, completed });
			return ok(undefined);
		} catch (error) {
			return err(error instanceof Error ? error : new Error(String(error)));
		}
	}
}

