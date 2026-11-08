import { err, ok, type Result, SettingsParser } from '$domain';
import type { SettingsDTO } from '../dtos/SettingsDTO';

export class ShareUrlCodec {
	public static encode(settings: SettingsDTO): string {
		const payload = {
			montoInicial: settings.montoInicial,
			aporteMensual: settings.aporteMensual,
			fechaInicio: settings.fechaInicio,
			fechaFin: settings.fechaFin,
			diaCorte: settings.diaCorte,
			omitirPrimerCorte: settings.omitirPrimerCorte,
			aplicarImpuesto: settings.aplicarImpuesto,
			isDarkMode: settings.isDarkMode,
			tasaInflacion: settings.tasaInflacion ?? 0,
			aportesExtraordinarios: settings.aportesExtraordinarios ?? [],
			inversiones: settings.inversiones.map((inv) => ({
				id: inv.id,
				nombre: inv.nombre,
				tasaAnual: inv.tasaAnual,
				color: inv.color
			}))
		};

		const json = JSON.stringify(payload);
		return this.toUrlSafeBase64(json);
	}

	public static decode(hashOrUrl: string): Result<SettingsDTO, Error> {
		try {
			let hash = hashOrUrl.trim();
			const hashIndex = hash.indexOf('#');
			if (hashIndex >= 0) {
				hash = hash.slice(hashIndex + 1);
			}
			if (hash.startsWith('sim=')) {
				hash = hash.slice(4);
			}

			if (!hash) {
				return err(new Error('El hash o URL no contiene parámetros de simulación.'));
			}

			const json = this.fromUrlSafeBase64(hash);
			const raw = JSON.parse(json);

			const parsedRes = SettingsParser.parseSettings(raw);
			if (!parsedRes.ok) {
				return err(new Error(`Parámetros de simulación compartida inválidos: ${parsedRes.error.message}`));
			}

			const p = parsedRes.value;
			const dto: SettingsDTO = {
				id: 'current',
				montoInicial: p.montoInicial.amount,
				aporteMensual: p.aporteMensual.amount,
				fechaInicio: p.fechaInicio.iso,
				fechaFin: p.fechaFin.iso,
				diaCorte: p.diaCorte.value,
				omitirPrimerCorte: p.omitirPrimerCorte,
				aplicarImpuesto: p.aplicarImpuesto,
				isDarkMode: p.isDarkMode,
				tasaInflacion: p.tasaInflacion?.percentage ?? 0,
				aportesExtraordinarios: p.aportesExtraordinarios?.map((a) => ({
					id: a.id,
					monto: a.monto.amount,
					fecha: a.fecha.iso,
					descripcion: a.descripcion
				})) ?? [],
				inversiones: p.inversiones.map((inv) => ({
					id: inv.id,
					nombre: inv.nombre,
					tasaAnual: inv.tasaAnual.percentage,
					color: inv.color
				}))
			};

			return ok(dto);
		} catch (error) {
			return err(error instanceof Error ? error : new Error(String(error)));
		}
	}

	public static toUrlSafeBase64(str: string): string {
		const bytes = new TextEncoder().encode(str);
		let binary = '';
		for (let i = 0; i < bytes.byteLength; i++) {
			const byte = bytes[i];
			if (byte !== undefined) {
				binary += String.fromCharCode(byte);
			}
		}
		if (typeof btoa === 'function') {
			return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
		}
		return Buffer.from(binary, 'binary').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	}

	public static fromUrlSafeBase64(base64: string): string {
		let standard = base64.replace(/-/g, '+').replace(/_/g, '/');
		while (standard.length % 4 !== 0) {
			standard += '=';
		}
		let binary = '';
		if (typeof atob === 'function') {
			binary = atob(standard);
		} else {
			binary = Buffer.from(standard, 'base64').toString('binary');
		}
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		return new TextDecoder().decode(bytes);
	}
}
