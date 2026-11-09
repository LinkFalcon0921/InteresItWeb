<script lang="ts">
	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import type { SimulatorState } from '../state/SimulatorState.svelte';
	import { formatCurrency, formatDays } from '../formatters/financialFormatters';

	interface Props {
		state: SimulatorState;
	}

	let { state }: Props = $props();

	const simulation = $derived(state.simulationResult);
	const periodos = $derived(simulation?.periodos ?? []);
	const escenarios = $derived(state.inversiones);
	const leaderId = $derived(simulation?.escenarioLiderId ?? '');
</script>

<div class="projection-table-section">
	<div class="table-header">
		<div>
			<h3 class="table-title">Desglose de Capitalización Mensual</h3>
			<span class="table-subtitle">
				Cálculo período por período considerando días calendario exactos y retención fiscal
			</span>
		</div>
	</div>

	<div class="table-scroll-container">
		<DataTable
			table$aria-label="Tabla de Proyección Financiera"
			class="custom-data-table"
		>
			<Head>
				<Row>
					<Cell class="sticky-col">Corte</Cell>
					<Cell numeric>Días</Cell>
					<Cell numeric>Aporte</Cell>
					{#each escenarios as esc (esc.id)}
						<Cell numeric class={esc.id === leaderId ? 'leader-col-head scenario-cell' : 'scenario-cell'}>
							{esc.nombre} ({esc.tasaAnual}%)
						</Cell>
					{/each}
				</Row>
			</Head>
			<Body>
				{#each periodos as periodo (periodo.periodoIndex)}
					<Row>
						<Cell class="sticky-col period-label-cell">
							<span class="period-idx">#{periodo.periodoIndex}</span>
							<span class="period-month">{periodo.etiquetaMes}</span>
						</Cell>
						<Cell numeric class="days-cell">{formatDays(periodo.diasPeriodo)}</Cell>
						<Cell numeric class="pmt-cell">
							{periodo.periodoIndex > 1 ? formatCurrency(state.aporteMensual) : '$0.00'}
						</Cell>

						{#each escenarios as esc (esc.id)}
							{@const res = periodo.resultadosPorEscenario.find((r) => r.escenarioId === esc.id)}
							<Cell numeric class="balance-cell scenario-cell {esc.id === leaderId ? 'leader-col-cell' : ''}">
								<div class="cell-stack">
									<span class="cell-balance">{formatCurrency(res?.balanceFinal ?? 0)}</span>
									<span class="cell-interest">+{formatCurrency(res?.interesNeto ?? 0)}</span>
								</div>
							</Cell>
						{/each}
					</Row>
				{/each}
			</Body>
		</DataTable>
	</div>
</div>

<style>
	.projection-table-section {
		margin-bottom: 24px;
		width: 100%;
	}

	.table-header {
		margin-bottom: 12px;
	}

	.table-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 800;
		color: #14201f;
		letter-spacing: -0.01em;
	}

	.table-subtitle {
		font-size: 0.75rem;
		color: #5e6b6a;
		font-weight: 500;
	}

	.table-scroll-container {
		background: #ffffff;
		border: 1px solid #d5dedc;
		border-radius: 12px;
		overflow-x: auto;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
		width: 100%;
		display: block;
	}

	:global(.custom-data-table) {
		display: block !important;
		width: 100% !important;
		min-width: 100% !important;
		border-collapse: collapse;
		font-variant-numeric: tabular-nums;
		border: none !important;
	}

	:global(.custom-data-table .mdc-data-table__table-container) {
		width: 100% !important;
		min-width: 100% !important;
		overflow-x: auto !important;
	}

	:global(.custom-data-table .mdc-data-table__table) {
		width: 100% !important;
		min-width: 100% !important;
		table-layout: auto !important;
		border-collapse: collapse;
	}

	:global(.custom-data-table th) {
		background: #f6f8fb !important;
		color: #14201f !important;
		font-weight: 700 !important;
		font-size: 0.75rem !important;
		letter-spacing: 0.02em !important;
		border-bottom: 2px solid #d5dedc !important;
		padding: 12px 14px !important;
		white-space: nowrap;
	}

	:global(.custom-data-table td) {
		padding: 10px 14px !important;
		font-size: 0.8125rem !important;
		border-bottom: 1px solid #edf2f0 !important;
		white-space: nowrap;
	}

	:global(.custom-data-table td.sticky-col) {
		position: sticky;
		left: 0;
		background: #ffffff;
		z-index: 10;
		box-shadow: 2px 0 4px rgba(0, 0, 0, 0.04);
	}

	:global(.custom-data-table th.sticky-col) {
		position: sticky;
		left: 0;
		background: #f6f8fb !important;
		z-index: 11;
		box-shadow: 2px 0 4px rgba(0, 0, 0, 0.04);
	}

	:global(.custom-data-table .scenario-cell) {
		min-width: 140px;
	}

	:global(.period-label-cell) {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.period-idx {
		font-size: 0.6875rem;
		color: #5e6b6a;
		font-weight: 600;
	}

	.period-month {
		font-weight: 700;
		color: #004851;
	}

	:global(.custom-data-table td.days-cell) {
		color: #5e6b6a !important;
		font-weight: 600 !important;
	}

	:global(.custom-data-table td.pmt-cell) {
		color: #14201f !important;
		font-weight: 600 !important;
	}

	:global(.custom-data-table th.leader-col-head) {
		background: #d7ebec !important;
		color: #00292e !important;
		border-bottom-color: #004851 !important;
	}

	:global(.custom-data-table td.leader-col-cell) {
		background: rgba(215, 235, 236, 0.25) !important;
	}

	.cell-stack {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.cell-balance {
		font-weight: 700;
		color: #14201f;
	}

	.cell-interest {
		font-size: 0.6875rem;
		color: #0b7a4b;
		font-weight: 600;
	}

	:global(.dark) .table-title {
		color: #e7eef8;
	}

	:global(.dark) .table-subtitle {
		color: #a3b0c6;
	}

	:global(.dark) .table-scroll-container {
		background: #131c30;
		border-color: #26334e;
	}

	:global(.dark) :global(.custom-data-table th) {
		background: #0b1120 !important;
		color: #e7eef8 !important;
		border-bottom-color: #26334e !important;
	}

	:global(.dark) :global(.custom-data-table td) {
		border-bottom-color: #1e293b !important;
		color: #e7eef8 !important;
	}

	:global(.dark) :global(.custom-data-table td.sticky-col) {
		background: #131c30 !important;
	}

	:global(.dark) :global(.custom-data-table th.sticky-col) {
		background: #0b1120 !important;
	}

	:global(.dark) .period-idx {
		color: #a3b0c6;
	}

	:global(.dark) :global(.custom-data-table td.days-cell) {
		color: #a3b0c6 !important;
	}

	:global(.dark) .period-month {
		color: #7fd1d8;
	}

	:global(.dark) :global(.custom-data-table td.pmt-cell) {
		color: #e7eef8 !important;
	}

	:global(.dark) :global(.custom-data-table th.leader-col-head) {
		background: #004851 !important;
		color: #d7ebec !important;
	}

	:global(.dark) :global(.custom-data-table td.leader-col-cell) {
		background: rgba(0, 72, 81, 0.25) !important;
	}

	:global(.dark) .cell-balance {
		color: #e7eef8;
	}

	:global(.dark) .cell-interest {
		color: #86efac;
	}
</style>
