import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import type { PraveshConfig } from './types';
import { createDefaultConfig } from './defaults';
import { clearStoredConfig, loadStoredConfig, saveStoredConfig } from '../services/storage';

type Section = Exclude<keyof PraveshConfig, '$schema' | 'schemaVersion'>;

type Action =
  | { type: 'replace'; config: PraveshConfig }
  | { type: 'set'; key: Section; value: PraveshConfig[Section] };

function reducer(state: PraveshConfig, action: Action): PraveshConfig {
  switch (action.type) {
    case 'replace':
      return action.config;
    case 'set':
      return { ...state, [action.key]: action.value };
    default:
      return state;
  }
}

export type SaveStatus = 'saved' | 'saving' | 'error';

interface ConfigContextValue {
  config: PraveshConfig;
  set: <K extends Section>(key: K, value: PraveshConfig[K]) => void;
  replace: (config: PraveshConfig) => void;
  reset: () => void;
  saveStatus: SaveStatus;
  savedAt: Date | null;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, dispatch] = useReducer(reducer, undefined, () => loadStoredConfig() ?? createDefaultConfig());
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const first = useRef(true);

  // Debounced autosave.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSaveStatus('saving');
    const t = window.setTimeout(() => {
      const ok = saveStoredConfig(config);
      setSaveStatus(ok ? 'saved' : 'error');
      if (ok) setSavedAt(new Date());
    }, 450);
    return () => window.clearTimeout(t);
  }, [config]);

  const set = useCallback(<K extends Section>(key: K, value: PraveshConfig[K]) => dispatch({ type: 'set', key, value }), []);
  const replace = useCallback((next: PraveshConfig) => dispatch({ type: 'replace', config: next }), []);
  const reset = useCallback(() => {
    clearStoredConfig();
    dispatch({ type: 'replace', config: createDefaultConfig() });
  }, []);

  const value = useMemo(() => ({ config, set, replace, reset, saveStatus, savedAt }), [config, set, replace, reset, saveStatus, savedAt]);
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used inside <ConfigProvider>');
  return ctx;
}
