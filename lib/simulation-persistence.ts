/**
 * Browser persistence for simulation state.
 * Saves to localStorage so the simulation continues after reload.
 */

const STORAGE_KEY = "transparenca24_simulation";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SAVE_DEBOUNCE_MS = 2000;

export interface PersistedSimulationState {
  version: number;
  savedAt: number;
  municipalities: Array<{ id: string; name: string; nameSq: string; region: string; budgetTotal: number; budgetRemaining: number }>;
  projects: unknown[];
  transactions: unknown[];
  contracts: unknown[];
  flaggedTransactionIds: string[];
  config: { speed: number; corruptionProbability: number; projectFrequency: number; selectedMunicipalityIds: string[] | "all" };
  counters: { project: number; bid: number; report: number; notification: number; transaction: number; contract: number };
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function getStored(): PersistedSimulationState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PersistedSimulationState;
    if (data.version !== 1 || !data.savedAt) return null;
    if (Date.now() - data.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function loadPersistedState(): PersistedSimulationState | null {
  return getStored();
}

export function savePersistedState(state: Omit<PersistedSimulationState, "version" | "savedAt">) {
  if (typeof window === "undefined") return;
  const payload: PersistedSimulationState = {
    ...state,
    version: 1,
    savedAt: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // quota or disabled
  }
}

export function savePersistedStateDebounced(
  state: Omit<PersistedSimulationState, "version" | "savedAt">
) {
  if (typeof window === "undefined") return;
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    savePersistedState(state);
  }, SAVE_DEBOUNCE_MS);
}

export function clearPersistedState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
}

export function hasPersistedState(): boolean {
  return getStored() != null;
}
