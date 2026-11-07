export function formatCurrency(amount: number): string {
	if (!Number.isFinite(amount)) return '$0.00';
	return new Intl.NumberFormat('es-DO', {
		style: 'currency',
		currency: 'DOP',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})
		.format(amount)
		.replace('DOP', '$')
		.trim();
}

export function formatPercentage(rate: number): string {
	if (!Number.isFinite(rate)) return '0.00%';
	return `${rate.toFixed(2)}%`;
}

export function formatDays(days: number): string {
	const count = Math.max(0, Math.floor(days));
	return `${count} d`;
}

export function formatDifference(diff: number): string {
	if (!Number.isFinite(diff) || Math.abs(diff) < 0.005) {
		return '$0.00';
	}
	const sign = diff > 0 ? '+' : '';
	return `${sign}${formatCurrency(diff)}`;
}
