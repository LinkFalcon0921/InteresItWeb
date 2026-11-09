import { describe, expect, it } from 'vitest';
import { generateProjectionCSV, CSV_HEADERS, CSV_HEADERS_WITH_SCENARIO, ScenarioRole } from '$domain';
import type { SimulationOutputDTO } from '$application';

describe('csvExport (Domain)', () => {
	const mockSimulation: SimulationOutputDTO = {
		capitalInicial: 1000,
		aporteMensual: 100,
		totalAportado: 200,
		totalInvertido: 1200,
		escenarioLiderId: 'inv-2',
		ventajaLider: 50,
		resumenPorEscenario: [
			{
				escenarioId: 'inv-1',
				nombre: 'Escenario Conservador',
				balanceFinal: 1250,
				interesTotalNeto: 50,
				rendimientoNeto: 5,
				rol: ScenarioRole.Neutral
			},
			{
				escenarioId: 'inv-2',
				nombre: 'Escenario Agresivo',
				balanceFinal: 1300,
				interesTotalNeto: 100,
				rendimientoNeto: 10,
				rol: ScenarioRole.Leader
			}
		],
		periodos: [
			{
				periodoIndex: 1,
				fechaInicio: '2026-01-01',
				fechaCorte: '2026-01-31',
				diasPeriodo: 30,
				etiquetaMes: 'ENE 26',
				resultadosPorEscenario: [
					{
						escenarioId: 'inv-1',
						balanceAnterior: 1000,
						interesBruto: 10,
						interesNeto: 9,
						aporte: 100,
						balanceFinal: 1109,
						isSkipped: false
					},
					{
						escenarioId: 'inv-2',
						balanceAnterior: 1000,
						interesBruto: 20,
						interesNeto: 18,
						aporte: 100,
						balanceFinal: 1118,
						isSkipped: false
					}
				]
			},
			{
				periodoIndex: 2,
				fechaInicio: '2026-02-01',
				fechaCorte: '2026-02-28',
				diasPeriodo: 28,
				etiquetaMes: 'FEB 26',
				resultadosPorEscenario: [
					{
						escenarioId: 'inv-1',
						balanceAnterior: 1109,
						interesBruto: 11,
						interesNeto: 9.9,
						aporte: 100,
						balanceFinal: 1218.9,
						isSkipped: false
					},
					{
						escenarioId: 'inv-2',
						balanceAnterior: 1118,
						interesBruto: 22,
						interesNeto: 19.8,
						aporte: 100,
						balanceFinal: 1237.8,
						isSkipped: false
					}
				]
			}
		]
	};

	it('should generate CSV with exact standard headers for single/default scenario', () => {
		const csv = generateProjectionCSV(mockSimulation);
		const lines = csv.split('\r\n');

		expect(lines[0]).toBe(
			'Período,Fecha de Corte,Días,Saldo Inicial,Interés Bruto,Retención Ley 10% (RD),Interés Neto,Aporte Mensual,Saldo Final'
		);
		expect(lines).toHaveLength(3); // 1 header + 2 periods
	});

	it('should default to leader scenario values', () => {
		const csv = generateProjectionCSV(mockSimulation);
		const lines = csv.split('\r\n');

		// Period 1 for inv-2 (leader): initial 1000, gross 20, ret 2.00, net 18.00, pmt 100, final 1118.00
		expect(lines[1]).toBe('1,2026-01-31,30,1000.00,20.00,2.00,18.00,100.00,1118.00');
		// Period 2 for inv-2: initial 1118, gross 22, ret 2.20, net 19.80, pmt 100, final 1237.80
		expect(lines[2]).toBe('2,2026-02-28,28,1118.00,22.00,2.20,19.80,100.00,1237.80');
	});

	it('should export specific scenario when scenarioId is passed', () => {
		const csv = generateProjectionCSV(mockSimulation, { scenarioId: 'inv-1' });
		const lines = csv.split('\r\n');

		expect(lines[0]).toBe(CSV_HEADERS.join(','));
		expect(lines[1]).toBe('1,2026-01-31,30,1000.00,10.00,1.00,9.00,100.00,1109.00');
	});

	it('should export all scenarios with Escenario column when scenarioId is all', () => {
		const csv = generateProjectionCSV(mockSimulation, { scenarioId: 'all' });
		const lines = csv.split('\r\n');

		expect(lines[0]).toBe(CSV_HEADERS_WITH_SCENARIO.join(','));
		// 1 header + 2 periods * 2 scenarios = 5 lines
		expect(lines).toHaveLength(5);
		expect(lines[1]).toContain('Escenario Conservador,1,2026-01-31');
		expect(lines[2]).toContain('Escenario Agresivo,1,2026-01-31');
	});

	it('should handle empty periods gracefully with single scenario', () => {
		const emptySim: SimulationOutputDTO = {
			...mockSimulation,
			periodos: []
		};
		const csv = generateProjectionCSV(emptySim);
		expect(csv).toBe(CSV_HEADERS.join(','));
	});

	it('should handle empty periods gracefully with all scenarios', () => {
		const emptySim: SimulationOutputDTO = {
			...mockSimulation,
			periodos: []
		};
		const csv = generateProjectionCSV(emptySim, { scenarioId: 'all' });
		expect(csv).toBe(CSV_HEADERS_WITH_SCENARIO.join(','));
	});

	it('should escape cells containing quotes, commas, newlines and carriage returns', () => {
		const customSim: SimulationOutputDTO = {
			...mockSimulation,
			resumenPorEscenario: [
				{
					...mockSimulation.resumenPorEscenario[0]!,
					nombre: 'Fondo "Especial", VIP\r\nPlus'
				}
			]
		};
		const csv = generateProjectionCSV(customSim, { scenarioId: 'all' });
		expect(csv).toContain('"Fondo ""Especial"", VIP\r\nPlus"');
	});
});
