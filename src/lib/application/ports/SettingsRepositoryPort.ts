import type { Result } from '$domain';
import type { SettingsDTO } from '../dtos/SettingsDTO';

export interface SettingsRepositoryPort {
	loadSettings(): Promise<Result<SettingsDTO, Error>>;
	saveSettings(settings: SettingsDTO): Promise<Result<void, Error>>;
}
