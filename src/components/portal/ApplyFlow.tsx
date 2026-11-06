import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, FileText, ShieldCheck, X } from 'lucide-react';
import type { ApplicationRecord, ConsentRecord, FieldValue, FileMeta, PraveshConfig } from '../../config/types';
import type { ApplicationStore } from '../../services/storage';
import { newApplicationId } from '../../services/storage';
import { documentsFor, fieldsFor, validateFieldValue, validateUpload } from '../../services/formRules';
import { stageById } from '../../services/workflow';
import { formatBytes } from '../../services/util';
import { FileDrop, cx } from '../ui';
import { DynamicField } from './DynamicField';

const STEPS = ['Provider type', 'Business information', 'Documents', 'Review & consent'] as const;

export interface ApplyFlowProps {
  config: PraveshConfig;
  store: ApplicationStore;
  idPrefix: string;
  onSubmitted: (id: string) => void;
}

function displayValue(v: FieldValue | undefined): string {
  if (v === undefined || v === '') return '-';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '-';
  return v;
}

export function ApplyFlow({ config, store, idPrefix, onSubmitted }: ApplyFlowProps) {
  const [step, setStep] = useState(0);
  const [providerType, setProviderType] = useState(config.providerTypes.length === 1 ? config.providerTypes[0].id : '');
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [files, setFiles] = useState<Record<string, FileMeta>>({});
  const [documents, setDocuments] = useState<Record<string, FileMeta>>({});
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fields = useMemo(() => fieldsFor(config, providerType), [config, providerType]);
  const docs = useMemo(() => documentsFor(config, providerType), [config, providerType]);
  const { initialStage, submittedStage } = config.workflow;
  const submissionConsents = config.consents.filter((c) => c.stage === initialStage || c.stage === submittedStage);
  const providerName = config.providerTypes.find((p) => p.id === providerType)?.name;

  const validateStep = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 0 && !providerType) e.providerType = 'Choose the kind of provider you are applying as.';
    if (s === 1) {
      fields.forEach((f) => {
        const msg = validateFieldValue(f, values[f.id], files[f.id]);
        if (msg) e[f.id] = msg;
      });
    }
    if (s === 2) {
      docs.forEach((d) => {
        if (d.required && !documents[d.id]) e[`doc:${d.id}`] = `${d.name} is required.`;
      });
    }
    if (s === 3) {
      submissionConsents.forEach((c) => {
        if (c.required && !consents[c.id]) e[`consent:${c.id}`] = 'This consent is required to submit.';
      });
    }
    return e;
  };

  const next = () => {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length) {
      const firstKey = Object.keys(e)[0];
      window.setTimeout(() => {
        const el = document.getElementById(`${idPrefix}-${firstKey.replace(/^doc:|^consent:/, (m) => (m === 'doc:' ? 'doc-' : 'consent-'))}`);
        el?.focus();
      }, 0);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = () => {
    const e = { ...validateStep(0), ...validateStep(1), ...validateStep(2), ...validateStep(3) };
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    const now = new Date().toISOString();
    const orgField = fields.find((f) => f.type === 'text' && /name/i.test(f.label)) ?? fields.find((f) => f.type === 'text');
    const consentRecords: ConsentRecord[] = submissionConsents
      .filter((c) => consents[c.id])
      .map((c) => ({ consentId: c.id, title: c.title, version: c.version, stage: c.stage, grantedAt: now }));
    const record: ApplicationRecord = {
      id: newApplicationId(),
      configId: config.id,
      providerType,
      organisation: (orgField && typeof values[orgField.id] === 'string' ? (values[orgField.id] as string) : '') || `${providerName ?? 'Provider'} application`,
      values,
      files,
      documents,
      consents: consentRecords,
      stage: submittedStage,
      completedActions: {},
      history: [
        { from: null, to: initialStage, at: now, actor: 'applicant', note: 'Application started' },
        { from: initialStage, to: submittedStage, at: now, actor: 'applicant', note: 'Submitted by applicant' },
      ],
      createdAt: now,
      updatedAt: now,
    };
    store.save(record);
    setSubmitting(false);
    onSubmitted(record.id);
  };

  const errorCount = Object.keys(errors).length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      {/* Progress */}
      <nav aria-label="Application progress" className="lg:pt-1">
        <ol className="flex gap-1 relative overflow-x-auto lg:flex-col lg:gap-0">
          {STEPS.map((label, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li key={label} className="flex min-w-0 items-center gap-2.5 lg:py-2" aria-current={current ? 'step' : undefined}>
                <span
                  className={cx(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11.5px] font-semibold',
                    done && 'border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-fg)]',
                    current && 'border-[var(--brand)] text-[var(--brand-ink)]',
                    !done && !current && 'border-zinc-300 text-zinc-500',
                  )}
                >
                  {done ? <Check size={13} aria-hidden="true" /> : i + 1}
                </span>
                <span className={cx('whitespace-nowrap text-[13px]', current ? 'font-medium text-zinc-900' : 'text-zinc-500', !current && 'hidden sm:inline')}>{label}</span>
                {i < STEPS.length - 1 && <span className="mx-1 h-px w-4 bg-zinc-200 lg:hidden" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="min-w-0 rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <p className="text-[12px] font-medium text-zinc-500">
            Step {step + 1} of {STEPS.length}
            {providerName && step > 0 && <span> · Applying as {providerName}</span>}
          </p>
          <h2 className="mt-0.5 text-[17px] font-semibold tracking-tight text-zinc-900">{STEPS[step]}</h2>
        </div>

        <div className="px-5 py-5">
          {errorCount > 0 && (
            <div role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-800">
              {errorCount === 1 ? 'One item needs your attention.' : `${errorCount} items need your attention.`}
            </div>
          )}

          {step === 0 && (
            <fieldset>
              <legend className="mb-3 text-[13.5px] text-zinc-600">Which best describes your organisation?</legend>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {config.providerTypes.map((p) => {
                  const checked = providerType === p.id;
                  return (
                    <label
                      key={p.id}
                      className={cx(
                        'flex cursor-pointer gap-3 rounded-md border p-3.5 transition-colors',
                        checked ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-zinc-200 hover:border-zinc-300',
                      )}
                    >
                      <input
                        id={`${idPrefix}-providerType${p.id === config.providerTypes[0]?.id ? '' : `-${p.id}`}`}
                        type="radio"
                        name={`${idPrefix}-provider-type`}
                        checked={checked}
                        onChange={() => {
                          setProviderType(p.id);
                          setErrors({});
                        }}
                        className="mt-1 h-3.5 w-3.5 accent-[var(--brand)]"
                      />
                      <span>
                        <span className="block text-[14px] font-medium text-zinc-900">{p.name}</span>
                        <span className="mt-0.5 block text-[12.5px] leading-5 text-zinc-500">{p.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.providerType && <p className="mt-2 text-[12.5px] text-red-700">{errors.providerType}</p>}
            </fieldset>
          )}

          {step === 1 &&
            (fields.length === 0 ? (
              <p className="text-[13.5px] text-zinc-500">No business information is required for this provider type.</p>
            ) : (
              <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                {fields.map((f) => (
                  <DynamicField
                    key={f.id}
                    field={f}
                    idPrefix={idPrefix}
                    value={values[f.id]}
                    file={files[f.id]}
                    error={errors[f.id]}
                    onChange={(v) => {
                      setValues((s) => ({ ...s, [f.id]: v }));
                      if (errors[f.id]) setErrors(({ [f.id]: _drop, ...rest }) => rest);
                    }}
                    onFile={(meta) => {
                      setFiles(({ [f.id]: _old, ...rest }) => (meta ? { ...rest, [f.id]: meta } : rest));
                      if (errors[f.id]) setErrors(({ [f.id]: _drop, ...rest }) => rest);
                    }}
                  />
                ))}
              </div>
            ))}

          {step === 2 &&
            (docs.length === 0 ? (
              <p className="text-[13.5px] text-zinc-500">No documents are required for this provider type.</p>
            ) : (
              <ul className="divide-y divide-zinc-100 rounded-md border border-zinc-200">
                {docs.map((d) => {
                  const meta = documents[d.id];
                  const err = errors[`doc:${d.id}`];
                  return (
                    <li key={d.id} className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[minmax(0,1fr)_280px] md:items-center">
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-medium text-zinc-900">
                          {d.name}
                          {d.required ? <span className="ml-0.5 text-red-600" aria-hidden="true">*</span> : <span className="ml-2 text-[12px] font-normal text-zinc-500">Optional</span>}
                        </p>
                        <p className="text-[12.5px] text-zinc-500">{d.description}</p>
                        <p className="mt-1 font-mono text-[11px] uppercase text-zinc-400">
                          {d.acceptedTypes.join(' · ')} · max {d.maxSizeMB} MB
                        </p>
                        {err && <p className="mt-1 text-[12.5px] text-red-700">{err}</p>}
                      </div>
                      {meta ? (
                        <div className="flex items-center gap-2.5 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
                          <FileText size={15} className="shrink-0 text-zinc-500" aria-hidden="true" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12.5px] font-medium text-zinc-800">{meta.name}</p>
                            <p className="text-[11.5px] text-zinc-500">{formatBytes(meta.size)} · ready</p>
                          </div>
                          <button
                            type="button"
                            className="rounded p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
                            aria-label={`Remove ${meta.name}`}
                            onClick={() => setDocuments(({ [d.id]: _x, ...rest }) => rest)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <FileDrop
                          id={`${idPrefix}-doc-${d.id}`}
                          compact
                          label="Upload file"
                          invalid={!!err}
                          accept={d.acceptedTypes.map((t) => `.${t}${t === 'jpg' ? ',.jpeg' : ''}`).join(',')}
                          hint={`${d.acceptedTypes.map((t) => t.toUpperCase()).join(', ')} up to ${d.maxSizeMB} MB`}
                          onFile={(f) => {
                            const msg = validateUpload(d, f);
                            if (msg) {
                              setErrors((s) => ({ ...s, [`doc:${d.id}`]: msg }));
                              return;
                            }
                            setDocuments((s) => ({ ...s, [d.id]: { name: f.name, size: f.size, type: f.type } }));
                            setErrors(({ [`doc:${d.id}`]: _drop, ...rest }) => rest);
                          }}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            ))}

          {step === 3 && (
            <div className="space-y-6">
              <section aria-labelledby={`${idPrefix}-review-h`}>
                <h3 id={`${idPrefix}-review-h`} className="mb-2 text-[13px] font-semibold text-zinc-900">
                  Summary
                </h3>
                <dl className="grid grid-cols-1 gap-x-6 rounded-md border border-zinc-200 px-4 py-3 text-[13px] sm:grid-cols-2">
                  <div className="flex justify-between gap-4 border-b border-zinc-100 py-1.5 sm:col-span-2">
                    <dt className="text-zinc-500">Provider type</dt>
                    <dd className="text-right font-medium text-zinc-900">{providerName}</dd>
                  </div>
                  {fields.map((f) => (
                    <div key={f.id} className="flex justify-between gap-4 border-b border-zinc-100 py-1.5">
                      <dt className="text-zinc-500">{f.label}</dt>
                      <dd className="min-w-0 break-words text-right text-zinc-900">{f.type === 'file' ? files[f.id]?.name ?? '-' : displayValue(values[f.id])}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between gap-4 py-1.5 sm:col-span-2">
                    <dt className="text-zinc-500">Documents</dt>
                    <dd className="text-right text-zinc-900">
                      {Object.keys(documents).length} of {docs.length} uploaded
                    </dd>
                  </div>
                </dl>
              </section>

              <section aria-labelledby={`${idPrefix}-consent-h`}>
                <h3 id={`${idPrefix}-consent-h`} className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-zinc-900">
                  <ShieldCheck size={15} aria-hidden="true" /> Consents
                </h3>
                {submissionConsents.length === 0 ? (
                  <p className="text-[13px] text-zinc-500">No consents are collected at submission.</p>
                ) : (
                  <ul className="space-y-2">
                    {submissionConsents.map((c) => {
                      const err = errors[`consent:${c.id}`];
                      return (
                        <li key={c.id} className={cx('rounded-md border p-3', err ? 'border-red-300' : 'border-zinc-200')}>
                          <div className="flex items-start gap-2.5">
                            <input
                              id={`${idPrefix}-consent-${c.id}`}
                              type="checkbox"
                              checked={!!consents[c.id]}
                              onChange={(e) => {
                                setConsents((s) => ({ ...s, [c.id]: e.target.checked }));
                                setErrors(({ [`consent:${c.id}`]: _d, ...rest }) => rest);
                              }}
                              className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand)]"
                            />
                            <label htmlFor={`${idPrefix}-consent-${c.id}`} className="min-w-0 text-[13px]">
                              <span className="font-medium text-zinc-900">
                                {c.title}
                                {c.required ? <span className="ml-0.5 text-red-600" aria-hidden="true">*</span> : <span className="ml-1.5 font-normal text-zinc-500">Optional</span>}
                              </span>
                              <span className="mt-0.5 block text-zinc-600">{c.description}</span>
                              <span className="mt-1 block font-mono text-[11px] text-zinc-400">
                                Purpose: {c.purpose} · v{c.version}
                              </span>
                            </label>
                          </div>
                          {err && <p className="ml-6 mt-1 text-[12.5px] text-red-700">{err}</p>}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
              <p className="text-[12.5px] text-zinc-500">
                After submission your application moves to <strong className="font-medium text-zinc-700">{stageById(config.workflow, submittedStage)?.name ?? submittedStage}</strong>. You can track it any time
                from My applications.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-zinc-200 px-5 py-3">
          <button
            type="button"
            onClick={() => {
              setErrors({});
              setStep((s) => Math.max(0, s - 1));
            }}
            disabled={step === 0}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-[13.5px] font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-40"
          >
            <ArrowLeft size={15} aria-hidden="true" /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[var(--brand)] px-3.5 text-[13.5px] font-medium text-[var(--brand-fg)] hover:opacity-90">
              Continue <ArrowRight size={15} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[var(--brand)] px-3.5 text-[13.5px] font-medium text-[var(--brand-fg)] hover:opacity-90 disabled:opacity-60"
            >
              Submit application <Check size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
