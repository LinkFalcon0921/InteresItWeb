import { InvalidMoneyError } from '../errors/DomainErrors';

export class Money {
	private readonly _cents: number;

	private constructor(cents: number) {
		this._cents = cents;
	}

	public static fromNumber(value: number): Money {
		if (typeof value !== 'number' || !Number.isFinite(value) || isNaN(value)) {
			throw new InvalidMoneyError('El monto debe ser un número numérico válido.');
		}
		if (value < 0) {
			throw new InvalidMoneyError('El monto no puede ser negativo.');
		}
		const cents = Math.round((value + Number.EPSILON) * 100);
		return new Money(cents);
	}

	public static fromCents(cents: number): Money {
		if (typeof cents !== 'number' || !Number.isFinite(cents) || isNaN(cents) || !Number.isInteger(cents)) {
			throw new InvalidMoneyError('Los centavos deben ser un número entero válido.');
		}
		if (cents < 0) {
			throw new InvalidMoneyError('Los centavos no pueden ser negativos.');
		}
		return new Money(cents);
	}

	public static zero(): Money {
		return new Money(0);
	}

	public get cents(): number {
		return this._cents;
	}

	public get amount(): number {
		return this._cents / 100;
	}

	public add(other: Money): Money {
		return new Money(this._cents + other._cents);
	}

	public subtract(other: Money): Money {
		const diff = this._cents - other._cents;
		if (diff < 0) {
			throw new InvalidMoneyError('El resultado de la resta monetaria no puede ser negativo.');
		}
		return new Money(diff);
	}

	public multiply(factor: number): Money {
		if (typeof factor !== 'number' || !Number.isFinite(factor) || factor < 0) {
			throw new InvalidMoneyError('El factor de multiplicación debe ser un número no negativo.');
		}
		return new Money(Math.round(this._cents * factor));
	}

	public isGreaterThan(other: Money): boolean {
		return this._cents > other._cents;
	}

	public isLessThan(other: Money): boolean {
		return this._cents < other._cents;
	}

	public equals(other: Money): boolean {
		return this._cents === other._cents;
	}

	public format(locale = 'en-US', currency = 'USD'): string {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(this.amount);
	}
}
