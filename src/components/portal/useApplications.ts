import { useEffect, useState } from 'react';
import type { ApplicationRecord } from '../../config/types';
import type { ApplicationStore } from '../../services/storage';

/** Subscribes to an ApplicationStore and returns the records for a config. */
export function useApplications(store: ApplicationStore, configId: string): ApplicationRecord[] {
  const [apps, setApps] = useState(() => store.list(configId));
  useEffect(() => {
    setApps(store.list(configId));
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('pravesh:applications')) setApps(store.list(configId));
    };
    window.addEventListener('storage', onStorage);
    const unsub = store.subscribe(() => setApps(store.list(configId)));
    return () => {
      unsub();
      window.removeEventListener('storage', onStorage);
    };
  }, [store, configId]);
  return apps;
}
