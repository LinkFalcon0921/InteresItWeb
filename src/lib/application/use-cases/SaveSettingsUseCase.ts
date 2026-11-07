import {
	err,
	InvalidDateRangeError,
	SettingsParser,
	type Result
} from '$domain';
import type { SettingsDTO } from '../dtos/SettingsDTO';
import type { SettingsRepositoryPort } from '../ports/SettingsRepositoryPort';

export class SaveSettingsUseCase {
	constructor(private readonly settingsRepository: SettingsRepositoryPort) {}

	public async execute(input: unknown): Promise<Result<void, Error>> {
		const parsedResult = SettingsParser.parseSettings(input);
		if (!parsedResult.ok) {
			return parsedResult;
		}

		const parsed = parsedResult.value;

		if (!parsed.fechaInicio.isBefore(parsed.fechaFin)) {
			return err(new InvalidDateRangeError('La fecha de inicio debe ser anterior a la fecha de fin.'));
		}

		const dto: SettingsDTO = {
			id: 'current',
			montoInicial: parsed.montoInicial.amount,
			aporteMensual: parsed.aporteMensual.amount,
			fechaInicio: parsed.fechaInicio.iso,
			fechaFin: parsed.fechaFin.iso,
			diaCorte: parsed.diaCorte.value,
			omitirPrimerCorte: parsed.omitirPrimerCorte,
			aplicarImpuesto: parsed.aplicarImpuesto,
			isDarkMode: parsed.isDarkMode,
			inversiones: parsed.inversiones.map((inv) => ({
				id: inv.id,
				nombre: inv.nombre,
				tasaAnual: inv.tasaAnual.percentage,
				color: inv.color
			}))
		};

		return this.settingsRepository.saveSettings(dto);
	}
}
