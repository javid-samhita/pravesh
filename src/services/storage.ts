/**
 * Local persistence.
 *
 * Pravesh ships as a static frontend, so both the working configuration and
 * portal submissions are stored in `localStorage`. The `ApplicationStore`
 * interface is the seam where a real backend adapter (REST, GraphQL, etc.)
 * plugs in: implement `list` and `save` against your API and pass it to the
 * portal runtime instead of `localApplicationStore`.
 */
import type { ApplicationRecord, PraveshConfig } from '../config/types';
import { validateConfig } from './validation';

const CONFIG_KEY = 'pravesh:config:v1';
const APPS_KEY = 'pravesh:applications:v1';

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function loadStoredConfig(): PraveshConfig | null {
  const raw = safeGet(CONFIG_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    // Structural validity is enough to resume editing; semantic errors are
    // surfaced in the wizard itself.
    const result = validateConfig(parsed);
    const structural = result.errors.every((e) => !/must be|is required/.test(e.message));
    return structural ? (parsed as PraveshConfig) : null;
  } catch {
    return null;
  }
}

export function saveStoredConfig(config: PraveshConfig): boolean {
  return safeSet(CONFIG_KEY, JSON.stringify(config));
}

export function clearStoredConfig() {
  try {
    window.localStorage.removeItem(CONFIG_KEY);
  } catch {
    /* storage unavailable */
  }
}

/* ------------------------------------------------------------------ */

export interface ApplicationStore {
  list(configId: string): ApplicationRecord[];
  save(record: ApplicationRecord): void;
  remove(id: string): void;
  subscribe(listener: () => void): () => void;
}

type Listener = () => void;

function createListeners() {
  const listeners = new Set<Listener>();
  return {
    emit: () => listeners.forEach((l) => l()),
    subscribe: (l: Listener) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}

function readAll(): ApplicationRecord[] {
  const raw = safeGet(APPS_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ApplicationRecord[]) : [];
  } catch {
    return [];
  }
}

const localListeners = createListeners();

/** Persists portal submissions in localStorage, scoped by config id. */
export const localApplicationStore: ApplicationStore = {
  list: (configId) =>
    readAll()
      .filter((a) => a.configId === configId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  save: (record) => {
    const all = readAll().filter((a) => a.id !== record.id);
    all.push(record);
    safeSet(APPS_KEY, JSON.stringify(all));
    localListeners.emit();
  },
  remove: (id) => {
    safeSet(APPS_KEY, JSON.stringify(readAll().filter((a) => a.id !== id)));
    localListeners.emit();
  },
  subscribe: localListeners.subscribe,
};

/** In-memory store used by the wizard preview so test submissions never leak. */
export function createMemoryApplicationStore(): ApplicationStore {
  let records: ApplicationRecord[] = [];
  const l = createListeners();
  return {
    list: (configId) => records.filter((a) => a.configId === configId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    save: (record) => {
      records = [...records.filter((a) => a.id !== record.id), record];
      l.emit();
    },
    remove: (id) => {
      records = records.filter((a) => a.id !== id);
      l.emit();
    },
    subscribe: l.subscribe,
  };
}

export function newApplicationId(): string {
  const year = new Date().getFullYear();
  const n = Math.floor(Math.random() * 90000) + 10000;
  return `APP-${year}-${n}`;
}
