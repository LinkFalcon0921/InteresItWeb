import { ParseInputError } from '../errors/DomainErrors';
import { InvestmentScenario } from '../entities/InvestmentScenario';
import { CalendarDate } from '../value-objects/CalendarDate';
import { CutoffDay } from '../value-objects/CutoffDay';
import { Money } from '../value-objects/Money';
import { FinancialInputParser } from './FinancialInputParser';
import { err, ok, type Result } from './Result';

export interface ParsedSimulationSettings {
	readonly montoInicial: Money;
	readonly aporteMensual: Money;
	readonly inversiones: readonly InvestmentScenario[];
	readonly fechaInicio: CalendarDate;
	readonly fechaFin: CalendarDate;
	readonly diaCorte: CutoffDay;
	readonly omitirPrimerCorte: boolean;
	readonly aplicarImpuesto: boolean;
	readonly isDarkMode: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export class SettingsParser {
	public static parseSettings(raw: unknown): Result<ParsedSimulationSettings, ParseInputError> {
		if (!isRecord(raw)) {
			return err(new ParseInputError('settings', 'El objeto de configuración es inválido.'));
		}

		const data = raw;

		const montoInicialResult = FinancialInputParser.parseMoney(data['montoInicial'], 'montoInicial', 185);
		if (!montoInicialResult.ok) return montoInicialResult;

		const aporteMensualResult = FinancialInputParser.parseMoney(data['aporteMensual'], 'aporteMensual', 0);
		if (!aporteMensualResult.ok) return aporteMensualResult;

		const fechaInicioResult = FinancialInputParser.parseCalendarDate(data['fechaInicio'], 'fechaInicio', '2026-04-17');
		if (!fechaInicioResult.ok) return fechaInicioResult;

		const fechaFinResult = FinancialInputParser.parseCalendarDate(data['fechaFin'], 'fechaFin', '2026-11-16');
		if (!fechaFinResult.ok) return fechaFinResult;

		const diaCorteResult = FinancialInputParser.parseCutoffDay(data['diaCorte'], 'diaCorte', 16);
		if (!diaCorteResult.ok) return diaCorteResult;

		const omitirResult = FinancialInputParser.parseBoolean(data['omitirPrimerCorte'], 'omitirPrimerCorte', false);
		if (!omitirResult.ok) return omitirResult;

		const impuestoResult = FinancialInputParser.parseBoolean(data['aplicarImpuesto'], 'aplicarImpuesto', true);
		if (!impuestoResult.ok) return impuestoResult;

		const darkModeResult = FinancialInputParser.parseBoolean(data['isDarkMode'], 'isDarkMode', false);
		if (!darkModeResult.ok) return darkModeResult;

		// Parsear array de inversiones
		const rawInversiones = data['inversiones'];
		const inversiones: InvestmentScenario[] = [];

		if (Array.isArray(rawInversiones) && rawInversiones.length > 0) {
			for (let i = 0; i < rawInversiones.length; i++) {
				const item = rawInversiones[i];
				if (!isRecord(item)) continue;
				const invMap = item;

				const id = typeof invMap['id'] === 'string' ? invMap['id'] : `inv-${i + 1}`;
				const nombre = typeof invMap['nombre'] === 'string' ? invMap['nombre'] : `Inversión ${i + 1}`;
				const color = typeof invMap['color'] === 'string' ? invMap['color'] : 'emerald';

				const tasaResult = FinancialInputParser.parseInterestRate(
					invMap['tasa'] ?? invMap['tasaAnual'],
					`inversiones[${i}].tasa`,
					10
				);
				if (!tasaResult.ok) return tasaResult;

				try {
					inversiones.push(InvestmentScenario.create(id, nombre, tasaResult.value, color));
				} catch (e) {
					const msg = e instanceof Error ? e.message : 'Error creando escenario.';
					return err(new ParseInputError(`inversiones[${i}]`, msg));
				}
			}
		}

		if (inversiones.length === 0) {
			inversiones.push(InvestmentScenario.create('inv-1', 'Escenario 1', 10, 'emerald'));
			inversiones.push(InvestmentScenario.create('inv-2', 'Escenario 2', 12, 'blue'));
		}

		return ok({
			montoInicial: montoInicialResult.value,
			aporteMensual: aporteMensualResult.value,
			inversiones,
			fechaInicio: fechaInicioResult.value,
			fechaFin: fechaFinResult.value,
			diaCorte: diaCorteResult.value,
			omitirPrimerCorte: omitirResult.value,
			aplicarImpuesto: impuestoResult.value,
			isDarkMode: darkModeResult.value
		});
	}
}
