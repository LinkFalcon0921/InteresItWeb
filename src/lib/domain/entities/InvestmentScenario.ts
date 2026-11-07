import { InvalidScenarioError } from '../errors/DomainErrors';
import { InterestRate } from '../value-objects/InterestRate';

export interface InvestmentScenarioProps {
	readonly id: string;
	readonly nombre: string;
	readonly tasaAnual: InterestRate;
	readonly color: string;
}

export class InvestmentScenario {
	readonly id: string;
	readonly nombre: string;
	readonly tasaAnual: InterestRate;
	readonly color: string;

	private constructor(props: InvestmentScenarioProps) {
		this.id = props.id;
		this.nombre = props.nombre;
		this.tasaAnual = props.tasaAnual;
		this.color = props.color;
	}

	public static create(id: string, nombre: string, tasaAnual: InterestRate | number, color: string): InvestmentScenario {
		if (typeof id !== 'string' || id.trim().length === 0) {
			throw new InvalidScenarioError('El identificador del escenario no puede estar vacío.');
		}
		if (typeof nombre !== 'string' || nombre.trim().length === 0) {
			throw new InvalidScenarioError('El nombre del escenario no puede estar vacío.');
		}
		const rate = typeof tasaAnual === 'number' ? InterestRate.fromPercentage(tasaAnual) : tasaAnual;
		const colorVal = typeof color === 'string' && color.trim().length > 0 ? color.trim() : 'emerald';

		return new InvestmentScenario({
			id: id.trim(),
			nombre: nombre.trim(),
			tasaAnual: rate,
			color: colorVal
		});
	}

	public withRate(newRate: InterestRate | number): InvestmentScenario {
		return InvestmentScenario.create(this.id, this.nombre, newRate, this.color);
	}

	public withName(newName: string): InvestmentScenario {
		return InvestmentScenario.create(this.id, newName, this.tasaAnual, this.color);
	}
}
