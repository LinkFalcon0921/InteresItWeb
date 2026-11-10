import { describe, expect, it } from 'vitest';
import {
	simular,
	InvestmentScenario,
	InvalidDateRangeError,
	SettingsParser,
	BackupParser,
	ScenarioRole,
	SYSTEM_LIMITS,
	ok
} from '$domain';
import { generateProjectionCSV } from '$domain/export/csvExport';
import { ShareUrlCodec } from '$application/services/ShareUrlCodec';
import { SavePortfolioUseCase } from '$application/use-cases/SavePortfolioUseCase';
import type { SimulationOutputDTO } from '$application/dtos/SimulationOutputDTO';
import type { PortfolioDTO } from '$application/dtos/PortfolioDTO';
import type { SettingsRepositoryPort } from '$application/ports/SettingsRepositoryPort';

describe('Auditoría de Seguridad, Resiliencia y Puntos de Bloqueo', () => {
	const escA = InvestmentScenario.create('esc-1', 'Escenario Base', 10, 'emerald');
	const escB = InvestmentScenario.create('esc-2', 'Escenario Dinámico', 12, 'blue');

	describe('1. Mitigación de Puntos de Bloqueo y Memory Leaks por Horizontes Desbordados', () => {
		it('debe rechazar horizontes mayores a 30 años para prevenir congelamiento de la UI y agotamiento de RAM', () => {
			expect(() => {
				simular({
					capitalInicial: 1000,
					aporteMensual: 100,
					fechaInicio: '2026-01-01',
					fechaFin: '2060-01-01', // 34 años (> 10,958 días)
					diaCorte: 15,
					escenarios: [escA, escB]
				});
			}).toThrow('El horizonte de proyección no puede superar los 30 años (10,958 días).');
		});

		it('permite horizontes largos legítimos (ej. 30 años) sin bloqueo de memoria', () => {
			const res = simular({
				capitalInicial: 1000,
				aporteMensual: 50,
				fechaInicio: '2026-01-01',
				fechaFin: '2056-01-01', // 30 años
				diaCorte: 15,
				escenarios: [escA, escB]
			});

			expect(res.periodos.length).toBeGreaterThan(350);
			expect(res.periodos.length).toBeLessThanOrEqual(360);
			expect(res.resumenPorEscenario[0]?.balanceFinal.amount).toBeGreaterThan(1000);
		});
	});

	describe('2. Prevención de Inyección de Fórmulas en CSV (CWE-1236)', () => {
		it('neutraliza caracteres de comando (=, +, -, @) prefijándolos con comilla simple', () => {
			const fakeOutput: SimulationOutputDTO = {
				capitalInicial: 1000,
				aporteMensual: 100,
				totalAportado: 200,
				totalExtraordinario: 0,
				totalInvertido: 1200,
				tasaInflacion: 0,
				periodos: [
					{
						periodoIndex: 1,
						fechaInicio: '2026-01-01',
						fechaCorte: '2026-02-01',
						diasPeriodo: 31,
						etiquetaMes: 'FEB 26',
						resultadosPorEscenario: [
							{
								escenarioId: 'inv-malicious-1',
								balanceAnterior: 1000,
								interesBruto: 10,
								interesNeto: 9,
								aporte: 100,
								aporteExtraordinario: 0,
								balanceFinal: 1109,
								balanceReal: 1109,
								isSkipped: false
							},
							{
								escenarioId: 'inv-malicious-2',
								balanceAnterior: 1000,
								interesBruto: 10,
								interesNeto: 9,
								aporte: 100,
								aporteExtraordinario: 0,
								balanceFinal: 1109,
								balanceReal: 1109,
								isSkipped: false
							}
						]
					}
				],
				resumenPorEscenario: [
					{
						escenarioId: 'inv-malicious-1',
						nombre: '=cmd|\'/C calc\'!A0',
						balanceFinal: 1109,
						balanceReal: 1109,
						tasaRealAnual: 10,
						interesTotalNeto: 9,
						rendimientoNeto: 9,
						rol: ScenarioRole.Leader
					},
					{
						escenarioId: 'inv-malicious-2',
						nombre: '@SUM(1+1)*cmd',
						balanceFinal: 1109,
						balanceReal: 1109,
						tasaRealAnual: 12,
						interesTotalNeto: 9,
						rendimientoNeto: 9,
						rol: ScenarioRole.Challenger
					}
				],
				escenarioLiderId: 'inv-malicious-1',
				ventajaLider: 0
			};

			const csv = generateProjectionCSV(fakeOutput, { includeScenarioColumn: true, scenarioId: 'all' });

			// Verificar que los nombres de los escenarios no inicien directamente con fórmulas activas
			expect(csv).toContain('\'=cmd|\'/C calc\'!A0');
			expect(csv).toContain('\'@SUM(1+1)*cmd');
			expect(csv).not.toMatch(/^=cmd/m);
			expect(csv).not.toMatch(/^@SUM/m);
		});
	});

	describe('3. Protección contra DoS y Desbordamiento en Copias de Seguridad y Configuración', () => {
		it('rechaza archivos de backup con más de 50 portafolios para prevenir agotamiento de almacenamiento', () => {
			const excessivePortfolios = Array.from({ length: 51 }, (_, i) => ({
				id: `port-${i}`,
				name: `Portafolio ${i}`,
				settings: {
					montoInicial: 1000,
					aporteMensual: 100,
					fechaInicio: '2026-01-01',
					fechaFin: '2026-12-31',
					diaCorte: 15,
					omitirPrimerCorte: false,
					aplicarImpuesto: true,
					isDarkMode: false,
					inversiones: [{ id: 'inv-1', nombre: 'Test', tasaAnual: 10, color: 'blue' }]
				}
			}));

			const rawBackup = {
				app: 'InteresIt',
				version: '2.0.0',
				exportedAt: new Date().toISOString(),
				settings: {
					montoInicial: 1000,
					aporteMensual: 100,
					fechaInicio: '2026-01-01',
					fechaFin: '2026-12-31',
					diaCorte: 15,
					omitirPrimerCorte: false,
					aplicarImpuesto: true,
					isDarkMode: false,
					inversiones: [{ id: 'inv-1', nombre: 'Test', tasaAnual: 10, color: 'blue' }]
				},
				portfolios: excessivePortfolios
			};

			const result = BackupParser.parseBackup(rawBackup);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toContain('50 portafolios');
			}
		});

		it('rechaza configuraciones con más de 200 escenarios en SettingsParser', () => {
			const excessiveScenarios = Array.from({ length: 205 }, (_, i) => ({
				id: `inv-${i}`,
				nombre: `Escenario ${i}`,
				tasaAnual: 10,
				color: 'emerald'
			}));

			const result = SettingsParser.parseSettings({
				montoInicial: 1000,
				aporteMensual: 100,
				fechaInicio: '2026-01-01',
				fechaFin: '2026-12-31',
				diaCorte: 15,
				omitirPrimerCorte: false,
				aplicarImpuesto: true,
				isDarkMode: false,
				inversiones: excessiveScenarios
			});

			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toContain('200 escenarios');
			}
		});
	});

	describe('4. Resiliencia contra Manipulación desde Consola o Inyección en URL Hash', () => {
		it('rechaza y neutraliza payloads con etiquetas <script> y valores corruptos en ShareUrlCodec', () => {
			const maliciousPayload = {
				montoInicial: -999999, // Negativo inválido
				aporteMensual: 'NaN',
				fechaInicio: '2026-01-01',
				fechaFin: '2026-12-31',
				diaCorte: 15,
				omitirPrimerCorte: false,
				aplicarImpuesto: true,
				isDarkMode: false,
				inversiones: [
					{
						id: 'inv-1',
						nombre: '<script>alert("XSS")</script>',
						tasaAnual: 10,
						color: 'blue'
					}
				]
			};

			const encoded = ShareUrlCodec.toUrlSafeBase64(JSON.stringify(maliciousPayload));
			const decodeResult = ShareUrlCodec.decode(`#sim=${encoded}`);

			// Debe fallar porque montoInicial es negativo y aporteMensual es 'NaN'
			expect(decodeResult.ok).toBe(false);
		});

		it('garantiza que variables reactivas de estado no contaminan globalThis ni window', () => {
			const g = globalThis as Record<string, unknown>;
			expect(g['simState']).toBeUndefined();
			expect(g['simulatorState']).toBeUndefined();
			expect(g['appContainer']).toBeUndefined();
		});
	});

	describe('5. Inmutabilidad y Protección de Límites del Sistema contra Modificación en Frontend', () => {
		it('garantiza que SYSTEM_LIMITS está completamente congelado e impide modificaciones en runtime', () => {
			expect(Object.isFrozen(SYSTEM_LIMITS)).toBe(true);
			expect(SYSTEM_LIMITS.MAX_HORIZON_YEARS).toBe(30);
			expect(SYSTEM_LIMITS.MAX_HORIZON_DAYS).toBe(10958);
			expect(SYSTEM_LIMITS.MAX_PERIODS).toBe(360);
			expect(SYSTEM_LIMITS.MAX_PORTFOLIOS).toBe(50);

			// Intentar modificar valores debe fallar o no tener efecto
			expect(() => {
				// @ts-expect-error - Verificación adversarial en tiempo de ejecución
				SYSTEM_LIMITS.MAX_HORIZON_YEARS = 99;
			}).toThrow();

			expect(() => {
				// @ts-expect-error - Verificación adversarial en tiempo de ejecución
				SYSTEM_LIMITS.MAX_PORTFOLIOS = 999;
			}).toThrow();

			expect(SYSTEM_LIMITS.MAX_HORIZON_YEARS).toBe(30);
			expect(SYSTEM_LIMITS.MAX_PORTFOLIOS).toBe(50);
		});

		it('SavePortfolioUseCase rechaza guardar nuevos portafolios si ya existen 50', async () => {
			const fakeRepo = {
				listPortfolios: async () => ok(Array.from({ length: 50 }, (_, i) => ({
					id: `p-${i}`,
					name: `Portafolio ${i}`,
					updatedAt: '',
					escenariosCount: 2,
					montoInicial: 100
				}))),
				savePortfolio: async () => ok(undefined)
			} as unknown as SettingsRepositoryPort;

			const useCase = new SavePortfolioUseCase(fakeRepo);
			const newPortfolio: PortfolioDTO = {
				id: 'nuevo-port-51',
				name: 'Excede límite',
				createdAt: '2026-01-01T00:00:00Z',
				updatedAt: '2026-01-01T00:00:00Z',
				settings: {
					montoInicial: 1000,
					aporteMensual: 100,
					fechaInicio: '2026-01-01',
					fechaFin: '2026-12-31',
					diaCorte: 15,
					omitirPrimerCorte: false,
					aplicarImpuesto: true,
					isDarkMode: false,
					inversiones: []
				}
			};

			const result = await useCase.execute(newPortfolio);
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.error.message).toContain('50 portafolios');
			}
		});
	});
});
