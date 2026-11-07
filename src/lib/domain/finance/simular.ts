import { InvalidDateRangeError, InvalidScenarioError } from '../errors/DomainErrors';
import { ScenarioRole } from '../enums/ScenarioRole';
import { CalendarDate } from '../value-objects/CalendarDate';
import { CutoffDay } from '../value-objects/CutoffDay';
import { Money } from '../value-objects/Money';
import { InvestmentScenario } from '../entities/InvestmentScenario';
import type { PeriodCalculation, ScenarioPeriodResult } from '../entities/PeriodCalculation';
import type { SimulationResult, ScenarioSummary } from '../entities/SimulationResult';

export interface SimularParams {
	readonly capitalInicial: Money | number;
	readonly aporteMensual: Money | number;
	readonly fechaInicio: CalendarDate | string;
	readonly fechaFin: CalendarDate | string;
	readonly diaCorte: CutoffDay | number;
	readonly escenarios: readonly InvestmentScenario[];
	readonly omitirPrimerCorte?: boolean;
	readonly aplicarImpuestoRD?: boolean;
}

export function simular(params: SimularParams): SimulationResult {
	const capital = typeof params.capitalInicial === 'number'
		? Money.fromNumber(params.capitalInicial)
		: params.capitalInicial;

	const pmt = typeof params.aporteMensual === 'number'
		? Money.fromNumber(params.aporteMensual)
		: params.aporteMensual;

	const fechaInicio = typeof params.fechaInicio === 'string'
		? CalendarDate.fromISO(params.fechaInicio)
		: params.fechaInicio;

	const fechaFin = typeof params.fechaFin === 'string'
		? CalendarDate.fromISO(params.fechaFin)
		: params.fechaFin;

	const diaCorte = typeof params.diaCorte === 'number'
		? CutoffDay.fromNumber(params.diaCorte)
		: params.diaCorte;

	if (!fechaInicio.isBefore(fechaFin)) {
		throw new InvalidDateRangeError();
	}

	if (!params.escenarios || params.escenarios.length === 0) {
		throw new InvalidScenarioError('Debe proporcionar al menos un escenario de inversión.');
	}

	const omitirPrimerCorte = params.omitirPrimerCorte ?? false;
	const aplicarImpuestoRD = params.aplicarImpuestoRD ?? false;

	const numEscenarios = params.escenarios.length;
	const rawBalances: number[] = new Array(numEscenarios).fill(capital.amount);

	let currentDate = fechaInicio;
	let periodIndex = 0;
	let totalAportadoNum = 0;
	const periodos: PeriodCalculation[] = [];

	while (currentDate.isBefore(fechaFin)) {
		let stepEnd = diaCorte.nextCutoffAfter(currentDate);
		if (stepEnd.isAfter(fechaFin)) {
			stepEnd = fechaFin;
		}

		const days = currentDate.daysBetween(stepEnd);
		const isFirstMonth = periodIndex === 0;
		let isSkipped = false;

		if (isFirstMonth && omitirPrimerCorte) {
			const daysInMonth = currentDate.daysInMonth();
			if (days < daysInMonth) {
				isSkipped = true;
			}
		}

		const resultadosPorEscenario: ScenarioPeriodResult[] = [];

		for (let idx = 0; idx < numEscenarios; idx++) {
			const scenario = params.escenarios[idx];
			if (!scenario) continue;

			const balAnterior = rawBalances[idx] ?? 0;
			const rMensual = scenario.tasaAnual.monthlyRate;

			let interesBrutoNum = 0;
			let interesNetoNum = 0;

			if (!isSkipped) {
				interesBrutoNum = balAnterior * rMensual * (days / 30.4167);
				if (aplicarImpuestoRD) {
					interesNetoNum = interesBrutoNum * 0.90;
				} else {
					interesNetoNum = interesBrutoNum;
				}
			}

			const nuevoBalance = balAnterior + interesNetoNum + pmt.amount;
			rawBalances[idx] = nuevoBalance;

			if (idx === 0) {
				totalAportadoNum += pmt.amount;
			}

			resultadosPorEscenario.push({
				escenarioId: scenario.id,
				balanceAnterior: Money.fromNumber(balAnterior),
				interesBruto: Money.fromNumber(interesBrutoNum),
				interesNeto: Money.fromNumber(interesNetoNum),
				aporte: pmt,
				balanceFinal: Money.fromNumber(nuevoBalance),
				isSkipped
			});
		}

		periodos.push({
			periodoIndex: periodIndex + 1,
			fechaInicio: currentDate,
			fechaCorte: stepEnd,
			diasPeriodo: days,
			etiquetaMes: stepEnd.formatShortMonthYear(),
			resultadosPorEscenario
		});

		periodIndex++;
		currentDate = stepEnd;
	}

	const totalAportado = Money.fromNumber(totalAportadoNum);
	const totalInvertido = capital.add(totalAportado);

	const scenarioSummariesUnsorted: ScenarioSummary[] = params.escenarios.map((scenario, idx) => {
		const finalBalNum = rawBalances[idx] ?? capital.amount;
		const finalBalMoney = Money.fromNumber(finalBalNum);
		const rendimientoNum = Math.max(0, finalBalNum - totalInvertido.amount);
		const rendimientoMoney = Money.fromNumber(rendimientoNum);
		const interesTotalNum = Math.max(0, finalBalNum - (capital.amount + totalAportadoNum));
		const interesTotalMoney = Money.fromNumber(interesTotalNum);

		return {
			escenarioId: scenario.id,
			nombre: scenario.nombre,
			balanceFinal: finalBalMoney,
			interesTotalNeto: interesTotalMoney,
			rendimientoNeto: rendimientoMoney,
			rol: ScenarioRole.Neutral
		};
	});

	// Determinar líder y ventaja
	const sortedByGain = [...scenarioSummariesUnsorted].sort(
		(a, b) => b.balanceFinal.cents - a.balanceFinal.cents
	);

	const leaderSummary = sortedByGain[0];
	const runnerUpSummary = sortedByGain[1];

	const escenarioLiderId = leaderSummary ? leaderSummary.escenarioId : '';
	let ventajaLider = Money.zero();

	if (leaderSummary && runnerUpSummary) {
		const diffCents = Math.max(0, leaderSummary.balanceFinal.cents - runnerUpSummary.balanceFinal.cents);
		ventajaLider = Money.fromCents(diffCents);
	}

	const resumenPorEscenario: ScenarioSummary[] = scenarioSummariesUnsorted.map((item) => {
		let rol = ScenarioRole.Neutral;
		if (item.escenarioId === escenarioLiderId) {
			rol = ScenarioRole.Leader;
		} else if (sortedByGain.length > 1) {
			rol = ScenarioRole.Challenger;
		}
		return {
			...item,
			rol
		};
	});

	return {
		capitalInicial: capital,
		aporteMensual: pmt,
		totalAportado,
		totalInvertido,
		periodos,
		resumenPorEscenario,
		escenarioLiderId,
		ventajaLider
	};
}
