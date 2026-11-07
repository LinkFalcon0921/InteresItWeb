import {
	err,
	ok,
	SettingsParser,
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

export class IndexedDBSettingsRepository implements SettingsRepositoryPort {
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

	private getDatabase(): Promise<IDBDatabase> {
		const factory = this.getFactory();
		if (!factory) {
			return Promise.reject(new Error('IndexedDB no está disponible en este entorno.'));
		}

		return new Promise((resolve, reject) => {
			const request = factory.open(DB_NAME, DB_VERSION);

			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					db.createObjectStore(STORE_NAME, { keyPath: 'id' });
				}
			};

			request.onsuccess = () => {
				resolve(request.result);
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

			const p = parsedResult.value;
			const dto: SettingsDTO = {
				id: CURRENT_SETTINGS_KEY,
				montoInicial: p.montoInicial.amount,
				aporteMensual: p.aporteMensual.amount,
				fechaInicio: p.fechaInicio.iso,
				fechaFin: p.fechaFin.iso,
				diaCorte: p.diaCorte.value,
				omitirPrimerCorte: p.omitirPrimerCorte,
				aplicarImpuesto: p.aplicarImpuesto,
				isDarkMode: p.isDarkMode,
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
}
