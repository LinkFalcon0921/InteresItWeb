export const ResponsiveBreakpoint = {
	Desktop: 1024,
	TabletLandscape: 1024,
	TabletPortrait: 768,
	FoldableUnfolded: 700,
	FoldableFolded: 400
} as const;

export type ResponsiveBreakpoint =
	(typeof ResponsiveBreakpoint)[keyof typeof ResponsiveBreakpoint];
