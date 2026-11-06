import { useMemo, useState } from 'react';
import { ArrowRight, Inbox, Search } from 'lucide-react';
import type { ApplicationRecord, PraveshConfig } from '../../config/types';
import type { ApplicationStore } from '../../services/storage';
import { outstandingActions, stageById } from '../../services/workflow';
import { formatDateTime } from '../../services/util';
import { Input, Textarea, cx } from '../ui';
import { StageBadge } from './StageBadge';

export interface AdminConsoleProps {
  config: PraveshConfig;
  apps: ApplicationRecord[];
  store: ApplicationStore;
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
  onNotify: (message: string) => void;
  idPrefix: string;
}

/**
 * Minimal reviewer console. Moves applications only along transitions that
 * the workflow configuration allows, and enforces each stage's required
 * actions before a non-negative transition.
 */
export function AdminConsole({ config, apps, store, selectedId, onSelect, onNotify, idPrefix }: AdminConsoleProps) {
  const [query, setQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const { workflow } = config;

  const filtered = useMemo(
    () =>
      apps.filter((a) => {
        if (stageFilter && a.stage !== stageFilter) return false;
        const q = query.trim().toLowerCase();
        return !q || a.id.toLowerCase().includes(q) || a.organisation.toLowerCase().includes(q);
      }),
    [apps, query, stageFilter],
  );
  const selected = apps.find((a) => a.id === selectedId);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    apps.forEach((a) => m.set(a.stage, (m.get(a.stage) ?? 0) + 1));
    return m;
  }, [apps]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Applications by stage">
        <button
          type="button"
          onClick={() => setStageFilter('')}
          aria-pressed={stageFilter === ''}
          className={cx('rounded-md border px-2.5 py-1 text-[12.5px]', stageFilter === '' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300')}
        >
          All <span className="ml-1 font-mono opacity-70">{apps.length}</span>
        </button>
        {workflow.stages
          .filter((s) => s.id !== workflow.initialStage)
          .map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStageFilter(s.id)}
              aria-pressed={stageFilter === s.id}
              className={cx('rounded-md border px-2.5 py-1 text-[12.5px]', stageFilter === s.id ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300')}
            >
              {s.name} <span className="ml-1 font-mono opacity-70">{counts.get(s.id) ?? 0}</span>
            </button>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 self-start rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-200 p-3">
            <div className="relative flex-1">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <label htmlFor={`${idPrefix}-admin-search`} className="sr-only">
                Search applications
              </label>
              <Input id={`${idPrefix}-admin-search`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by ID or organisation" className="pl-8" />
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <Inbox size={20} className="mb-2 text-zinc-400" aria-hidden="true" />
              <p className="text-[13.5px] font-medium text-zinc-900">{apps.length === 0 ? 'No applications yet' : 'No applications match'}</p>
              <p className="mt-1 text-[13px] text-zinc-500">{apps.length === 0 ? 'Submitted applications will appear here for review.' : 'Try a different search or stage.'}</p>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-200 text-[12px] text-zinc-500">
                    <th scope="col" className="px-3 py-2 font-medium">Application</th>
                    <th scope="col" className="px-3 py-2 font-medium">Provider type</th>
                    <th scope="col" className="px-3 py-2 font-medium">Stage</th>
                    <th scope="col" className="px-3 py-2 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className={cx('border-b border-zinc-100 last:border-0', a.id === selectedId ? 'bg-zinc-50' : 'hover:bg-zinc-50/60')}>
                      <td className="px-3 py-2.5">
                        <button type="button" onClick={() => onSelect(a.id)} className="text-left">
                          <span className="block font-medium text-zinc-900 hover:underline">{a.organisation}</span>
                          <span className="font-mono text-[11.5px] text-zinc-500">{a.id}</span>
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-zinc-700">{config.providerTypes.find((p) => p.id === a.providerType)?.name ?? a.providerType}</td>
                      <td className="px-3 py-2.5">
                        <StageBadge stage={stageById(workflow, a.stage)} fallback={a.stage} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-zinc-500">{formatDateTime(a.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected ? (
          <ReviewPanel key={selected.id} config={config} app={selected} store={store} onNotify={onNotify} onClose={() => onSelect(undefined)} idPrefix={idPrefix} />
        ) : (
          <div className="hidden rounded-lg border border-dashed border-zinc-300 p-6 text-center text-[13px] text-zinc-500 xl:block">Select an application to review it.</div>
        )}
      </div>
    </div>
  );
}

function ReviewPanel({
  config,
  app,
  store,
  onNotify,
  onClose,
  idPrefix,
}: {
  config: PraveshConfig;
  app: ApplicationRecord;
  store: ApplicationStore;
  onNotify: (m: string) => void;
  onClose: () => void;
  idPrefix: string;
}) {
  const { workflow } = config;
  const stage = stageById(workflow, app.stage);
  const [note, setNote] = useState('');
  const outstanding = outstandingActions(workflow, app);
  const done = app.completedActions[app.stage] ?? [];
  const missingConsents = config.consents.filter((c) => c.required && c.stage === app.stage && !app.consents.some((r) => r.consentId === c.id));

  const toggleAction = (action: string) => {
    const list = done.includes(action) ? done.filter((a) => a !== action) : [...done, action];
    store.save({ ...app, completedActions: { ...app.completedActions, [app.stage]: list }, updatedAt: new Date().toISOString() });
  };

  const move = (to: string) => {
    const target = stageById(workflow, to);
    if (!target || !stage?.transitions.includes(to)) return;
    const now = new Date().toISOString();
    store.save({
      ...app,
      stage: to,
      updatedAt: now,
      history: [...app.history, { from: app.stage, to, at: now, actor: 'reviewer', note: note.trim() || undefined }],
    });
    setNote('');
    onNotify(`${app.id} moved to ${target.name}`);
  };

  return (
    <aside aria-label={`Review ${app.id}`} className="rounded-lg border border-zinc-200 bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <div className="min-w-0">
          <p className="font-mono text-[11.5px] text-zinc-500">{app.id}</p>
          <h3 className="truncate text-[14.5px] font-semibold text-zinc-900">{app.organisation}</h3>
        </div>
        <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-[12.5px] text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">
          Close
        </button>
      </div>
      <div className="space-y-5 px-4 py-4">
        <div>
          <p className="mb-1 text-[12px] font-medium text-zinc-500">Current stage</p>
          <StageBadge stage={stage} fallback={app.stage} />
          {stage?.description && <p className="mt-1.5 text-[12.5px] text-zinc-600">{stage.description}</p>}
        </div>

        {stage && stage.requiredActions.length > 0 && (
          <fieldset>
            <legend className="mb-1.5 text-[12px] font-medium text-zinc-500">
              Required actions · {stage.requiredActions.length - outstanding.length}/{stage.requiredActions.length}
            </legend>
            <ul className="space-y-1.5">
              {stage.requiredActions.map((a, i) => (
                <li key={a} className="flex items-start gap-2">
                  <input id={`${idPrefix}-act-${i}`} type="checkbox" checked={done.includes(a)} onChange={() => toggleAction(a)} className="mt-1 h-3.5 w-3.5 accent-teal-700" />
                  <label htmlFor={`${idPrefix}-act-${i}`} className={cx('text-[13px]', done.includes(a) ? 'text-zinc-500 line-through' : 'text-zinc-800')}>
                    {a}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        )}

        {missingConsents.length > 0 && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-900">
            Waiting for applicant consent: {missingConsents.map((c) => c.title).join(', ')}.
          </p>
        )}

        {stage?.terminal ? (
          <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-[12.5px] text-zinc-600">This application is in a terminal stage.</p>
        ) : (
          <div>
            <label htmlFor={`${idPrefix}-note`} className="mb-1 block text-[12px] font-medium text-zinc-500">
              Note to applicant (optional)
            </label>
            <Textarea id={`${idPrefix}-note`} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Shown in the applicant's activity log" />
            <p className="mb-1.5 mt-3 text-[12px] font-medium text-zinc-500">Move to</p>
            <div className="flex flex-col gap-1.5">
              {stage?.transitions.map((t) => {
                const target = stageById(workflow, t);
                if (!target) return null;
                const negative = target.tone === 'danger' || target.tone === 'neutral';
                const blocked = !negative && (outstanding.length > 0 || missingConsents.length > 0);
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={blocked}
                    onClick={() => move(t)}
                    title={blocked ? 'Complete the required actions first' : undefined}
                    className={cx(
                      'flex h-9 items-center justify-between rounded-md border px-3 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45',
                      target.tone === 'danger' ? 'border-red-200 text-red-700 hover:bg-red-50' : 'border-zinc-200 text-zinc-800 hover:bg-zinc-50',
                    )}
                  >
                    {target.name}
                    <ArrowRight size={14} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
            {outstanding.length > 0 && <p className="mt-2 text-[12px] text-zinc-500">Complete the required actions to unlock forward transitions.</p>}
          </div>
        )}

        <div>
          <p className="mb-1.5 text-[12px] font-medium text-zinc-500">History</p>
          <ol className="space-y-1 text-[12.5px]">
            {[...app.history].reverse().map((h, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span className="text-zinc-800">
                  {stageById(workflow, h.to)?.name ?? h.to} <span className="text-zinc-500">· {h.actor}</span>
                </span>
                <span className="shrink-0 text-zinc-500">{formatDateTime(h.at)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </aside>
  );
}
