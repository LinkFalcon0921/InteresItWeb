import { CalendarDate } from '../value-objects/CalendarDate';
import { Money } from '../value-objects/Money';

export class AporteExtraordinario {
	public readonly id: string;
	public readonly monto: Money;
	public readonly fecha: CalendarDate;
	public readonly descripcion: string;

	private constructor(id: string, monto: Money, fecha: CalendarDate, descripcion?: string) {
		this.id = id;
		this.monto = monto;
		this.fecha = fecha;
		this.descripcion = descripcion?.trim() ?? '';
	}

	public static create(
		id: string,
		monto: Money | number,
		fecha: CalendarDate | string,
		descripcion?: string
	): AporteExtraordinario {
		const cleanId = id.trim();
		if (!cleanId) {
			throw new Error('El aporte extraordinario debe tener un identificador válido.');
		}

		const moneyObj = typeof monto === 'number' ? Money.fromNumber(monto) : monto;
		if (moneyObj.cents < 0) {
			throw new Error('El monto del aporte extraordinario no puede ser negativo.');
		}

		const dateObj = typeof fecha === 'string' ? CalendarDate.fromISO(fecha) : fecha;

		return new AporteExtraordinario(cleanId, moneyObj, dateObj, descripcion);
	}
}
