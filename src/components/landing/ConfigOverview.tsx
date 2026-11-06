import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EXAMPLES } from '../../data/examples';
import { CodeBlock, cx } from '../ui';
import { Section } from './Section';

const cfg = EXAMPLES[2].config;
const TABS = [
  { key: 'providerTypes', label: 'providerTypes', note: 'Who can apply.', value: cfg.providerTypes.slice(0, 2) },
  { key: 'fields', label: 'fields', note: 'Rendered in order; empty providerTypes means everyone.', value: cfg.fields.filter((f) => ['cin', 'nbfc_layer'].includes(f.id)) },
  { key: 'documents', label: 'documents', note: 'Formats and size limits are enforced at upload.', value: cfg.documents.slice(1, 2) },
  { key: 'workflow', label: 'workflow', note: 'Stages, transitions and reviewer checklists.', value: { initialStage: cfg.workflow.initialStage, submittedStage: cfg.workflow.submittedStage, stages: cfg.workflow.stages.slice(2, 3) } },
  { key: 'technical', label: 'technical', note: 'Secrets are referenced by name only.', value: { webhooks: cfg.technical.webhooks.slice(0, 1), envVars: cfg.technical.envVars.slice(1, 2) } },
] as const;

const KEYS = [
  ['identity', 'Name, logo, brand colours, support contacts'],
  ['providerTypes', 'Categories of applicant'],
  ['fields', 'Business information form'],
  ['documents', 'Required uploads'],
  ['workflow', 'Review stages and transitions'],
  ['consents', 'Versioned consent capture'],
  ['technical', 'API, webhooks, integrations, env vars'],
];

export function ConfigOverview() {
  const [tab, setTab] = useState<string>('fields');
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];
  return (
    <Section
      id="configuration"
      eyebrow="Configuration"
      title="One file describes the whole portal"
      intro={
        <>
          Snippets below are taken verbatim from <code className="font-mono text-[13px] text-zinc-800">examples/lending-partner-network.json</code>. Every key is documented in the{' '}
          <Link to="/docs/configuration" className="text-teal-700 underline underline-offset-2">
            configuration reference
          </Link>
          .
        </>
      }
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <dl className="divide-y divide-zinc-200 border-y border-zinc-200 self-start">
          {KEYS.map(([k, d]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="font-mono text-[12.5px] text-zinc-900">{k}</dt>
              <dd className="text-right text-[12.5px] text-zinc-500">{d}</dd>
            </div>
          ))}
        </dl>
        <div className="min-w-0">
          <div role="tablist" aria-label="Configuration sections" className="mb-3 flex gap-1 relative overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                id={`cfg-tab-${t.key}`}
                aria-selected={tab === t.key}
                aria-controls="cfg-panel"
                onClick={() => setTab(t.key)}
                className={cx('shrink-0 rounded-md px-2.5 py-1 font-mono text-[12px] transition-colors', tab === t.key ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100')}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div id="cfg-panel" role="tabpanel" aria-labelledby={`cfg-tab-${active.key}`}>
            <p className="mb-2 text-[13px] text-zinc-500">{active.note}</p>
            <CodeBlock code={JSON.stringify({ [active.key]: active.value }, null, 2)} title={`lending-partner-network.json › ${active.key}`} maxHeight={380} />
          </div>
        </div>
      </div>
    </Section>
  );
}
