import { ParseInputError } from '../errors/DomainErrors';
import { SettingsParser } from './SettingsParser';
import { err, ok, type Result } from './Result';
import type { BackupDTO } from '$application/dtos/BackupDTO';
import type { PortfolioDTO } from '$application/dtos/PortfolioDTO';
import type { SettingsDTO } from '$application/dtos/SettingsDTO';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function isValidIsoDate(value: unknown): value is string {
	if (typeof value !== 'string' || value.trim().length === 0) return false;
	const timestamp = Date.parse(value);
	return !Number.isNaN(timestamp);
}

export class BackupParser {
	public static parseBackup(raw: unknown): Result<BackupDTO, ParseInputError> {
		if (!isRecord(raw)) {
			return err(new ParseInputError('backup', 'El contenido de la copia de seguridad no es un objeto JSON válido.'));
		}

		// App verification
		const app = raw['app'];
		if (typeof app !== 'string' || app.trim().toLowerCase() !== 'interesit') {
			return err(new ParseInputError('app', 'El archivo no corresponde a una copia de seguridad válida de InteresIt.'));
		}

		// Version verification
		const version = raw['version'];
		if (typeof version !== 'string' || version.trim().length === 0) {
			return err(new ParseInputError('version', 'Versión de formato de copia de seguridad no especificada o inválida.'));
		}

		// ExportedAt verification
		const exportedAt = raw['exportedAt'];
		if (!isValidIsoDate(exportedAt)) {
			return err(new ParseInputError('exportedAt', 'Fecha de exportación inválida en el archivo de copia de seguridad.'));
		}

		// Settings verification
		const rawSettings = raw['settings'];
		if (!isRecord(rawSettings)) {
			return err(new ParseInputError('settings', 'La configuración principal es requerida en la copia de seguridad.'));
		}

		const parsedSettingsRes = SettingsParser.parseSettings(rawSettings);
		if (!parsedSettingsRes.ok) {
			return err(new ParseInputError('settings', `Configuración corrupta: ${parsedSettingsRes.error.message}`));
		}

		const parsedSettings = parsedSettingsRes.value;
		const settingsDTO: SettingsDTO = {
			id: typeof rawSettings['id'] === 'string' ? rawSettings['id'] : 'current',
			activePortfolioId: typeof rawSettings['activePortfolioId'] === 'string' ? rawSettings['activePortfolioId'] : undefined,
			montoInicial: parsedSettings.montoInicial.amount,
			aporteMensual: parsedSettings.aporteMensual.amount,
			fechaInicio: parsedSettings.fechaInicio.iso,
			fechaFin: parsedSettings.fechaFin.iso,
			diaCorte: parsedSettings.diaCorte.value,
			omitirPrimerCorte: parsedSettings.omitirPrimerCorte,
			aplicarImpuesto: parsedSettings.aplicarImpuesto,
			isDarkMode: parsedSettings.isDarkMode,
			tasaInflacion: parsedSettings.tasaInflacion?.percentage ?? 0,
			aportesExtraordinarios: parsedSettings.aportesExtraordinarios?.map((a) => ({
				id: a.id,
				monto: a.monto.amount,
				fecha: a.fecha.iso,
				descripcion: a.descripcion
			})) ?? [],
			inversiones: parsedSettings.inversiones.map((inv) => ({
				id: inv.id,
				nombre: inv.nombre,
				tasaAnual: inv.tasaAnual.percentage,
				color: inv.color
			}))
		};

		// Portfolios verification
		const rawPortfolios = raw['portfolios'];
		if (!Array.isArray(rawPortfolios) || rawPortfolios.length === 0) {
			return err(new ParseInputError('portfolios', 'La copia de seguridad debe contener al menos un portafolio válido.'));
		}

		const validatedPortfolios: PortfolioDTO[] = [];
		const seenPortfolioIds = new Set<string>();
		for (let i = 0; i < rawPortfolios.length; i++) {
			const item = rawPortfolios[i];
			if (!isRecord(item)) {
				return err(new ParseInputError(`portfolios[${i}]`, `El portafolio en la posición ${i} no es un objeto válido.`));
			}

			const id = item['id'];
			if (typeof id !== 'string' || id.trim().length === 0) {
				return err(new ParseInputError(`portfolios[${i}].id`, 'Identificador de portafolio inválido o vacío.'));
			}

			const cleanId = id.trim();
			if (seenPortfolioIds.has(cleanId)) {
				return err(new ParseInputError(`portfolios[${i}].id`, `Identificador de portafolio duplicado: "${cleanId}".`));
			}
			seenPortfolioIds.add(cleanId);

			const name = item['name'];
			if (typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 100) {
				return err(new ParseInputError(`portfolios[${i}].name`, 'El nombre del portafolio debe tener entre 1 y 100 caracteres.'));
			}

			const portSettingsRaw = item['settings'];
			if (!isRecord(portSettingsRaw)) {
				return err(new ParseInputError(`portfolios[${i}].settings`, 'Configuración del portafolio requerida.'));
			}

			const portSettingsRes = SettingsParser.parseSettings(portSettingsRaw);
			if (!portSettingsRes.ok) {
				return err(new ParseInputError(`portfolios[${i}].settings`, `Configuración de portafolio corrupta: ${portSettingsRes.error.message}`));
			}

			const ps = portSettingsRes.value;
			const portSettingsDTO: SettingsDTO = {
				id: cleanId,
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

			const createdAt = isValidIsoDate(item['createdAt']) ? item['createdAt'] : new Date().toISOString();
			const updatedAt = isValidIsoDate(item['updatedAt']) ? item['updatedAt'] : new Date().toISOString();

			validatedPortfolios.push({
				id: cleanId,
				name: name.trim(),
				settings: portSettingsDTO,
				createdAt,
				updatedAt
			});
		}

		const rawActiveId = raw['activePortfolioId'] ?? rawSettings['activePortfolioId'];
		const activePortfolioId =
			typeof rawActiveId === 'string' && validatedPortfolios.some((p) => p.id === rawActiveId)
				? rawActiveId
				: (validatedPortfolios[0]?.id ?? 'default');

		const finalSettingsDTO: SettingsDTO = {
			...settingsDTO,
			activePortfolioId
		};

		return ok({
			version: version.trim(),
			app: 'InteresIt',
			exportedAt,
			activePortfolioId,
			settings: finalSettingsDTO,
			portfolios: validatedPortfolios
		});
	}
}
