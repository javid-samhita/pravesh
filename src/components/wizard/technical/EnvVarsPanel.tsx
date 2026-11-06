import { Download, KeyRound, Plus, Trash2 } from 'lucide-react';
import type { EnvVarDeclaration, PraveshConfig, TechnicalConfig } from '../../../config/types';
import { downloadText, generateEnvExample } from '../../../services/configIO';
import { Button, IconButton, Input, Notice, Panel, PanelHeader, Toggle, cx, useToast } from '../../ui';
import { ENV_NAME_RE, missingSecretDeclarations, normaliseEnvName } from './envRefs';

export function EnvVarsPanel({ config, technical, onChange }: { config: PraveshConfig; technical: TechnicalConfig; onChange: (t: TechnicalConfig) => void }) {
  const { notify } = useToast();
  const vars = technical.envVars;
  const missing = missingSecretDeclarations(technical);
  const update = (i: number, patch: Partial<EnvVarDeclaration>) =>
    onChange({
      ...technical,
      envVars: vars.map((v, k) => {
        if (k !== i) return v;
        const next = { ...v, ...patch };
        if (next.secret) next.example = '';
        return next;
      }),
    });
  const problem = (v: EnvVarDeclaration, i: number): string | null => {
    if (!ENV_NAME_RE.test(v.name)) return 'Use UPPER_SNAKE_CASE.';
    if (vars.findIndex((x) => x.name === v.name) !== i) return 'Duplicate name.';
    if (v.secret && v.name.startsWith('VITE_')) return 'Secrets must not use VITE_: Vite would bundle them into the browser.';
    return null;
  };

  return (
    <Panel>
      <PanelHeader
        title="Environment variables"
        description="Declare names only. Values live in your deployment's secret store, never in this configuration."
        actions={
          <>
            <Button
              size="sm"
              icon={<Plus size={14} aria-hidden="true" />}
              onClick={() => onChange({ ...technical, envVars: [...vars, { name: 'PRAVESH_NEW_VARIABLE', description: '', secret: true, required: true, example: '' }] })}
            >
              Add variable
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Download size={14} aria-hidden="true" />}
              onClick={() => {
                downloadText('.env.example', generateEnvExample(config), 'text/plain');
                notify('Downloaded .env.example');
              }}
            >
              .env.example
            </Button>
          </>
        }
      />
      <div className="space-y-3 p-4">
        <Notice tone="info" title="How secrets are handled">
          Variables prefixed <code className="font-mono">VITE_</code> are compiled into the client bundle and must be public values. Everything else, including webhook signing secrets and
          integration credentials, is read only by your backend.
        </Notice>
        {missing.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
            <span>
              {missing.length} referenced variable{missing.length > 1 ? 's are' : ' is'} not declared: <span className="font-mono text-[12px]">{missing.map((m) => m.name).join(', ')}</span>
            </span>
            <Button size="sm" onClick={() => onChange({ ...technical, envVars: [...vars, ...missing] })}>
              Declare as secrets
            </Button>
          </div>
        )}
      </div>
      <div className="relative overflow-x-auto border-t border-zinc-200">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-zinc-200 text-[12px] text-zinc-500">
              <th scope="col" className="px-4 py-2 font-medium">Name</th>
              <th scope="col" className="px-2 py-2 font-medium">Description</th>
              <th scope="col" className="px-2 py-2 font-medium">Example (public only)</th>
              <th scope="col" className="px-2 py-2 font-medium">Secret</th>
              <th scope="col" className="px-2 py-2 font-medium">Required</th>
              <th scope="col" className="px-2 py-2"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {vars.map((v, i) => {
              const err = problem(v, i);
              return (
                <tr key={i} className="border-b border-zinc-100 align-top last:border-0">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1.5">
                      <KeyRound size={13} className={cx('shrink-0', v.secret ? 'text-amber-600' : 'text-zinc-300')} aria-hidden="true" />
                      <Input aria-label={`Variable ${i + 1} name`} mono value={v.name} invalid={!!err} onChange={(e) => update(i, { name: normaliseEnvName(e.target.value) })} className="h-8 min-w-[230px]" />
                    </div>
                    {err && <p className="mt-1 text-[12px] text-red-700">{err}</p>}
                  </td>
                  <td className="px-2 py-2">
                    <Input aria-label={`${v.name} description`} value={v.description} onChange={(e) => update(i, { description: e.target.value })} className="h-8 min-w-[180px]" />
                  </td>
                  <td className="px-2 py-2">
                    <Input aria-label={`${v.name} example value`} mono value={v.secret ? '' : v.example} disabled={v.secret} placeholder={v.secret ? 'never stored' : ''} onChange={(e) => update(i, { example: e.target.value })} className="h-8 min-w-[160px]" />
                  </td>
                  <td className="px-2 py-2.5">
                    <Toggle size="sm" checked={v.secret} onChange={(secret) => update(i, { secret })} label={`${v.name} is secret`} srOnlyLabel />
                  </td>
                  <td className="px-2 py-2.5">
                    <Toggle size="sm" checked={v.required} onChange={(required) => update(i, { required })} label={`${v.name} is required`} srOnlyLabel />
                  </td>
                  <td className="px-2 py-1.5">
                    <IconButton label={`Delete ${v.name}`} onClick={() => onChange({ ...technical, envVars: vars.filter((_, k) => k !== i) })}>
                      <Trash2 size={14} />
                    </IconButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
