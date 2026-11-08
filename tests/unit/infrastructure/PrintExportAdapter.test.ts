import { describe, expect, it, vi } from 'vitest';
import { PrintExportAdapter } from '$infrastructure';
import type { SimulationOutputDTO } from '$application';

describe('PrintExportAdapter', () => {
	const mockOutput: SimulationOutputDTO = {
		capitalInicial: 10000,
		aporteMensual: 500,
		totalAportado: 3500,
		totalInvertido: 13500,
		periodos: [
			{
				periodoIndex: 1,
				fechaInicio: '2026-01-01',
				fechaCorte: '2026-01-16',
				diasPeriodo: 15,
				etiquetaMes: 'ENE 26',
				resultadosPorEscenario: []
			},
			{
				periodoIndex: 2,
				fechaInicio: '2026-01-16',
				fechaCorte: '2026-12-31',
				diasPeriodo: 349,
				etiquetaMes: 'DIC 26',
				resultadosPorEscenario: []
			}
		],
		resumenPorEscenario: [],
		escenarioLiderId: 'inv-1',
		ventajaLider: 120.5
	};

	it('returns error when window is not available', async () => {
		const adapter = new PrintExportAdapter(undefined);
		// En entorno Node, window no está definido por defecto
		const printResult = await adapter.printReport();
		expect(printResult.ok).toBe(false);
		if (!printResult.ok) {
			expect(printResult.error.message).toContain('window no está disponible');
		}

		const exportResult = await adapter.exportReport(mockOutput);
		expect(exportResult.ok).toBe(false);
		if (!exportResult.ok) {
			expect(exportResult.error.message).toContain('window no está disponible');
		}
	});

	it('invokes window.print() successfully via printReport()', async () => {
		const printMock = vi.fn();
		const mockWindow = {
			print: printMock,
			document: { title: 'InteresIt - Terminal' }
		} as unknown as Window;

		const adapter = new PrintExportAdapter(mockWindow);
		const result = await adapter.printReport();

		expect(result.ok).toBe(true);
		expect(printMock).toHaveBeenCalledTimes(1);
	});

	it('temporarily sets document.title during exportReport() and restores it after printing', async () => {
		let titleDuringPrint = '';
		const mockWindow = {
			document: { title: 'Título Original' },
			print: vi.fn(() => {
				titleDuringPrint = mockWindow.document.title;
			})
		} as unknown as Window;

		const adapter = new PrintExportAdapter(mockWindow);
		const result = await adapter.exportReport(mockOutput, { fileName: 'Mi_Reporte_Financiero' });

		expect(result.ok).toBe(true);
		expect(mockWindow.print).toHaveBeenCalledTimes(1);
		expect(titleDuringPrint).toBe('Mi_Reporte_Financiero');
		expect(mockWindow.document.title).toBe('Título Original');
	});

	it('uses generated default title during exportReport() when fileName is omitted', async () => {
		let titleDuringPrint = '';
		const mockWindow = {
			document: { title: 'Base' },
			print: vi.fn(() => {
				titleDuringPrint = mockWindow.document.title;
			})
		} as unknown as Window;

		const adapter = new PrintExportAdapter(mockWindow);
		const result = await adapter.exportReport(mockOutput);

		expect(result.ok).toBe(true);
		expect(titleDuringPrint).toBe('InteresIt_Reporte_2026-01-01_2026-12-31');
		expect(mockWindow.document.title).toBe('Base');
	});

	it('uses generated fallback title when periods list is empty', async () => {
		let titleDuringPrint = '';
		const mockWindow = {
			document: { title: 'Base' },
			print: vi.fn(() => {
				titleDuringPrint = mockWindow.document.title;
			})
		} as unknown as Window;

		const emptyOutput: SimulationOutputDTO = {
			...mockOutput,
			periodos: []
		};

		const adapter = new PrintExportAdapter(mockWindow);
		const result = await adapter.exportReport(emptyOutput);

		expect(result.ok).toBe(true);
		expect(titleDuringPrint).toBe('InteresIt_Reporte_inicio_fin');
		expect(mockWindow.document.title).toBe('Base');
	});

	it('restores document title even if window.print throws during exportReport()', async () => {
		const mockWindow = {
			document: { title: 'Base Original' },
			print: vi.fn(() => {
				throw new Error('Error al imprimir');
			})
		} as unknown as Window;

		const adapter = new PrintExportAdapter(mockWindow);
		const result = await adapter.exportReport(mockOutput, { fileName: 'Reporte_Test' });

		expect(result.ok).toBe(false);
		expect(mockWindow.document.title).toBe('Base Original');
	});
});
