import { useCallback, useMemo, type CSSProperties } from 'react';
import { ClipboardList, ExternalLink, FilePlus2, Inbox, LifeBuoy } from 'lucide-react';
import type { PraveshConfig } from '../../config/types';
import type { ApplicationStore } from '../../services/storage';
import { stageById } from '../../services/workflow';
import { contrastRatio, formatDate, readableOn } from '../../services/util';
import { cx, useToast } from '../ui';
import { ApplyFlow } from './ApplyFlow';
import { StatusTracker } from './StatusTracker';
import { AdminConsole } from './AdminConsole';
import { BrandMark } from './BrandMark';
import { StageBadge } from './StageBadge';
import { useApplications } from './useApplications';
import type { PortalView } from './types';

export interface PortalRuntimeProps {
  config: PraveshConfig;
  store: ApplicationStore;
  view: PortalView;
  onNavigate: (view: PortalView) => void;
  /** Embedded inside the wizard preview: tighter chrome, unique DOM ids. */
  embedded?: boolean;
}

/**
 * The generated onboarding portal. Everything rendered here comes from the
 * configuration object: nothing about specific provider types, fields,
 * documents or stages is hard-coded.
 */
export function PortalRuntime({ config, store, view, onNavigate, embedded }: PortalRuntimeProps) {
  const { identity } = config;
  const apps = useApplications(store, config.id);
  const { notify } = useToast();
  const idPrefix = embedded ? 'pv' : 'pt';

  const style = useMemo(() => {
    const primary = identity.colors.primary;
    const ink = contrastRatio(primary, '#FFFFFF') >= 3 ? primary : '#18181B';
    return {
      '--brand': primary,
      '--brand-fg': readableOn(primary),
      '--brand-ink': ink,
      '--brand-soft': `${primary}12`,
      '--brand-accent': identity.colors.accent,
    } as CSSProperties;
  }, [identity.colors.primary, identity.colors.accent]);

  const say = useCallback((m: string) => notify(m), [notify]);
  const nav: { key: PortalView['name']; label: string; icon: typeof Inbox; to: PortalView }[] = [
    { key: 'apply', label: 'Apply', icon: FilePlus2, to: { name: 'apply' } },
    { key: 'applications', label: 'My applications', icon: ClipboardList, to: { name: 'applications' } },
    { key: 'admin', label: 'Reviewer', icon: Inbox, to: { name: 'admin' } },
  ];
  const active = view.name === 'application' ? 'applications' : view.name;
  const current = view.name === 'application' ? apps.find((a) => a.id === view.id) : undefined;

  return (
    <div style={style} className={cx('flex flex-col bg-zinc-50', embedded ? 'min-h-[640px]' : 'min-h-screen')}>
      <header className="border-b border-zinc-200 bg-white">
        <div className="h-1 w-full" style={{ background: identity.colors.primary }} aria-hidden="true" />
        <div className={cx('mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-3 px-4 py-3', !embedded && 'sm:px-6')}>
          <div className="flex min-w-0 items-center gap-2.5">
            <BrandMark identity={identity} size={32} />
            <div className="min-w-0">
              <p className="truncate text-[14.5px] font-semibold leading-5 text-zinc-900">{identity.name || 'Untitled portal'}</p>
              {identity.tagline && <p className="hidden truncate text-[12px] leading-4 text-zinc-500 sm:block">{identity.tagline}</p>}
            </div>
          </div>
          <nav aria-label="Portal" className="-mx-1 flex w-full gap-1 relative overflow-x-auto sm:mx-0 sm:w-auto">
            {nav.map((n) => (
              <button
                key={n.key}
                type="button"
                onClick={() => onNavigate(n.to)}
                aria-current={active === n.key ? 'page' : undefined}
                className={cx(
                  'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors',
                  active === n.key ? 'bg-[var(--brand-soft)] text-[var(--brand-ink)]' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
                )}
              >
                <n.icon size={14} aria-hidden="true" />
                {n.label}
                {n.key === 'applications' && apps.length > 0 && <span className="rounded bg-zinc-200 px-1 font-mono text-[10.5px] text-zinc-700">{apps.length}</span>}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className={cx('mx-auto w-full max-w-[1120px] flex-1 px-4 py-6', !embedded && 'sm:px-6 sm:py-8')}>
        {view.name === 'apply' && (
          <>
            <div className="mb-6 max-w-2xl">
              <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900 sm:text-[26px]">Provider application</h1>
              <p className="mt-1 text-[14px] text-zinc-600">{identity.description}</p>
            </div>
            {config.providerTypes.length === 0 ? (
              <p className="rounded-lg border border-zinc-200 bg-white p-6 text-[13.5px] text-zinc-500">This portal has no provider types configured yet.</p>
            ) : (
              <ApplyFlow
                key={config.id + config.providerTypes.map((p) => p.id).join()}
                config={config}
                store={store}
                idPrefix={idPrefix}
                onSubmitted={(id) => {
                  notify('Application submitted', { body: `Reference ${id}` });
                  onNavigate({ name: 'application', id });
                }}
              />
            )}
          </>
        )}

        {view.name === 'applications' && (
          <>
            <h1 className="mb-4 text-[22px] font-semibold tracking-tight text-zinc-900">My applications</h1>
            {apps.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 bg-white px-6 py-12 text-center">
                <p className="text-[14px] font-medium text-zinc-900">No applications yet</p>
                <p className="mt-1 text-[13px] text-zinc-500">Start an application to see its status here.</p>
                <button type="button" onClick={() => onNavigate({ name: 'apply' })} className="mt-4 h-9 rounded-md bg-[var(--brand)] px-3.5 text-[13.5px] font-medium text-[var(--brand-fg)]">
                  Start an application
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 bg-white">
                {apps.map((a) => (
                  <li key={a.id}>
                    <button type="button" onClick={() => onNavigate({ name: 'application', id: a.id })} className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left hover:bg-zinc-50">
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-medium text-zinc-900">{a.organisation}</span>
                        <span className="font-mono text-[11.5px] text-zinc-500">
                          {a.id} · {config.providerTypes.find((p) => p.id === a.providerType)?.name} · {formatDate(a.createdAt)}
                        </span>
                      </span>
                      <StageBadge stage={stageById(config.workflow, a.stage)} fallback={a.stage} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {view.name === 'application' &&
          (current ? (
            <StatusTracker config={config} app={current} store={store} onNotify={say} />
          ) : (
            <div className="rounded-lg border border-zinc-200 bg-white px-6 py-12 text-center">
              <p className="text-[14px] font-medium text-zinc-900">Application not found</p>
              <p className="mt-1 text-[13px] text-zinc-500">It may belong to a different configuration.</p>
              <button type="button" onClick={() => onNavigate({ name: 'applications' })} className="mt-4 h-9 rounded-md border border-zinc-200 bg-white px-3.5 text-[13.5px] font-medium">
                Back to my applications
              </button>
            </div>
          ))}

        {view.name === 'admin' && (
          <>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h1 className="text-[22px] font-semibold tracking-tight text-zinc-900">Review queue</h1>
                <p className="text-[13px] text-zinc-500">Move applications through the transitions defined in your workflow.</p>
              </div>
            </div>
            <AdminConsole config={config} apps={apps} store={store} selectedId={view.id} onSelect={(id) => onNavigate({ name: 'admin', id })} onNotify={say} idPrefix={idPrefix} />
          </>
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-2 px-4 py-3 text-[12px] text-zinc-500 sm:px-6">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {identity.supportEmail && (
              <a className="inline-flex items-center gap-1 hover:text-zinc-900" href={`mailto:${identity.supportEmail}`}>
                <LifeBuoy size={12} aria-hidden="true" /> {identity.supportEmail}
              </a>
            )}
            {identity.website && (
              <a className="inline-flex items-center gap-1 hover:text-zinc-900" href={identity.website} target="_blank" rel="noreferrer">
                <ExternalLink size={12} aria-hidden="true" /> {identity.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </span>
          <span>Powered by Pravesh</span>
        </div>
      </footer>
    </div>
  );
}
