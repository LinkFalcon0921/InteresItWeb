import { InvalidInterestRateError } from '../errors/DomainErrors';

export class InterestRate {
	private readonly _percentage: number;

	private constructor(percentage: number) {
		this._percentage = percentage;
	}

	public static fromPercentage(percentage: number): InterestRate {
		if (typeof percentage !== 'number' || !Number.isFinite(percentage) || isNaN(percentage)) {
			throw new InvalidInterestRateError('La tasa de interés debe ser un número numérico válido.');
		}
		if (percentage < 0 || percentage > 1000) {
			throw new InvalidInterestRateError('La tasa de interés debe estar entre 0% y 1000%.');
		}
		return new InterestRate(percentage);
	}

	public static zero(): InterestRate {
		return new InterestRate(0);
	}

	public get percentage(): number {
		return this._percentage;
	}

	public get decimal(): number {
		return this._percentage / 100;
	}

	public get monthlyRate(): number {
		return this.decimal / 12;
	}

	public get dailyRate365(): number {
		return this.decimal / 365;
	}

	public equals(other: InterestRate): boolean {
		return Math.abs(this._percentage - other._percentage) < 0.0000001;
	}

	public isGreaterThan(other: InterestRate): boolean {
		return this._percentage > other._percentage;
	}

	public isLessThan(other: InterestRate): boolean {
		return this._percentage < other._percentage;
	}

	public format(decimals = 2): string {
		return `${this._percentage.toFixed(decimals)}%`;
	}
}
