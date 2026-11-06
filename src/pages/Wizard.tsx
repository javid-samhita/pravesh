import { useEffect, useMemo, useRef } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useConfig } from '../config/ConfigContext';
import { validateConfig, type Issue } from '../services/validation';
import { WIZARD_STEPS } from '../components/wizard/steps';
import { WizardTopBar } from '../components/wizard/WizardTopBar';
import { IssueList, StepHeader } from '../components/wizard/StepHeader';
import { IdentityStep } from '../components/wizard/steps/IdentityStep';
import { ProviderTypesStep } from '../components/wizard/steps/ProviderTypesStep';
import { FieldsStep } from '../components/wizard/steps/FieldsStep';
import { DocumentsStep } from '../components/wizard/steps/DocumentsStep';
import { WorkflowStep } from '../components/wizard/steps/WorkflowStep';
import { ConsentsStep } from '../components/wizard/steps/ConsentsStep';
import { TechnicalStep } from '../components/wizard/steps/TechnicalStep';
import { PreviewStep } from '../components/wizard/steps/PreviewStep';
import { ExportStep } from '../components/wizard/steps/ExportStep';
import { Select, buttonClass, cx } from '../components/ui';

const STEP_COMPONENTS: Record<string, () => JSX.Element> = {
  identity: IdentityStep,
  providers: ProviderTypesStep,
  fields: FieldsStep,
  documents: DocumentsStep,
  workflow: WorkflowStep,
  consents: ConsentsStep,
  technical: TechnicalStep,
  preview: PreviewStep,
  export: ExportStep,
};

function issuesFor(paths: string[], all: Issue[]): Issue[] {
  return all.filter((i) => paths.some((p) => i.path === p || i.path.startsWith(`${p}.`) || i.path.startsWith(`${p}[`)));
}

export default function Wizard() {
  const { step = '' } = useParams();
  const navigate = useNavigate();
  const { config } = useConfig();
  const mainRef = useRef<HTMLDivElement>(null);
  const result = useMemo(() => validateConfig(config), [config]);
  const all = useMemo(() => [...result.errors, ...result.warnings], [result]);
  const index = WIZARD_STEPS.findIndex((s) => s.slug === step);

  useEffect(() => {
    if (index < 0) return;
    window.scrollTo({ top: 0 });
    document.title = `${WIZARD_STEPS[index].short} · Configurator · Pravesh`;
    mainRef.current?.focus({ preventScroll: true });
  }, [index]);

  if (index < 0) return <Navigate to="/wizard/identity" replace />;
  const meta = WIZARD_STEPS[index];
  const StepComponent = STEP_COMPONENTS[meta.slug];
  const stepIssues = issuesFor(meta.paths, all);
  // Builder steps show their own inline checks; list issues for the rest.
  const showIssueList = !['workflow', 'export', 'preview'].includes(meta.slug);
  const prev = WIZARD_STEPS[index - 1];
  const next = WIZARD_STEPS[index + 1];

  return (
    <div className="min-h-screen bg-zinc-50/60">
      <WizardTopBar />
      <div className="flex">
        {/* Desktop step rail */}
        <nav aria-label="Configuration steps" className="sticky top-14 hidden h-[calc(100vh-56px)] w-[248px] shrink-0 overflow-y-auto border-r border-zinc-200 bg-white px-3 py-5 lg:block">
          <ol className="space-y-0.5">
            {WIZARD_STEPS.map((s, i) => {
              const iss = issuesFor(s.paths, all);
              const errs = iss.filter((x) => x.level === 'error').length;
              const active = i === index;
              return (
                <li key={s.slug}>
                  <Link
                    to={`/wizard/${s.slug}`}
                    aria-current={active ? 'step' : undefined}
                    className={cx('flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors', active ? 'bg-zinc-100 font-medium text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900')}
                  >
                    <span className={cx('flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[10.5px]', active ? 'bg-zinc-900 text-white' : 'border border-zinc-200 text-zinc-500')}>{i + 1}</span>
                    <span className="flex-1 truncate">{s.short}</span>
                    {s.paths.length > 0 &&
                      (errs ? (
                        <span className="rounded bg-red-50 px-1 font-mono text-[10.5px] text-red-700" aria-label={`${errs} errors`}>
                          {errs}
                        </span>
                      ) : (
                        <Check size={13} className="text-zinc-300" aria-label="no errors" />
                      ))}
                  </Link>
                </li>
              );
            })}
          </ol>
          <div className="mt-6 border-t border-zinc-200 px-2.5 pt-4 text-[12px] text-zinc-500">
            <p>
              {result.valid ? 'Configuration valid' : `${result.errors.length} error${result.errors.length === 1 ? '' : 's'}`}
              {result.warnings.length > 0 && ` · ${result.warnings.length} warning${result.warnings.length === 1 ? '' : 's'}`}
            </p>
            <p className="mt-1 font-mono text-[11px] text-zinc-400">{config.id}</p>
          </div>
        </nav>

        <div className="min-w-0 flex-1">
          {/* Mobile / tablet step picker */}
          <div className="sticky top-14 z-20 border-b border-zinc-200 bg-white px-4 py-2.5 lg:hidden">
            <label htmlFor="wizard-step-select" className="sr-only">
              Configuration step
            </label>
            <Select id="wizard-step-select" value={meta.slug} onChange={(e) => navigate(`/wizard/${e.target.value}`)}>
              {WIZARD_STEPS.map((s, i) => (
                <option key={s.slug} value={s.slug}>
                  {i + 1}. {s.short}
                  {issuesFor(s.paths, all).some((x) => x.level === 'error') ? ' (needs attention)' : ''}
                </option>
              ))}
            </Select>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-100" role="progressbar" aria-label="Wizard progress" aria-valuemin={1} aria-valuemax={9} aria-valuenow={index + 1}>
              <div className="h-full bg-zinc-900 transition-[width]" style={{ width: `${((index + 1) / WIZARD_STEPS.length) * 100}%` }} />
            </div>
          </div>

          <main ref={mainRef} tabIndex={-1} className="mx-auto w-full max-w-[1280px] px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
            <StepHeader meta={meta} index={index} issues={stepIssues} />
            {showIssueList && <IssueList issues={stepIssues} />}
            <StepComponent />

            <div className="mt-10 flex items-center justify-between gap-3 border-t border-zinc-200 pt-5">
              {prev ? (
                <Link to={`/wizard/${prev.slug}`} className={buttonClass('secondary', 'md')}>
                  <ArrowLeft size={15} aria-hidden="true" /> <span className="hidden sm:inline">{prev.short}</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              ) : (
                <Link to="/" className={buttonClass('ghost', 'md')}>
                  <ArrowLeft size={15} aria-hidden="true" /> Home
                </Link>
              )}
              <span className="font-mono text-[12px] text-zinc-400">
                {index + 1} / {WIZARD_STEPS.length}
              </span>
              {next ? (
                <Link to={`/wizard/${next.slug}`} className={buttonClass('primary', 'md')}>
                  <span className="hidden sm:inline">{next.short}</span>
                  <span className="sm:hidden">Next</span> <ArrowRight size={15} aria-hidden="true" />
                </Link>
              ) : (
                <Link to="/portal" className={buttonClass('primary', 'md')}>
                  Open portal <ArrowRight size={15} aria-hidden="true" />
                </Link>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
