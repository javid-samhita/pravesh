import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { localApplicationStore } from '../../services/storage';
import { PortalRuntime } from './PortalRuntime';
import type { PortalView } from './types';
import { usePortalConfig } from './usePortalConfig';

export function viewToPath(view: PortalView): string {
  switch (view.name) {
    case 'apply':
      return '/portal';
    case 'applications':
      return '/portal/applications';
    case 'application':
      return `/portal/applications/${encodeURIComponent(view.id)}`;
    case 'admin':
      return view.id ? `/portal/admin/${encodeURIComponent(view.id)}` : '/portal/admin';
  }
}

/** Route-level wrapper: loads the config and maps portal views onto URLs. */
export function PortalPage({ view }: { view: PortalView }) {
  const state = usePortalConfig();
  const navigate = useNavigate();
  const name = state.status === 'ready' ? state.config.identity.name : 'Portal';

  useEffect(() => {
    document.title = `${view.name === 'admin' ? 'Review queue' : 'Apply'} · ${name}`;
  }, [name, view.name]);

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-[13px] text-zinc-500">
        <Loader2 size={16} className="mr-2 animate-spin" aria-hidden="true" /> Loading configuration…
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="mx-auto max-w-lg px-4 py-24" role="alert">
        <h1 className="text-[18px] font-semibold">Portal configuration error</h1>
        <p className="mt-2 font-mono text-[12.5px] text-red-700">{state.message}</p>
      </div>
    );
  }
  return (
    <>
      {state.source === 'local' && (
        <div className="flex items-center justify-between gap-3 bg-zinc-950 px-4 py-1.5 text-[12px] text-zinc-400">
          <Link to="/wizard/preview" className="inline-flex items-center gap-1.5 hover:text-white">
            <ArrowLeft size={12} aria-hidden="true" /> Back to configurator
          </Link>
          <span className="hidden truncate sm:inline">
            Rendering <span className="font-mono text-zinc-300">{state.config.id}</span> from your working configuration
          </span>
        </div>
      )}
      <PortalRuntime config={state.config} store={localApplicationStore} view={view} onNavigate={(v) => navigate(viewToPath(v))} />
    </>
  );
}
