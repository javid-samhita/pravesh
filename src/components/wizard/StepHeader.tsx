import type { ReactNode } from 'react';
import type { Issue } from '../../services/validation';
import type { WizardStepMeta } from './steps';

export function StepHeader({ meta, index, issues, actions }: { meta: WizardStepMeta; index: number; issues: Issue[]; actions?: ReactNode }) {
  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 max-w-2xl">
        <p className="label-xs">Step {index + 1} of 9</p>
        <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-zinc-900">{meta.title}</h1>
        <p className="mt-1 text-[13.5px] text-zinc-500">{meta.description}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {meta.paths.length > 0 && (
          <span
            className={
              errors.length
                ? 'rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[12px] font-medium text-red-700'
                : warnings.length
                  ? 'rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[12px] font-medium text-amber-800'
                  : 'rounded border border-teal-200 bg-teal-50 px-2 py-0.5 text-[12px] font-medium text-teal-800'
            }
          >
            {errors.length ? `${errors.length} error${errors.length > 1 ? 's' : ''}` : warnings.length ? `${warnings.length} warning${warnings.length > 1 ? 's' : ''}` : 'Valid'}
          </span>
        )}
        {actions}
      </div>
    </div>
  );
}

export function IssueList({ issues }: { issues: Issue[] }) {
  if (!issues.length) return null;
  return (
    <ul className="mb-6 space-y-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[12.5px]" aria-label="Validation issues">
      {issues.map((i, k) => (
        <li key={k} className="flex gap-2">
          <span className={i.level === 'error' ? 'font-mono text-red-700' : 'font-mono text-amber-700'}>{i.level === 'error' ? 'error' : 'warn '}</span>
          <span className="font-mono text-zinc-500">{i.path}</span>
          <span className="text-zinc-800">{i.message}</span>
        </li>
      ))}
    </ul>
  );
}
