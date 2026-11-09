import { describe, expect, it } from 'vitest';
import {
	NavigationTab,
	RateStepDelta,
	ResponsiveBreakpoint
} from '$presentation';

describe('Responsive Constants and Navigation Enums (Presentation Layer)', () => {
	it('debe definir los valores exactos de NavigationTab sin magic strings', () => {
		expect(NavigationTab.Simulador).toBe('simulador');
		expect(NavigationTab.Comparativa).toBe('comparativa');
		expect(NavigationTab.Reporte).toBe('reporte');
	});

	it('debe definir los valores de RateStepDelta con precisión numérica', () => {
		expect(RateStepDelta.DecreaseHalf).toBe(-0.5);
		expect(RateStepDelta.DecreaseQuarter).toBe(-0.25);
		expect(RateStepDelta.IncreaseQuarter).toBe(0.25);
		expect(RateStepDelta.IncreaseHalf).toBe(0.5);
	});

	it('debe definir los breakpoints responsivos según la arquitectura de layout', () => {
		expect(ResponsiveBreakpoint.Desktop).toBe(1024);
		expect(ResponsiveBreakpoint.TabletLandscape).toBe(1024);
		expect(ResponsiveBreakpoint.TabletPortrait).toBe(768);
		expect(ResponsiveBreakpoint.FoldableUnfolded).toBe(700);
		expect(ResponsiveBreakpoint.FoldableFolded).toBe(400);
	});

	it('debe permitir aplicar deltas a tasas anuales respetando límites 0% y 100%', () => {
		const applyDelta = (currentRate: number, delta: number): number => {
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
