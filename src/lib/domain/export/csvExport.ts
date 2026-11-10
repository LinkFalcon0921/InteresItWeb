import type { SimulationOutputDTO } from '$application/dtos/SimulationOutputDTO';

export interface CsvExportOptions {
	readonly scenarioId?: string;
	readonly includeScenarioColumn?: boolean;
}

export const CSV_HEADERS = [
	'Período',
	'Fecha de Corte',
	'Días',
	'Saldo Inicial',
	'Interés Bruto',
	'Retención Ley 10% (RD)',
	'Interés Neto',
	'Aporte Mensual',
	'Saldo Final'
] as const;

export const CSV_HEADERS_WITH_SCENARIO = [
	'Escenario',
	...CSV_HEADERS
] as const;

function formatDecimal(val: number): string {
	return Number.isFinite(val) ? val.toFixed(2) : '0.00';
}

function escapeCsvCell(cell: string | number): string {
	let str = String(cell);
	// Mitigar inyección de fórmulas en hojas de cálculo (CSV Injection - CWE-1236)
	if (/^[=+\-@\t\r]/.test(str)) {
		str = `'${str}`;
	}
	if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

export function generateProjectionCSV(
	simulation: SimulationOutputDTO,
	options?: CsvExportOptions
): string {
	const periods = simulation.periodos;
	const summaries = simulation.resumenPorEscenario;

	const targetScenarioId = options?.scenarioId;
	const isExportAll = targetScenarioId === 'all';
	const includeScenarioCol = Boolean(options?.includeScenarioColumn ?? isExportAll);

	if (!periods || periods.length === 0) {
		return includeScenarioCol ? CSV_HEADERS_WITH_SCENARIO.join(',') : CSV_HEADERS.join(',');
	}

	const rows: string[] = [];

	if (includeScenarioCol) {
		rows.push(CSV_HEADERS_WITH_SCENARIO.join(','));

		// Export for all scenarios or specified
		const scenariosToExport = isExportAll
			? summaries
			: summaries.filter((s) => s.escenarioId === targetScenarioId);

		for (const period of periods) {
			for (const scen of scenariosToExport) {
				const res = period.resultadosPorEscenario.find((r) => r.escenarioId === scen.escenarioId);
				if (!res) continue;

				const initialBalance = res.balanceAnterior;
				const grossInterest = res.interesBruto;
				const netInterest = res.interesNeto;
				const retention = Math.max(0, grossInterest - netInterest);
				const contribution = res.aporte;
				const finalBalance = res.balanceFinal;

				const row = [
					escapeCsvCell(scen.nombre),
					escapeCsvCell(period.periodoIndex),
					escapeCsvCell(period.fechaCorte),
					escapeCsvCell(period.diasPeriodo),
					formatDecimal(initialBalance),
					formatDecimal(grossInterest),
					formatDecimal(retention),
					formatDecimal(netInterest),
					formatDecimal(contribution),
					formatDecimal(finalBalance)
				];
				rows.push(row.join(','));
			}
		}
	} else {
		// Single scenario export (defaults to leader scenario if not specified)
		const scenarioId = targetScenarioId ?? simulation.escenarioLiderId ?? summaries[0]?.escenarioId ?? '';
		rows.push(CSV_HEADERS.join(','));

		for (const period of periods) {
			const res = period.resultadosPorEscenario.find((r) => r.escenarioId === scenarioId);
			if (!res) continue;

			const initialBalance = res.balanceAnterior;
			const grossInterest = res.interesBruto;
			const netInterest = res.interesNeto;
			const retention = Math.max(0, grossInterest - netInterest);
			const contribution = res.aporte;
			const finalBalance = res.balanceFinal;

			const row = [
				escapeCsvCell(period.periodoIndex),
				escapeCsvCell(period.fechaCorte),
				escapeCsvCell(period.diasPeriodo),
				formatDecimal(initialBalance),
				formatDecimal(grossInterest),
				formatDecimal(retention),
				formatDecimal(netInterest),
				formatDecimal(contribution),
				formatDecimal(finalBalance)
			];
			rows.push(row.join(','));
		}
	}

	return rows.join('\r\n');
}
