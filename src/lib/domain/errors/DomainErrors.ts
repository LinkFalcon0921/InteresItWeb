export class DomainError extends Error {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}

export class InvalidMoneyError extends DomainError {
	constructor(message = 'El monto monetario debe ser un número finito no negativo.') {
		super(message);
	}
}

export class InvalidInterestRateError extends DomainError {
	constructor(message = 'La tasa de interés debe ser un número no negativo menor o igual a 1000.') {
		super(message);
	}
}

export class InvalidCalendarDateError extends DomainError {
	constructor(message = 'La fecha debe tener un formato ISO válido YYYY-MM-DD.') {
		super(message);
	}
}

export class InvalidCutoffDayError extends DomainError {
	constructor(message = 'El día de corte debe ser un número entero entre 1 y 31.') {
		super(message);
	}
}

export class InvalidDateRangeError extends DomainError {
	constructor(message = 'La fecha de inicio debe ser estrictamente menor que la fecha de fin.') {
		super(message);
	}
}

export class InvalidScenarioError extends DomainError {
	constructor(message = 'El escenario de inversión contiene parámetros no válidos.') {
		super(message);
	}
}

export class ParseInputError extends DomainError {
	readonly field: string;
	constructor(field: string, message: string) {
		super(`Error en el campo "${field}": ${message}`);
		this.field = field;
	}
}
