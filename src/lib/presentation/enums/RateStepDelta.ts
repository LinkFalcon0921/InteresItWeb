export const RateStepDelta = {
	DecreaseHalf: -0.5,
	DecreaseQuarter: -0.25,
	IncreaseQuarter: 0.25,
	IncreaseHalf: 0.5
} as const;

export type RateStepDelta = (typeof RateStepDelta)[keyof typeof RateStepDelta];
