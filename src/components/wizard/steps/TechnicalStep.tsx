import { useConfig } from '../../../config/ConfigContext';
import { NOTIFICATION_CHANNELS, type TechnicalConfig } from '../../../config/types';
import { Checkbox, Field, Input, Panel, PanelHeader, cx } from '../../ui';
import { EnvVarsPanel } from '../technical/EnvVarsPanel';
import { IntegrationsPanel } from '../technical/IntegrationsPanel';
import { WebhooksPanel } from '../technical/WebhooksPanel';

const urlError = (v: string) => (!v || /^https?:\/\/\S+\.\S+/.test(v) ? null : 'Use a full URL starting with https://');

export function TechnicalStep() {
  const { config, set } = useConfig();
  const t = config.technical;
  const onChange = (next: TechnicalConfig) => set('technical', next);
  const n = t.notifications;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="API integration" description="Where your backend adapter persists applications. Exposed to the client as VITE_PRAVESH_API_BASE_URL." />
          <div className="p-4">
            <Field id="tc-api" label="API base URL" error={urlError(t.apiBaseUrl)}>
              <Input id="tc-api" mono value={t.apiBaseUrl} onChange={(e) => onChange({ ...t, apiBaseUrl: e.target.value })} />
            </Field>
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Callback URLs" description="Where applicants are redirected after key events." />
          <div className="grid gap-3 p-4">
            {(
              [
                ['onSubmit', 'After submission'],
                ['onApproved', 'On approval'],
                ['onRejected', 'On rejection'],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} id={`tc-cb-${key}`} label={label} error={urlError(t.callbacks[key])}>
                <Input id={`tc-cb-${key}`} mono value={t.callbacks[key]} placeholder="https://" onChange={(e) => onChange({ ...t, callbacks: { ...t.callbacks, [key]: e.target.value } })} />
              </Field>
            ))}
          </div>
        </Panel>
      </div>

      <WebhooksPanel technical={t} onChange={onChange} />
      <IntegrationsPanel technical={t} onChange={onChange} />

      <Panel>
        <PanelHeader title="Notifications" description="Applicant notifications sent by your backend when an application enters selected stages." />
        <div className="grid grid-cols-1 gap-5 p-4 md:grid-cols-[200px_minmax(0,1fr)_minmax(0,1.4fr)]">
          <fieldset>
            <legend className="mb-1.5 text-[13px] font-medium text-zinc-800">Channels</legend>
            <div className="space-y-1">
              {NOTIFICATION_CHANNELS.map((c) => (
                <Checkbox
                  key={c}
                  id={`tc-ch-${c}`}
                  label={c === 'sms' ? 'SMS' : c[0].toUpperCase() + c.slice(1)}
                  checked={n.channels.includes(c)}
                  onChange={(on) => onChange({ ...t, notifications: { ...n, channels: on ? [...n.channels, c] : n.channels.filter((x) => x !== c) } })}
                />
              ))}
            </div>
          </fieldset>
          <Field id="tc-sender" label="Sender email">
            <Input id="tc-sender" type="email" value={n.senderEmail} onChange={(e) => onChange({ ...t, notifications: { ...n, senderEmail: e.target.value } })} />
          </Field>
          <fieldset>
            <legend className="mb-1.5 text-[13px] font-medium text-zinc-800">Notify when entering</legend>
            <div className="flex flex-wrap gap-1.5">
              {config.workflow.stages.map((s) => {
                const on = n.notifyOnStages.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onChange({ ...t, notifications: { ...n, notifyOnStages: on ? n.notifyOnStages.filter((x) => x !== s.id) : [...n.notifyOnStages, s.id] } })}
                    className={cx('rounded-md border px-2 py-1 text-[12.5px]', on ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300')}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
      </Panel>

      <EnvVarsPanel config={config} technical={t} onChange={onChange} />
    </div>
  );
}
