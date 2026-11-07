import {
	err,
	FinancialInputParser,
	InvalidScenarioError,
	InvestmentScenario,
	ok,
	ParseInputError,
	simular,
	type Result,
	type SimulationResult
} from '$domain';
import type { SimulationInputDTO } from '../dtos/SimulationInputDTO';
import type { PeriodCalculationDTO, ScenarioPeriodResultDTO, ScenarioSummaryDTO, SimulationOutputDTO } from '../dtos/SimulationOutputDTO';

export class CalculateSimulationUseCase {
	public execute(input: SimulationInputDTO): Result<SimulationOutputDTO, Error> {
		if (!input || typeof input !== 'object') {
			return err(new ParseInputError('simulationInput', 'Parámetros de simulación inválidos.'));
		}

		const capitalResult = FinancialInputParser.parseMoney(input.capitalInicial, 'capitalInicial');
		if (!capitalResult.ok) return capitalResult;

		const aporteResult = FinancialInputParser.parseMoney(input.aporteMensual, 'aporteMensual');
		if (!aporteResult.ok) return aporteResult;

		const fechaInicioResult = FinancialInputParser.parseCalendarDate(input.fechaInicio, 'fechaInicio');
		if (!fechaInicioResult.ok) return fechaInicioResult;

		const fechaFinResult = FinancialInputParser.parseCalendarDate(input.fechaFin, 'fechaFin');
		if (!fechaFinResult.ok) return fechaFinResult;

		const diaCorteResult = FinancialInputParser.parseCutoffDay(input.diaCorte, 'diaCorte');
		if (!diaCorteResult.ok) return diaCorteResult;

		const omitirResult = FinancialInputParser.parseBoolean(input.omitirPrimerCorte, 'omitirPrimerCorte', false);
		if (!omitirResult.ok) return omitirResult;

		const impuestoResult = FinancialInputParser.parseBoolean(input.aplicarImpuestoRD, 'aplicarImpuestoRD', true);
		if (!impuestoResult.ok) return impuestoResult;

		if (!input.escenarios || input.escenarios.length === 0) {
			return err(new InvalidScenarioError('Debe proporcionar al menos un escenario de inversión.'));
		}
		if (input.escenarios.length > 20) {
			return err(new InvalidScenarioError('No se pueden simular más de 20 escenarios de inversión simultáneos.'));
		}

		const domainEscenarios: InvestmentScenario[] = [];
		for (let i = 0; i < input.escenarios.length; i++) {
			const sc = input.escenarios[i];
			if (!sc) continue;

			const rateResult = FinancialInputParser.parseInterestRate(sc.tasaAnual, `escenarios[${i}].tasaAnual`);
			if (!rateResult.ok) return rateResult;

			try {
				domainEscenarios.push(InvestmentScenario.create(sc.id, sc.nombre, rateResult.value, sc.color));
			} catch (e) {
				const msg = e instanceof Error ? e.message : 'Error creando escenario de inversión.';
				return err(new InvalidScenarioError(msg));
			}
		}

		try {
			const domainResult = simular({
				capitalInicial: capitalResult.value,
				aporteMensual: aporteResult.value,
				fechaInicio: fechaInicioResult.value,
				fechaFin: fechaFinResult.value,
				diaCorte: diaCorteResult.value,
				omitirPrimerCorte: omitirResult.value,
				aplicarImpuestoRD: impuestoResult.value,
				escenarios: domainEscenarios
			});

			return ok(this.mapToDTO(domainResult));
		} catch (e) {
			const error = e instanceof Error ? e : new Error(String(e));
			return err(error);
		}
	}

	private mapToDTO(result: SimulationResult): SimulationOutputDTO {
		const periodos: PeriodCalculationDTO[] = result.periodos.map((p) => {
			const resultadosPorEscenario: ScenarioPeriodResultDTO[] = p.resultadosPorEscenario.map((r) => ({
				escenarioId: r.escenarioId,
				balanceAnterior: r.balanceAnterior.amount,
				interesBruto: r.interesBruto.amount,
				interesNeto: r.interesNeto.amount,
				aporte: r.aporte.amount,
				balanceFinal: r.balanceFinal.amount,
				isSkipped: r.isSkipped
			}));

			return {
				periodoIndex: p.periodoIndex,
				fechaInicio: p.fechaInicio.iso,
				fechaCorte: p.fechaCorte.iso,
				diasPeriodo: p.diasPeriodo,
				etiquetaMes: p.etiquetaMes,
				resultadosPorEscenario
			};
		});

		const resumenPorEscenario: ScenarioSummaryDTO[] = result.resumenPorEscenario.map((s) => ({
			escenarioId: s.escenarioId,
			nombre: s.nombre,
			balanceFinal: s.balanceFinal.amount,
			interesTotalNeto: s.interesTotalNeto.amount,
			rendimientoNeto: s.rendimientoNeto.amount,
			rol: s.rol
		}));

		return {
			capitalInicial: result.capitalInicial.amount,
			aporteMensual: result.aporteMensual.amount,
			totalAportado: result.totalAportado.amount,
			totalInvertido: result.totalInvertido.amount,
			periodos,
			resumenPorEscenario,
			escenarioLiderId: result.escenarioLiderId,
			ventajaLider: result.ventajaLider.amount
		};
	}
}
