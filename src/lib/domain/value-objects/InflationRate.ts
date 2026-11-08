import { InvalidInflationRateError } from '../errors/DomainErrors';
import { Money } from './Money';

export class InflationRate {
	private constructor(public readonly percentage: number) {}

	public static fromPercentage(percentage: number): InflationRate {
		if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
			throw new InvalidInflationRateError('La tasa de inflación debe ser un porcentaje numérico entre 0 y 100.');
		}
		return new InflationRate(percentage);
	}

	public static zero(): InflationRate {
		return new InflationRate(0);
	}

	public get decimal(): number {
		return this.percentage / 100;
	}

	/**
	 * Calcula la tasa real anual utilizando la fórmula de Fisher:
	 * (1 + r_nominal) = (1 + r_real) * (1 + i) => r_real = (1 + r_nominal) / (1 + i) - 1
	 * Retorna la tasa real en porcentaje con 2 cifras decimales.
	 */
	public calculateRealRate(nominalRatePercentage: number): number {
		const rNom = nominalRatePercentage / 100;
		const i = this.decimal;
		if (i === 0) {
			return nominalRatePercentage;
		}
		const rReal = (1 + rNom) / (1 + i) - 1;
		return Math.round(rReal * 10000) / 100;
	}

	/**
	 * Calcula el poder adquisitivo de un monto nominal tras transcurrir `days` días en base a 365 días/año:
	 * B_real = B_nominal / (1 + i)^(days / 365)
	 */
	public calculatePurchasingPower(nominalAmount: Money | number, days: number): Money {
		const amt = typeof nominalAmount === 'number' ? nominalAmount : nominalAmount.amount;
		if (this.percentage === 0 || days <= 0 || amt <= 0) {
			return typeof nominalAmount === 'number' ? Money.fromNumber(amt) : nominalAmount;
		}
		const years = days / 365;
		const deflator = Math.pow(1 + this.decimal, years);
		return Money.fromNumber(amt / deflator);
	}
}
