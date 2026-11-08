import { describe, expect, it } from 'vitest';
import {
	DEFAULT_SETTINGS_DTO,
	ShareUrlCodec,
	type SettingsDTO
} from '$application';

describe('ShareUrlCodec', () => {
	const sampleSettings: SettingsDTO = {
		...DEFAULT_SETTINGS_DTO,
		montoInicial: 250000,
		aporteMensual: 12000,
		fechaInicio: '2026-05-01',
		fechaFin: '2027-05-01',
		diaCorte: 15,
		tasaInflacion: 4.2,
		aportesExtraordinarios: [
			{ id: 'ext-1', monto: 50000, fecha: '2026-12-15', descripcion: 'Doble Sueldo Navideño' }
		],
		inversiones: [
			{ id: 'inv-1', nombre: 'Depósito a Plazo Fijo RD$', tasaAnual: 11.5, color: 'blue' },
			{ id: 'inv-2', nombre: 'Fondo Mutuo Aceleración', tasaAnual: 13.8, color: 'emerald' }
		]
	};

	it('encodes and decodes settings round-trip preserving UTF-8 and all fields', () => {
		const encoded = ShareUrlCodec.encode(sampleSettings);

		// URL-safe checks
		expect(encoded).not.toContain('+');
		expect(encoded).not.toContain('/');
		expect(encoded).not.toContain('=');

		// Decode with hash
		const resultWithHash = ShareUrlCodec.decode(`#sim=${encoded}`);
		expect(resultWithHash.ok).toBe(true);
		if (resultWithHash.ok) {
			const decoded = resultWithHash.value;
			expect(decoded.montoInicial).toBe(250000);
			expect(decoded.aporteMensual).toBe(12000);
			expect(decoded.fechaInicio).toBe('2026-05-01');
			expect(decoded.fechaFin).toBe('2027-05-01');
			expect(decoded.diaCorte).toBe(15);
			expect(decoded.tasaInflacion).toBe(4.2);
			expect(decoded.aportesExtraordinarios).toHaveLength(1);
			expect(decoded.aportesExtraordinarios?.[0]?.descripcion).toBe('Doble Sueldo Navideño');
			expect(decoded.inversiones).toHaveLength(2);
			expect(decoded.inversiones[0]?.nombre).toBe('Depósito a Plazo Fijo RD$');
		}

		// Decode with full URL
		const fullUrl = `https://elior.github.io/InteresItWeb/#sim=${encoded}`;
		const resultFullUrl = ShareUrlCodec.decode(fullUrl);
		expect(resultFullUrl.ok).toBe(true);
	});

	it('rejects empty, corrupted or malformed base64', () => {
		const res1 = ShareUrlCodec.decode('');
		expect(res1.ok).toBe(false);

		const res2 = ShareUrlCodec.decode('#sim=');
		expect(res2.ok).toBe(false);

		const res3 = ShareUrlCodec.decode('#sim=!!!not_base64!!!');
		expect(res3.ok).toBe(false);

		const corruptBase64 = ShareUrlCodec.toUrlSafeBase64('{"badJson":');
		const res4 = ShareUrlCodec.decode(`#sim=${corruptBase64}`);
		expect(res4.ok).toBe(false);
	});
});
