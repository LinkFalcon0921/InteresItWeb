import { faker } from '@faker-js/faker';

/**
 * Datos de prueba generados con faker (semilla fija para reproducibilidad).
 * La semilla se adjunta al reporte de Playwright para poder repetir una corrida.
 */
export const QA_FAKER_SEED = 20261107;

export interface FakeSimulationParameters {
	montoInicial: number;
	aporteMensual: number;
	tasaPrimerEscenario: number;
}

export function createFakeParameters(seed: number = QA_FAKER_SEED): FakeSimulationParameters {
	faker.seed(seed);
	return {
		montoInicial: faker.number.int({ min: 10_000, max: 2_000_000 }),
		aporteMensual: faker.number.int({ min: 500, max: 50_000 }),
		tasaPrimerEscenario: faker.number.float({ min: 1, max: 25, fractionDigits: 2 })
	};
}
