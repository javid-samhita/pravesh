import { Plus, Trash2 } from 'lucide-react';
import { WEBHOOK_EVENTS, type TechnicalConfig, type Webhook } from '../../../config/types';
import { uniqueId } from '../../../services/util';
import { Button, Checkbox, EmptyState, Field, IconButton, Input, Panel, PanelHeader, Toggle } from '../../ui';
import { ENV_NAME_RE, normaliseEnvName } from './envRefs';

export function WebhooksPanel({ technical, onChange }: { technical: TechnicalConfig; onChange: (t: TechnicalConfig) => void }) {
  const hooks = technical.webhooks;
  const update = (i: number, patch: Partial<Webhook>) => onChange({ ...technical, webhooks: hooks.map((w, k) => (k === i ? { ...w, ...patch } : w)) });
  const add = () => {
    const id = uniqueId('wh', hooks.map((h) => h.id));
    const n = hooks.length + 1;
    onChange({
      ...technical,
      webhooks: [...hooks, { id, url: 'https://', events: ['application.submitted'], secretEnv: n === 1 ? 'PRAVESH_WEBHOOK_SECRET' : `PRAVESH_WEBHOOK_${n}_SECRET`, enabled: true }],
    });
  };
  return (
    <Panel>
      <PanelHeader
        title="Webhooks"
        description="Signed POST requests your backend sends on application events. Only the secret's variable name is stored here."
        actions={
          <Button size="sm" icon={<Plus size={14} aria-hidden="true" />} onClick={add}>
            Add webhook
          </Button>
        }
      />
      {hooks.length === 0 ? (
        <EmptyState title="No webhooks" body="Add a webhook to notify your CRM, registry or ops tooling when applications change." />
      ) : (
        <ul className="divide-y divide-zinc-100">
          {hooks.map((w, i) => (
            <li key={w.id} className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,260px)]">
              <div className="space-y-4">
                <Field id={`wh-url-${i}`} label="Endpoint URL" error={/^https:\/\/\S+\.\S+/.test(w.url) ? null : 'Use a full https:// URL.'}>
                  <Input id={`wh-url-${i}`} mono value={w.url} onChange={(e) => update(i, { url: e.target.value })} />
                </Field>
                <Field id={`wh-secret-${i}`} label="Signing secret env var" help="HMAC-SHA256 signature in the X-Pravesh-Signature header." error={ENV_NAME_RE.test(w.secretEnv) ? null : 'UPPER_SNAKE_CASE name.'}>
                  <Input id={`wh-secret-${i}`} mono value={w.secretEnv} onChange={(e) => update(i, { secretEnv: normaliseEnvName(e.target.value) })} />
                </Field>
                <Toggle id={`wh-on-${i}`} checked={w.enabled} onChange={(enabled) => update(i, { enabled })} label="Enabled" />
              </div>
              <div className="flex gap-2">
                <fieldset className="flex-1">
                  <legend className="mb-1.5 text-[13px] font-medium text-zinc-800">Events</legend>
                  <div className="space-y-1">
                    {WEBHOOK_EVENTS.map((ev) => (
                      <Checkbox
                        key={ev}
                        id={`wh-ev-${i}-${ev}`}
                        checked={w.events.includes(ev)}
                        onChange={(on) => update(i, { events: on ? [...w.events, ev] : w.events.filter((x) => x !== ev) })}
                        label={ev}
                      />
                    ))}
                  </div>
                </fieldset>
                <IconButton label={`Delete webhook ${i + 1}`} onClick={() => onChange({ ...technical, webhooks: hooks.filter((_, k) => k !== i) })}>
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
