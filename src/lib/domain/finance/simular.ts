import { InvalidDateRangeError, InvalidScenarioError } from '../errors/DomainErrors';
import { ScenarioRole } from '../enums/ScenarioRole';
import { CalendarDate } from '../value-objects/CalendarDate';
import { CutoffDay } from '../value-objects/CutoffDay';
import { Money } from '../value-objects/Money';
import { InflationRate } from '../value-objects/InflationRate';
import { InvestmentScenario } from '../entities/InvestmentScenario';
import { AporteExtraordinario } from '../entities/AporteExtraordinario';
import type { PeriodCalculation, ScenarioPeriodResult } from '../entities/PeriodCalculation';
import type { SimulationResult, ScenarioSummary } from '../entities/SimulationResult';

export interface ExtraordinarioInput {
	readonly id: string;
	readonly monto: Money | number;
	readonly fecha: CalendarDate | string;
	readonly descripcion?: string;
}

export interface SimularParams {
	readonly capitalInicial: Money | number;
	readonly aporteMensual: Money | number;
	readonly fechaInicio: CalendarDate | string;
	readonly fechaFin: CalendarDate | string;
	readonly diaCorte: CutoffDay | number;
	readonly escenarios: readonly InvestmentScenario[];
	readonly omitirPrimerCorte?: boolean;
	readonly aplicarImpuestoRD?: boolean;
	readonly tasaInflacion?: InflationRate | number;
	readonly aportesExtraordinarios?: readonly (AporteExtraordinario | ExtraordinarioInput)[];
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
	if (params.escenarios.length > 200) {
		throw new InvalidScenarioError('No se pueden simular más de 200 escenarios de inversión simultáneos.');
	}

	const inflacion = typeof params.tasaInflacion === 'number'
		? InflationRate.fromPercentage(params.tasaInflacion)
		: (params.tasaInflacion ?? InflationRate.zero());

	const aportesExtraordinarios: AporteExtraordinario[] = (params.aportesExtraordinarios ?? []).map((a) => {
		if (a instanceof AporteExtraordinario) return a;
		return AporteExtraordinario.create(a.id, a.monto, a.fecha, a.descripcion);
	});

	const omitirPrimerCorte = params.omitirPrimerCorte ?? false;
	const aplicarImpuestoRD = params.aplicarImpuestoRD ?? false;

	const numEscenarios = params.escenarios.length;
	const rawBalances: number[] = new Array(numEscenarios).fill(capital.amount);

	let currentDate = fechaInicio;
	let periodIndex = 0;
	let totalAportadoNum = 0;
	let totalExtraordinarioNum = 0;
	const periodos: PeriodCalculation[] = [];

	while (currentDate.isBefore(fechaFin)) {
		let stepEnd = diaCorte.nextCutoffAfter(currentDate);
		if (stepEnd.isAfter(fechaFin)) {
			stepEnd = fechaFin;
		}

		const days = currentDate.daysBetween(stepEnd);
		const daysFromStart = fechaInicio.daysBetween(stepEnd);
		const isFirstMonth = periodIndex === 0;
		let isSkipped = false;

		if (isFirstMonth && omitirPrimerCorte) {
			const daysInMonth = currentDate.daysInMonth();
			if (days < daysInMonth) {
				isSkipped = true;
			}
		}

		// Calcular aportes extraordinarios que caen en este ciclo
		let extraInPeriod = 0;
		for (const extra of aportesExtraordinarios) {
			const fallsInPeriod = periodIndex === 0
				? (extra.fecha.equals(currentDate) || extra.fecha.isAfter(currentDate)) &&
				  (extra.fecha.isBefore(stepEnd) || extra.fecha.equals(stepEnd))
				: extra.fecha.isAfter(currentDate) &&
				  (extra.fecha.isBefore(stepEnd) || extra.fecha.equals(stepEnd));

			if (fallsInPeriod) {
				extraInPeriod += extra.monto.amount;
			}
		}

		const aporteTotalPeriodo = pmt.amount + extraInPeriod;
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

			const nuevoBalance = balAnterior + interesNetoNum + aporteTotalPeriodo;
			rawBalances[idx] = nuevoBalance;

			if (idx === 0) {
				totalAportadoNum += pmt.amount;
				totalExtraordinarioNum += extraInPeriod;
			}

			const balanceReal = inflacion.calculatePurchasingPower(nuevoBalance, daysFromStart);

			resultadosPorEscenario.push({
				escenarioId: scenario.id,
				balanceAnterior: Money.fromNumber(balAnterior),
				interesBruto: Money.fromNumber(interesBrutoNum),
				interesNeto: Money.fromNumber(interesNetoNum),
				aporte: pmt,
				aporteExtraordinario: Money.fromNumber(extraInPeriod),
				balanceFinal: Money.fromNumber(nuevoBalance),
				balanceReal,
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
	const totalExtraordinario = Money.fromNumber(totalExtraordinarioNum);
	const totalInvertido = capital.add(totalAportado).add(totalExtraordinario);
	const totalHorizonDays = fechaInicio.daysBetween(fechaFin);

	const scenarioSummariesUnsorted: ScenarioSummary[] = params.escenarios.map((scenario, idx) => {
		const finalBalNum = rawBalances[idx] ?? capital.amount;
		const finalBalMoney = Money.fromNumber(finalBalNum);
		const rendimientoMoney = finalBalMoney.isGreaterThan(totalInvertido)
			? finalBalMoney.subtract(totalInvertido)
			: Money.zero();
		const interesTotalMoney = rendimientoMoney;

		const balanceReal = inflacion.calculatePurchasingPower(finalBalMoney, totalHorizonDays);
		const tasaRealAnual = inflacion.calculateRealRate(scenario.tasaAnual.percentage);

		return {
			escenarioId: scenario.id,
			nombre: scenario.nombre,
			balanceFinal: finalBalMoney,
			balanceReal,
			tasaRealAnual,
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

	let escenarioLiderId = '';
	let ventajaLider = Money.zero();

	if (leaderSummary && runnerUpSummary) {
		const diffCents = leaderSummary.balanceFinal.cents - runnerUpSummary.balanceFinal.cents;
		if (diffCents > 0) {
			escenarioLiderId = leaderSummary.escenarioId;
			ventajaLider = Money.fromCents(diffCents);
		}
	} else if (leaderSummary && sortedByGain.length === 1) {
		escenarioLiderId = leaderSummary.escenarioId;
	}

	const resumenPorEscenario: ScenarioSummary[] = scenarioSummariesUnsorted.map((item) => {
		let rol = ScenarioRole.Neutral;
		if (escenarioLiderId !== '' && item.escenarioId === escenarioLiderId) {
			rol = ScenarioRole.Leader;
		} else if (escenarioLiderId !== '' && sortedByGain.length > 1) {
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
		totalExtraordinario,
		totalInvertido,
		tasaInflacion: inflacion,
		periodos,
		resumenPorEscenario,
		escenarioLiderId,
		ventajaLider
	};
}
