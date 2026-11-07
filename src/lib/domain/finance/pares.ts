import { ComparisonAdvantage } from '../enums/ComparisonAdvantage';
import { Money } from '../value-objects/Money';
import type { ScenarioSummary } from '../entities/SimulationResult';

export interface PairScenarioComparison {
	readonly escenarioA: ScenarioSummary;
	readonly escenarioB: ScenarioSummary;
	readonly diferenciaBalance: Money;
	readonly diferenciaRendimiento: Money;
	readonly favorecidoId: string;
	readonly ventajaA: ComparisonAdvantage;
}

/**
 * Genera todos los pares únicos sin repetición: n * (n - 1) / 2
 */
export function generarPares<T>(elementos: readonly T[]): [T, T][] {
	if (!elementos || elementos.length < 2) {
		return [];
	}

	const pares: [T, T][] = [];
	const len = elementos.length;

	for (let i = 0; i < len; i++) {
		const itemA = elementos[i];
		if (itemA === undefined) continue;

		for (let j = i + 1; j < len; j++) {
			const itemB = elementos[j];
			if (itemB === undefined) continue;
			pares.push([itemA, itemB]);
		}
	}

	return pares;
}

/**
 * Compara parejas de escenarios a partir de sus resúmenes de simulación
 */
export function compararParesEscenarios(resumenes: readonly ScenarioSummary[]): readonly PairScenarioComparison[] {
	const pares = generarPares(resumenes);

	return pares.map(([escenarioA, escenarioB]) => {
		const diffCents = Math.abs(escenarioA.balanceFinal.cents - escenarioB.balanceFinal.cents);
		const diferenciaBalance = Money.fromCents(diffCents);

		const diffRendimientoCents = Math.abs(escenarioA.rendimientoNeto.cents - escenarioB.rendimientoNeto.cents);
		const diferenciaRendimiento = Money.fromCents(diffRendimientoCents);

		let favorecidoId = '';
		let ventajaA = ComparisonAdvantage.Neutral;

		if (escenarioA.balanceFinal.cents > escenarioB.balanceFinal.cents) {
			favorecidoId = escenarioA.escenarioId;
			ventajaA = ComparisonAdvantage.Positive;
		} else if (escenarioA.balanceFinal.cents < escenarioB.balanceFinal.cents) {
			favorecidoId = escenarioB.escenarioId;
			ventajaA = ComparisonAdvantage.Negative;
		}

		return {
			escenarioA,
			escenarioB,
			diferenciaBalance,
			diferenciaRendimiento,
			favorecidoId,
			ventajaA
		};
	});
}
