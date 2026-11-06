import { useEffect, useState } from 'react';
import type { PraveshConfig } from '../../config/types';
import { useConfig } from '../../config/ConfigContext';
import { validateConfig } from '../../services/validation';

export type PortalConfigState =
  | { status: 'ready'; config: PraveshConfig; source: 'local' | 'remote' }
  | { status: 'loading' }
  | { status: 'error'; message: string };

/**
 * Production deployments set VITE_PRAVESH_CONFIG_URL to a JSON file (for
 * example `./pravesh.config.json` in `public/`). Without it, the portal uses
 * the configuration being edited in this browser.
 */
export function usePortalConfig(): PortalConfigState {
  const { config } = useConfig();
  const url = import.meta.env.VITE_PRAVESH_CONFIG_URL;
  const [remote, setRemote] = useState<PortalConfigState>({ status: 'loading' });

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    fetch(url, { cache: 'no-cache' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<unknown>;
      })
      .then((data) => {
        if (cancelled) return;
        const result = validateConfig(data);
        if (!result.valid) {
          setRemote({ status: 'error', message: `${url} failed validation: ${result.errors[0]?.path} ${result.errors[0]?.message}` });
          return;
        }
        setRemote({ status: 'ready', config: data as PraveshConfig, source: 'remote' });
      })
      .catch((e: unknown) => {
        if (!cancelled) setRemote({ status: 'error', message: `Could not load ${url}: ${e instanceof Error ? e.message : String(e)}` });
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!url) return { status: 'ready', config, source: 'local' };
  return remote;
}
