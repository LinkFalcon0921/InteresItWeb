import { ParseInputError } from '../errors/DomainErrors';
import { CalendarDate } from '../value-objects/CalendarDate';
import { CutoffDay } from '../value-objects/CutoffDay';
import { InterestRate } from '../value-objects/InterestRate';
import { Money } from '../value-objects/Money';
import { err, ok, type Result } from './Result';

export class FinancialInputParser {
	public static parseMoney(
		input: unknown,
		fieldName = 'monto',
		defaultValue?: number
	): Result<Money, ParseInputError> {
		if (input === undefined || input === null || input === '') {
			if (defaultValue !== undefined) {
				try {
					return ok(Money.fromNumber(defaultValue));
				} catch {
					return err(new ParseInputError(fieldName, 'El valor por defecto es inválido.'));
				}
			}
			return err(new ParseInputError(fieldName, 'El valor no puede estar vacío.'));
		}

		let numVal: number;
		if (typeof input === 'number') {
			numVal = input;
		} else if (typeof input === 'string') {
			numVal = parseFloat(input.trim().replace(/,/g, ''));
		} else {
			return err(new ParseInputError(fieldName, 'Tipo de dato no compatible para monto.'));
		}

		if (isNaN(numVal) || !Number.isFinite(numVal)) {
			return err(new ParseInputError(fieldName, 'Debe ser un número válido.'));
		}
		if (numVal < 0) {
			return err(new ParseInputError(fieldName, 'El monto no puede ser negativo.'));
		}

		try {
			return ok(Money.fromNumber(numVal));
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Error al instanciar Money.';
			return err(new ParseInputError(fieldName, msg));
		}
	}

	public static parseInterestRate(
		input: unknown,
		fieldName = 'tasa',
		defaultValue?: number
	): Result<InterestRate, ParseInputError> {
		if (input === undefined || input === null || input === '') {
			if (defaultValue !== undefined) {
				try {
					return ok(InterestRate.fromPercentage(defaultValue));
				} catch {
					return err(new ParseInputError(fieldName, 'El valor por defecto es inválido.'));
				}
			}
			return err(new ParseInputError(fieldName, 'La tasa no puede estar vacía.'));
		}

		let numVal: number;
		if (typeof input === 'number') {
			numVal = input;
		} else if (typeof input === 'string') {
			numVal = parseFloat(input.trim().replace(/%/g, ''));
		} else {
			return err(new ParseInputError(fieldName, 'Tipo de dato no compatible para tasa.'));
		}

		if (isNaN(numVal) || !Number.isFinite(numVal)) {
			return err(new ParseInputError(fieldName, 'Debe ser un número válido.'));
		}
		if (numVal < 0 || numVal > 1000) {
			return err(new ParseInputError(fieldName, 'La tasa debe estar entre 0% y 1000%.'));
		}

		try {
			return ok(InterestRate.fromPercentage(numVal));
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Error al instanciar InterestRate.';
			return err(new ParseInputError(fieldName, msg));
		}
	}

	public static parseCalendarDate(
		input: unknown,
		fieldName = 'fecha',
		defaultValue?: string
	): Result<CalendarDate, ParseInputError> {
		let strVal: string;
		if (input === undefined || input === null || input === '') {
			if (defaultValue !== undefined) {
				strVal = defaultValue;
			} else {
				return err(new ParseInputError(fieldName, 'La fecha no puede estar vacía.'));
			}
		} else if (typeof input === 'string') {
			strVal = input.trim();
		} else if (input instanceof Date && !isNaN(input.getTime())) {
			strVal = input.toISOString().split('T')[0] ?? '';
		} else {
			return err(new ParseInputError(fieldName, 'Tipo de dato no compatible para fecha.'));
		}

		try {
			return ok(CalendarDate.fromISO(strVal));
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Error al parsear CalendarDate.';
			return err(new ParseInputError(fieldName, msg));
		}
	}

	public static parseCutoffDay(
		input: unknown,
		fieldName = 'diaCorte',
		defaultValue?: number
	): Result<CutoffDay, ParseInputError> {
		if (input === undefined || input === null || input === '') {
			if (defaultValue !== undefined) {
				try {
					return ok(CutoffDay.fromNumber(defaultValue));
				} catch {
					return err(new ParseInputError(fieldName, 'El valor por defecto es inválido.'));
				}
			}
			return err(new ParseInputError(fieldName, 'El día de corte no puede estar vacío.'));
		}

		let intVal: number;
		if (typeof input === 'number') {
			intVal = Math.floor(input);
		} else if (typeof input === 'string') {
			intVal = parseInt(input.trim(), 10);
		} else {
			return err(new ParseInputError(fieldName, 'Tipo de dato no compatible para día de corte.'));
		}

		if (isNaN(intVal) || !Number.isFinite(intVal)) {
			return err(new ParseInputError(fieldName, 'Debe ser un número entero válido.'));
		}
		if (intVal < 1 || intVal > 31) {
			return err(new ParseInputError(fieldName, 'El día de corte debe estar entre 1 y 31.'));
		}

		try {
			return ok(CutoffDay.fromNumber(intVal));
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Error al instanciar CutoffDay.';
			return err(new ParseInputError(fieldName, msg));
		}
	}

	public static parseBoolean(
		input: unknown,
		fieldName = 'booleano',
		defaultValue = false
	): Result<boolean, ParseInputError> {
		if (input === undefined || input === null) {
			return ok(defaultValue);
		}
		if (typeof input === 'boolean') {
			return ok(input);
		}
		if (typeof input === 'string') {
			const lower = input.trim().toLowerCase();
			if (lower === 'true' || lower === '1' || lower === 'yes') return ok(true);
			if (lower === 'false' || lower === '0' || lower === 'no') return ok(false);
		}
		if (typeof input === 'number') {
			return ok(input !== 0);
		}
		return err(new ParseInputError(fieldName, 'No se pudo interpretar como booleano.'));
	}
}
