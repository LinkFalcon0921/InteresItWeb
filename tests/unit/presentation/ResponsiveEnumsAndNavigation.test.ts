import { describe, expect, it } from 'vitest';
import {
	NavigationTab,
	RateStepDelta,
	ResponsiveBreakpoint,
	type NavigationTabOption,
	type RateStepDeltaAction,
	type ResponsiveBreakpointConfig
} from '$presentation';
import {
	ComparisonAdvantage,
	ScenarioRole,
	type ComparisonAdvantageDetail,
	type ScenarioRoleDetail
} from '$domain';

describe('Auditoría y Validación de Enums e Interfaces (Domain y Presentation)', () => {
	describe('1. NavigationTab Enum e Interfaces', () => {
		it('debe ser un enum estricto con los valores de pestaña correctos', () => {
			expect(NavigationTab.Simulador).toBe('simulador');
			expect(NavigationTab.Comparativa).toBe('comparativa');
			expect(NavigationTab.Reporte).toBe('reporte');
		});

		it('permite estructurar items mediante la interfaz NavigationTabOption', () => {
			const item: NavigationTabOption = {
				id: NavigationTab.Simulador,
				label: 'Simulador',
				icon: '📊'
			};
			expect(item.id).toBe(NavigationTab.Simulador);
			expect(item.label).toBe('Simulador');
		});
	});

	describe('2. RateStepDelta Enum e Interfaces', () => {
		it('debe ser un enum numérico exacto para incrementos y decrementos', () => {
			expect(RateStepDelta.DecreaseHalf).toBe(-0.5);
			expect(RateStepDelta.DecreaseQuarter).toBe(-0.25);
			expect(RateStepDelta.IncreaseQuarter).toBe(0.25);
			expect(RateStepDelta.IncreaseHalf).toBe(0.5);
		});

		it('permite modelar acciones mediante la interfaz RateStepDeltaAction', () => {
			const action: RateStepDeltaAction = {
				delta: RateStepDelta.IncreaseQuarter,
				label: '+0.25%',
				ariaLabel: 'Aumentar tasa en 0.25%'
			};
			expect(action.delta).toBe(0.25);
			expect(action.label).toBe('+0.25%');
		});

		it('debe permitir aplicar deltas a tasas anuales respetando límites 0% y 100%', () => {
			const applyDelta = (currentRate: number, delta: RateStepDelta): number => {
				const raw = currentRate + delta;
				const rounded = Math.round(raw * 100) / 100;
				return Math.max(0, Math.min(100, rounded));
			};

			expect(applyDelta(10.5, RateStepDelta.IncreaseQuarter)).toBe(10.75);
			expect(applyDelta(10.5, RateStepDelta.IncreaseHalf)).toBe(11.0);
			expect(applyDelta(10.5, RateStepDelta.DecreaseQuarter)).toBe(10.25);
			expect(applyDelta(10.5, RateStepDelta.DecreaseHalf)).toBe(10.0);

			// Límites
			expect(applyDelta(0.1, RateStepDelta.DecreaseQuarter)).toBe(0);
			expect(applyDelta(99.8, RateStepDelta.IncreaseHalf)).toBe(100);
		});
	});

	describe('3. ResponsiveBreakpoint Enum e Interfaces', () => {
		it('debe ser un enum numérico con breakpoints M3 estandarizados', () => {
			expect(ResponsiveBreakpoint.Desktop).toBe(1024);
			expect(ResponsiveBreakpoint.TabletLandscape).toBe(1024);
			expect(ResponsiveBreakpoint.TabletPortrait).toBe(768);
			expect(ResponsiveBreakpoint.FoldableUnfolded).toBe(700);
			expect(ResponsiveBreakpoint.FoldableFolded).toBe(400);
		});

		it('permite modelar configuraciones de pantalla mediante ResponsiveBreakpointConfig', () => {
			const config: ResponsiveBreakpointConfig = {
				breakpoint: ResponsiveBreakpoint.Desktop,
				minWidthPx: 1024,
				label: 'Escritorio'
			};
			expect(config.breakpoint).toBe(1024);
			expect(config.minWidthPx).toBe(ResponsiveBreakpoint.Desktop);
		});
	});

	describe('4. Enums del Dominio: ComparisonAdvantage y ScenarioRole', () => {
		it('debe mantener ComparisonAdvantage como enum institucional con soporte de interfaz', () => {
			expect(ComparisonAdvantage.Positive).toBe('POSITIVE');
			expect(ComparisonAdvantage.Neutral).toBe('NEUTRAL');
			expect(ComparisonAdvantage.Negative).toBe('NEGATIVE');

			const detail: ComparisonAdvantageDetail = {
				advantage: ComparisonAdvantage.Positive,
				label: 'Favorable',
				isFavorable: true
			};
			expect(detail.advantage).toBe(ComparisonAdvantage.Positive);
			expect(detail.isFavorable).toBe(true);
		});

		it('debe mantener ScenarioRole como enum competitivo con soporte de interfaz', () => {
			expect(ScenarioRole.Leader).toBe('LEADER');
			expect(ScenarioRole.Challenger).toBe('CHALLENGER');
			expect(ScenarioRole.Neutral).toBe('NEUTRAL');

			const roleDetail: ScenarioRoleDetail = {
				role: ScenarioRole.Leader,
				label: 'Líder',
				badgeClass: 'badge-leader'
			};
			expect(roleDetail.role).toBe(ScenarioRole.Leader);
			expect(roleDetail.badgeClass).toBe('badge-leader');
		});
	});
});
