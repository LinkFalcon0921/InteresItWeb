import {
	CalculatePairMatrixUseCase,
	CalculateSimulationUseCase,
	LoadSettingsUseCase,
	SaveSettingsUseCase,
	type ReportExportPort,
	type SettingsRepositoryPort
} from '$application';
import {
	IndexedDBSettingsRepository,
	PrintExportAdapter
} from '$infrastructure';
import { SimulatorState } from '$presentation/state/SimulatorState.svelte';
import { getContext, setContext } from 'svelte';

export interface AppDependencies {
	readonly settingsRepository: SettingsRepositoryPort;
	readonly reportExport: ReportExportPort;
	readonly calculateSimulation: CalculateSimulationUseCase;
	readonly calculatePairMatrix: CalculatePairMatrixUseCase;
	readonly loadSettings: LoadSettingsUseCase;
	readonly saveSettings: SaveSettingsUseCase;
}

export interface AppContainer {
	readonly settingsRepository: SettingsRepositoryPort;
	readonly reportExport: ReportExportPort;
	readonly calculateSimulation: CalculateSimulationUseCase;
	readonly calculatePairMatrix: CalculatePairMatrixUseCase;
	readonly loadSettings: LoadSettingsUseCase;
	readonly saveSettings: SaveSettingsUseCase;
}

export const CONTAINER_CONTEXT_KEY = Symbol('APP_CONTAINER_CONTEXT');

let defaultContainerInstance: AppContainer | null = null;

export function createAppContainer(overrides?: Partial<AppDependencies>): AppContainer {
	const settingsRepository = overrides?.settingsRepository ?? new IndexedDBSettingsRepository();
	const reportExport = overrides?.reportExport ?? new PrintExportAdapter();

	const calculateSimulation = overrides?.calculateSimulation ?? new CalculateSimulationUseCase();
	const calculatePairMatrix = overrides?.calculatePairMatrix ?? new CalculatePairMatrixUseCase();
	const loadSettings = overrides?.loadSettings ?? new LoadSettingsUseCase(settingsRepository);
	const saveSettings = overrides?.saveSettings ?? new SaveSettingsUseCase(settingsRepository);

	return {
		settingsRepository,
		reportExport,
		calculateSimulation,
		calculatePairMatrix,
		loadSettings,
		saveSettings
	};
}

export function setContainerContext(container: AppContainer): void {
	setContext(CONTAINER_CONTEXT_KEY, container);
}

export function getContainerContext(): AppContainer {
	let container: AppContainer | undefined;
	try {
		container = getContext<AppContainer | undefined>(CONTAINER_CONTEXT_KEY);
	} catch {
		throw new Error(
			'AppContainer no está disponible en el contexto de Svelte. Asegúrate de llamar a setContainerContext en un componente superior.'
		);
	}

	if (!container) {
		throw new Error(
			'AppContainer no está disponible en el contexto de Svelte. Asegúrate de llamar a setContainerContext en un componente superior.'
		);
	}
	return container;
}

export function getAppContainer(): AppContainer {
	try {
		const contextContainer = getContext<AppContainer | undefined>(CONTAINER_CONTEXT_KEY);
		if (contextContainer) {
			return contextContainer;
		}
	} catch {
		// getContext solo puede ejecutarse durante la inicialización de componentes Svelte
	}

	if (!defaultContainerInstance) {
		defaultContainerInstance = createAppContainer();
	}
	return defaultContainerInstance;
}

export function createSimulatorState(container?: AppContainer): SimulatorState {
	const c = container ?? getAppContainer();
	return new SimulatorState(
		c.calculateSimulation,
		c.calculatePairMatrix,
		c.loadSettings,
		c.saveSettings,
		c.reportExport
	);
}

export function resetAppContainer(): void {
	defaultContainerInstance = null;
}
