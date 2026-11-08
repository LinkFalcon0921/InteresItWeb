import {
	AporteExtraordinario,
	err,
	FinancialInputParser,
	InvalidDateRangeError,
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

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export class CalculateSimulationUseCase {
	public execute(input: unknown): Result<SimulationOutputDTO, Error> {
		if (!isRecord(input)) {
			return err(new ParseInputError('simulationInput', 'Parámetros de simulación inválidos.'));
		}

		const capitalResult = FinancialInputParser.parseMoney(input['capitalInicial'], 'capitalInicial');
		if (!capitalResult.ok) return capitalResult;

		const aporteResult = FinancialInputParser.parseMoney(input['aporteMensual'], 'aporteMensual');
		if (!aporteResult.ok) return aporteResult;

		const fechaInicioResult = FinancialInputParser.parseCalendarDate(input['fechaInicio'], 'fechaInicio');
		if (!fechaInicioResult.ok) return fechaInicioResult;

		const fechaFinResult = FinancialInputParser.parseCalendarDate(input['fechaFin'], 'fechaFin');
		if (!fechaFinResult.ok) return fechaFinResult;

		if (!fechaInicioResult.value.isBefore(fechaFinResult.value)) {
			return err(new InvalidDateRangeError('La fecha de inicio debe ser anterior a la fecha de fin.'));
		}

		const diaCorteResult = FinancialInputParser.parseCutoffDay(input['diaCorte'], 'diaCorte');
		if (!diaCorteResult.ok) return diaCorteResult;

		const omitirResult = FinancialInputParser.parseBoolean(input['omitirPrimerCorte'], 'omitirPrimerCorte', false);
		if (!omitirResult.ok) return omitirResult;

		const impuestoResult = FinancialInputParser.parseBoolean(input['aplicarImpuestoRD'], 'aplicarImpuestoRD', true);
		if (!impuestoResult.ok) return impuestoResult;

		const rawEscenarios = input['escenarios'];
		if (!Array.isArray(rawEscenarios) || rawEscenarios.length === 0) {
			return err(new InvalidScenarioError('Debe proporcionar al menos un escenario de inversión.'));
		}
		if (rawEscenarios.length > 20) {
			return err(new InvalidScenarioError('No se pueden simular más de 20 escenarios de inversión simultáneos.'));
		}

		const domainEscenarios: InvestmentScenario[] = [];
		const seenIds = new Set<string>();

		for (let i = 0; i < rawEscenarios.length; i++) {
			const sc = rawEscenarios[i];
			if (!isRecord(sc)) {
				return err(new InvalidScenarioError(`El escenario en la posición ${i + 1} es inválido.`));
			}

			const rawId = typeof sc['id'] === 'string' ? sc['id'].trim() : '';
			if (rawId.length === 0) {
				return err(new InvalidScenarioError(`El identificador del escenario en la posición ${i + 1} no puede estar vacío.`));
			}
			if (seenIds.has(rawId)) {
				return err(new InvalidScenarioError(`El identificador de escenario '${rawId}' está duplicado.`));
			}
			seenIds.add(rawId);

			const rawNombre = typeof sc['nombre'] === 'string' ? sc['nombre'].trim() : '';
			if (rawNombre.length === 0) {
				return err(new InvalidScenarioError(`El nombre del escenario en la posición ${i + 1} no puede estar vacío.`));
			}

			const rateResult = FinancialInputParser.parseInterestRate(sc['tasaAnual'], `escenarios[${i}].tasaAnual`);
			if (!rateResult.ok) return rateResult;

			const rawColor =
				typeof sc['color'] === 'string' && sc['color'].trim().length > 0 ? sc['color'].trim() : 'emerald';

			try {
				domainEscenarios.push(InvestmentScenario.create(rawId, rawNombre, rateResult.value, rawColor));
			} catch (e) {
				const msg = e instanceof Error ? e.message : 'Error creando escenario de inversión.';
				return err(new InvalidScenarioError(msg));
			}
		}

		if (domainEscenarios.length === 0) {
			return err(new InvalidScenarioError('Debe proporcionar al menos un escenario de inversión válido.'));
		}

		const tasaInflacion = typeof input['tasaInflacion'] === 'number' && Number.isFinite(input['tasaInflacion'])
			? Math.max(0, input['tasaInflacion'])
			: 0;

		const rawAportes = input['aportesExtraordinarios'];
		const domainAportes: AporteExtraordinario[] = [];
		if (Array.isArray(rawAportes)) {
			for (let i = 0; i < rawAportes.length; i++) {
				const item = rawAportes[i];
				if (!isRecord(item)) continue;
				const id = typeof item['id'] === 'string' && item['id'].trim().length > 0
					? item['id'].trim()
					: `extra-${i + 1}`;
				const montoRes = FinancialInputParser.parseMoney(item['monto'], `aportesExtraordinarios[${i}].monto`);
				if (!montoRes.ok) continue;
				const fechaRes = FinancialInputParser.parseCalendarDate(item['fecha'], `aportesExtraordinarios[${i}].fecha`);
				if (!fechaRes.ok) continue;
				const desc = typeof item['descripcion'] === 'string' ? item['descripcion'].trim() : undefined;
				domainAportes.push(AporteExtraordinario.create(id, montoRes.value, fechaRes.value, desc));
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
				tasaInflacion,
				aportesExtraordinarios: domainAportes,
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
				aporteExtraordinario: r.aporteExtraordinario?.amount ?? 0,
				balanceFinal: r.balanceFinal.amount,
				balanceReal: r.balanceReal?.amount,
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
			balanceReal: s.balanceReal?.amount,
			tasaRealAnual: s.tasaRealAnual,
			interesTotalNeto: s.interesTotalNeto.amount,
			rendimientoNeto: s.rendimientoNeto.amount,
			rol: s.rol
		}));

		return {
			capitalInicial: result.capitalInicial.amount,
			aporteMensual: result.aporteMensual.amount,
			totalAportado: result.totalAportado.amount,
			totalExtraordinario: result.totalExtraordinario?.amount ?? 0,
			totalInvertido: result.totalInvertido.amount,
			tasaInflacion: result.tasaInflacion?.percentage ?? 0,
			periodos,
			resumenPorEscenario,
			escenarioLiderId: result.escenarioLiderId,
			ventajaLider: result.ventajaLider.amount
		};
	}
}
