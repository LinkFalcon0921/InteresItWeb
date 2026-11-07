import {
	compararParesEscenarios,
	err,
	FinancialInputParser,
	ok,
	ParseInputError,
	ScenarioRole,
	type Result,
	type ScenarioSummary
} from '$domain';
import type { PairMatrixDTO, PairScenarioComparisonDTO } from '../dtos/PairMatrixDTO';
import type { ScenarioSummaryDTO, SimulationOutputDTO } from '../dtos/SimulationOutputDTO';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export type PairMatrixInput =
	| readonly ScenarioSummaryDTO[]
	| { readonly resumenes: readonly ScenarioSummaryDTO[] }
	| SimulationOutputDTO
	| unknown;

export class CalculatePairMatrixUseCase {
	public execute(input: unknown): Result<PairMatrixDTO, Error> {
		if (!input) {
			return ok({ comparaciones: [], totalPares: 0 });
		}

		const rawSummaries = this.extractSummaries(input);
		if (rawSummaries.length < 2) {
			return ok({ comparaciones: [], totalPares: 0 });
		}

		try {
			const domainSummaries: ScenarioSummary[] = [];

			for (let i = 0; i < rawSummaries.length; i++) {
				const s = rawSummaries[i];
				if (!isRecord(s)) {
					return err(new ParseInputError(`resumenes[${i}]`, 'El resumen del escenario debe ser un objeto válido.'));
				}

				const id = typeof s['escenarioId'] === 'string' ? s['escenarioId'].trim() : '';
				if (id.length === 0) {
					return err(new ParseInputError(`resumenes[${i}].escenarioId`, 'El identificador del escenario no puede estar vacío.'));
				}

				const nombre = typeof s['nombre'] === 'string' ? s['nombre'].trim() : '';
				if (nombre.length === 0) {
					return err(new ParseInputError(`resumenes[${i}].nombre`, 'El nombre del escenario no puede estar vacío.'));
				}

				const balResult = FinancialInputParser.parseMoney(s['balanceFinal'], `resumenes[${i}].balanceFinal`);
				if (!balResult.ok) return balResult;

				const intNetoResult = FinancialInputParser.parseMoney(s['interesTotalNeto'], `resumenes[${i}].interesTotalNeto`);
				if (!intNetoResult.ok) return intNetoResult;

				const rendNetoResult = FinancialInputParser.parseMoney(s['rendimientoNeto'], `resumenes[${i}].rendimientoNeto`);
				if (!rendNetoResult.ok) return rendNetoResult;

				const rawRol = s['rol'];
				const rol =
					rawRol === ScenarioRole.Leader || rawRol === ScenarioRole.Challenger || rawRol === ScenarioRole.Neutral
						? rawRol
						: ScenarioRole.Neutral;

				domainSummaries.push({
					escenarioId: id,
					nombre,
					balanceFinal: balResult.value,
					interesTotalNeto: intNetoResult.value,
					rendimientoNeto: rendNetoResult.value,
					rol
				});
			}

			const domainComparisons = compararParesEscenarios(domainSummaries);

			const comparaciones: PairScenarioComparisonDTO[] = domainComparisons.map((c) => ({
				escenarioA: {
					escenarioId: c.escenarioA.escenarioId,
					nombre: c.escenarioA.nombre,
					balanceFinal: c.escenarioA.balanceFinal.amount,
					interesTotalNeto: c.escenarioA.interesTotalNeto.amount,
					rendimientoNeto: c.escenarioA.rendimientoNeto.amount,
					rol: c.escenarioA.rol
				},
				escenarioB: {
					escenarioId: c.escenarioB.escenarioId,
					nombre: c.escenarioB.nombre,
					balanceFinal: c.escenarioB.balanceFinal.amount,
					interesTotalNeto: c.escenarioB.interesTotalNeto.amount,
					rendimientoNeto: c.escenarioB.rendimientoNeto.amount,
					rol: c.escenarioB.rol
				},
				diferenciaBalance: c.diferenciaBalance.amount,
				diferenciaRendimiento: c.diferenciaRendimiento.amount,
				favorecidoId: c.favorecidoId,
				ventajaA: c.ventajaA
			}));

			return ok({
				comparaciones,
				totalPares: comparaciones.length
			});
		} catch (e) {
			const error = e instanceof Error ? e : new Error(String(e));
			return err(error);
		}
	}

	private extractSummaries(input: unknown): readonly unknown[] {
		if (Array.isArray(input)) {
			return input;
		}
		if (isRecord(input)) {
			if ('resumenPorEscenario' in input && Array.isArray(input['resumenPorEscenario'])) {
				return input['resumenPorEscenario'];
			}
			if ('resumenes' in input && Array.isArray(input['resumenes'])) {
				return input['resumenes'];
			}
		}
		return [];
	}
}
