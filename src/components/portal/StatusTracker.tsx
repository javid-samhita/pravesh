import { Check, Clock, FileText, ShieldCheck } from 'lucide-react';
import type { ApplicationRecord, PraveshConfig } from '../../config/types';
import type { ApplicationStore } from '../../services/storage';
import { primaryPath, stageById } from '../../services/workflow';
import { documentsFor, fieldsFor } from '../../services/formRules';
import { formatBytes, formatDateTime } from '../../services/util';
import { cx } from '../ui';
import { StageBadge } from './StageBadge';

export interface StatusTrackerProps {
  config: PraveshConfig;
  app: ApplicationRecord;
  store: ApplicationStore;
  onNotify?: (message: string) => void;
}

/** Applicant-facing status page rendered from the configured workflow. */
export function StatusTracker({ config, app, store, onNotify }: StatusTrackerProps) {
  const { workflow } = config;
  const current = stageById(workflow, app.stage);
  const path = primaryPath(workflow);
  const visited = new Set(app.history.map((h) => h.to));
  const onPath = path.some((s) => s.id === app.stage);
  const currentIdx = path.findIndex((s) => s.id === app.stage);
  // Index of the furthest path stage the application has reached.
  const reachedIdx = path.reduce((acc, s, i) => (visited.has(s.id) ? i : acc), 0);
  const providerName = config.providerTypes.find((p) => p.id === app.providerType)?.name ?? app.providerType;
  const pendingConsents = config.consents.filter((c) => c.stage === app.stage && !app.consents.some((r) => r.consentId === c.id));
  const nextStages = (current?.transitions ?? []).map((t) => stageById(workflow, t)).filter(Boolean);

  const grant = (consentId: string) => {
    const c = config.consents.find((x) => x.id === consentId);
    if (!c) return;
    const now = new Date().toISOString();
    store.save({
      ...app,
      consents: [...app.consents, { consentId: c.id, title: c.title, version: c.version, stage: c.stage, grantedAt: now }],
      updatedAt: now,
    });
    onNotify?.(`Consent recorded: ${c.title}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[12px] text-zinc-500">{app.id}</p>
          <h2 className="mt-0.5 truncate text-[20px] font-semibold tracking-tight text-zinc-900">{app.organisation}</h2>
          <p className="text-[13px] text-zinc-500">
            {providerName} · submitted {formatDateTime(app.createdAt)}
          </p>
        </div>
        <StageBadge stage={current} fallback={app.stage} />
      </div>

      {/* Progress along the primary path */}
      <section aria-label="Progress" className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
        <ol className="flex flex-col gap-3 sm:flex-row sm:gap-0">
          {path.map((s, i) => {
            const done = onPath ? i < currentIdx : i <= reachedIdx;
            const isCurrent = s.id === app.stage;
            const terminalOutcome = current?.terminal && !onPath;
            return (
              <li key={s.id} className="flex items-center gap-2 sm:flex-1 sm:flex-col sm:items-start sm:gap-2" aria-current={isCurrent ? 'step' : undefined}>
                <div className="flex items-center sm:w-full">
                  <span
                    className={cx(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                      isCurrent && 'border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-fg)]',
                      done && !isCurrent && 'border-[var(--brand)] text-[var(--brand-ink)]',
                      !done && !isCurrent && 'border-zinc-300 text-zinc-400',
                      terminalOutcome && !done && 'opacity-50',
                    )}
                  >
                    {done && !isCurrent ? <Check size={12} aria-hidden="true" /> : i + 1}
                  </span>
                  {i < path.length - 1 && <span className={cx('mx-2 hidden h-px flex-1 sm:block', done ? 'bg-[var(--brand)]' : 'bg-zinc-200')} aria-hidden="true" />}
                </div>
                <span className={cx('text-[12.5px] sm:pr-3', isCurrent ? 'font-semibold text-zinc-900' : done ? 'text-zinc-700' : 'text-zinc-400')}>{s.name}</span>
              </li>
            );
          })}
        </ol>
        {!onPath && current && (
          <div className={cx('mt-4 rounded-md border px-3 py-2 text-[13px]', current.tone === 'danger' ? 'border-red-200 bg-red-50 text-red-900' : current.tone === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-zinc-200 bg-zinc-50 text-zinc-800')}>
            <span className="font-medium">{current.name}.</span> {current.description}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="rounded-lg border border-zinc-200 bg-white">
            <h3 className="border-b border-zinc-200 px-4 py-3 text-[13.5px] font-semibold">Current status</h3>
            <div className="space-y-3 px-4 py-4 text-[13.5px]">
              <p className="text-zinc-700">{current?.description}</p>
              {current?.terminal ? (
                <p className="text-zinc-500">This is a final status. No further changes are expected.</p>
              ) : (
                nextStages.length > 0 && (
                  <p className="text-zinc-500">
                    Next possible: {nextStages.map((s) => s!.name).join(', ')}.
                  </p>
                )
              )}
            </div>
          </section>

          {pendingConsents.length > 0 && (
            <section className="rounded-lg border border-amber-200 bg-amber-50/50">
              <h3 className="flex items-center gap-1.5 border-b border-amber-200 px-4 py-3 text-[13.5px] font-semibold text-amber-950">
                <ShieldCheck size={15} aria-hidden="true" /> Action needed: consent for this stage
              </h3>
              <ul className="divide-y divide-amber-200">
                {pendingConsents.map((c) => (
                  <li key={c.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 text-[13px]">
                      <p className="font-medium text-zinc-900">{c.title}</p>
                      <p className="text-zinc-700">{c.description}</p>
                      <p className="mt-1 font-mono text-[11px] text-zinc-500">
                        {c.purpose} · v{c.version} · {c.required ? 'required' : 'optional'}
                      </p>
                    </div>
                    <button type="button" onClick={() => grant(c.id)} className="h-8 shrink-0 rounded-md bg-[var(--brand)] px-3 text-[13px] font-medium text-[var(--brand-fg)] hover:opacity-90">
                      I agree
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-lg border border-zinc-200 bg-white">
            <h3 className="border-b border-zinc-200 px-4 py-3 text-[13.5px] font-semibold">Submitted information</h3>
            <dl className="grid grid-cols-1 gap-x-6 px-4 py-2 text-[13px] sm:grid-cols-2">
              {fieldsFor(config, app.providerType).map((f) => {
                const v = app.values[f.id];
                const shown = f.type === 'file' ? app.files[f.id]?.name : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : Array.isArray(v) ? v.join(', ') : v;
                return (
                  <div key={f.id} className="flex justify-between gap-4 border-b border-zinc-100 py-1.5 last:border-0">
                    <dt className="text-zinc-500">{f.label}</dt>
                    <dd className="min-w-0 break-words text-right text-zinc-900">{shown || '-'}</dd>
                  </div>
                );
              })}
            </dl>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-lg border border-zinc-200 bg-white">
            <h3 className="border-b border-zinc-200 px-4 py-3 text-[13.5px] font-semibold">Activity</h3>
            <ol className="px-4 py-3">
              {[...app.history].reverse().map((h, i) => (
                <li key={`${h.at}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
                  <span className="relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                  </span>
                  {i < app.history.length - 1 && <span className="absolute left-[7.5px] top-5 h-[calc(100%-12px)] w-px bg-zinc-200" aria-hidden="true" />}
                  <div className="min-w-0 text-[13px]">
                    <p className="text-zinc-900">
                      {stageById(workflow, h.to)?.name ?? h.to}
                      <span className="ml-1.5 text-[12px] text-zinc-500">by {h.actor}</span>
                    </p>
                    {h.note && <p className="text-zinc-600">{h.note}</p>}
                    <p className="flex items-center gap-1 text-[11.5px] text-zinc-400">
                      <Clock size={11} aria-hidden="true" /> {formatDateTime(h.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white">
            <h3 className="border-b border-zinc-200 px-4 py-3 text-[13.5px] font-semibold">Documents</h3>
            <ul className="divide-y divide-zinc-100">
              {documentsFor(config, app.providerType).map((d) => {
                const meta = app.documents[d.id];
                return (
                  <li key={d.id} className="flex items-center gap-2.5 px-4 py-2 text-[13px]">
                    <FileText size={14} className="shrink-0 text-zinc-400" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-zinc-800">{d.name}</span>
                    <span className="shrink-0 text-[12px] text-zinc-500">{meta ? formatBytes(meta.size) : 'Not provided'}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          {app.consents.length > 0 && (
            <section className="rounded-lg border border-zinc-200 bg-white">
              <h3 className="border-b border-zinc-200 px-4 py-3 text-[13.5px] font-semibold">Consent record</h3>
              <ul className="divide-y divide-zinc-100">
                {app.consents.map((c) => (
                  <li key={c.consentId} className="px-4 py-2 text-[12.5px]">
                    <p className="text-zinc-800">{c.title}</p>
                    <p className="font-mono text-[11px] text-zinc-500">
                      v{c.version} · {formatDateTime(c.grantedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
