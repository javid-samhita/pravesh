import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useConfig } from '../../config/ConfigContext';
import { EXAMPLES, cloneConfig } from '../../data/examples';
import { primaryPath, TONE_CLASSES } from '../../services/workflow';
import { cx, useToast } from '../ui';
import { Section } from './Section';

export function Workflows() {
  const { replace } = useConfig();
  const { notify } = useToast();
  const navigate = useNavigate();
  return (
    <Section
      id="workflows"
      eyebrow="Supported workflows"
      title="Social sector, employment and lending, out of the box"
      intro="Each example is a complete configuration. The pipelines below are rendered from the files themselves, so what you see is what the portal enforces."
    >
      <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200">
        {EXAMPLES.map((ex) => {
          const c = ex.config;
          const path = primaryPath(c.workflow);
          const detours = c.workflow.stages.filter((s) => !path.some((p) => p.id === s.id));
          return (
            <article key={ex.id} className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[260px_minmax(0,1fr)_auto] lg:items-center">
              <div>
                <h3 className="text-[15px] font-semibold text-zinc-900">{ex.title}</h3>
                <p className="mt-1 text-[13px] leading-5 text-zinc-500">{c.providerTypes.map((p) => p.name).join(' · ')}</p>
                <p className="mt-2 font-mono text-[11px] text-zinc-400">{ex.file}</p>
              </div>
              <div className="min-w-0">
                <ol className="flex flex-wrap items-center gap-y-2" aria-label={`${ex.title} primary path`}>
                  {path.map((s, i) => (
                    <li key={s.id} className="flex items-center">
                      <span className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-white px-2 py-1 text-[12px] text-zinc-800">
                        <span className={cx('h-1.5 w-1.5 rounded-full', TONE_CLASSES[s.tone].dot)} aria-hidden="true" />
                        {s.name}
                      </span>
                      {i < path.length - 1 && <span className="mx-1 text-zinc-300" aria-hidden="true">→</span>}
                    </li>
                  ))}
                </ol>
                {detours.length > 0 && (
                  <p className="mt-2 text-[12px] text-zinc-500">
                    Branches: {detours.map((d) => d.name).join(', ')} · {c.workflow.stages.reduce((n, s) => n + s.requiredActions.length, 0)} reviewer actions
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  replace(cloneConfig(c));
                  notify(`Loaded “${c.identity.name}”`, { body: 'Opened in the configurator.' });
                  navigate('/wizard/workflow');
                }}
                className="inline-flex items-center gap-1.5 justify-self-start text-[13px] font-medium text-zinc-900 hover:underline lg:justify-self-end"
              >
                Open in configurator <ArrowRight size={14} aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>
      <p className="mt-4 text-[13px] text-zinc-500">
        Need something else? Every stage, transition and checklist is editable in the{' '}
        <Link to="/wizard/workflow" className="text-teal-700 underline underline-offset-2">
          workflow builder
        </Link>
        .
      </p>
    </Section>
  );
}
