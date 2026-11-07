import {
	compararParesEscenarios,
	err,
	Money,
	ok,
	type Result,
	type ScenarioSummary
} from '$domain';
import type { PairMatrixDTO, PairScenarioComparisonDTO } from '../dtos/PairMatrixDTO';
import type { ScenarioSummaryDTO, SimulationOutputDTO } from '../dtos/SimulationOutputDTO';

export type PairMatrixInput =
	| readonly ScenarioSummaryDTO[]
	| { readonly resumenes: readonly ScenarioSummaryDTO[] }
	| SimulationOutputDTO;

export class CalculatePairMatrixUseCase {
	public execute(input: PairMatrixInput): Result<PairMatrixDTO, Error> {
		if (!input) {
			return ok({ comparaciones: [], totalPares: 0 });
		}

		const rawSummaries = this.extractSummaries(input);
		if (rawSummaries.length < 2) {
			return ok({ comparaciones: [], totalPares: 0 });
		}

		try {
			const domainSummaries: ScenarioSummary[] = [];

			for (const s of rawSummaries) {
				domainSummaries.push({
					escenarioId: s.escenarioId,
					nombre: s.nombre,
					balanceFinal: Money.fromNumber(s.balanceFinal),
					interesTotalNeto: Money.fromNumber(s.interesTotalNeto),
					rendimientoNeto: Money.fromNumber(s.rendimientoNeto),
					rol: s.rol
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

	private extractSummaries(input: PairMatrixInput): readonly ScenarioSummaryDTO[] {
		if (Array.isArray(input)) {
			return input;
		}
		if ('resumenPorEscenario' in input && Array.isArray(input.resumenPorEscenario)) {
			return input.resumenPorEscenario;
		}
		if ('resumenes' in input && Array.isArray(input.resumenes)) {
			return input.resumenes;
		}
		return [];
	}
}
