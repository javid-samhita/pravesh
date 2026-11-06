import { Plus, Trash2 } from 'lucide-react';
import { INTEGRATION_KINDS, type Integration, type TechnicalConfig } from '../../../config/types';
import { uniqueId } from '../../../services/util';
import { Button, EmptyState, Field, IconButton, Input, Panel, PanelHeader, Select, Toggle } from '../../ui';
import { normaliseEnvName } from './envRefs';

const KIND_LABEL: Record<Integration['kind'], string> = {
  kyc: 'KYC / KYB',
  gst: 'GST verification',
  bank: 'Bank verification',
  esign: 'eSign',
  crm: 'CRM',
  registry: 'Registry',
  other: 'Other',
};

export function IntegrationsPanel({ technical, onChange }: { technical: TechnicalConfig; onChange: (t: TechnicalConfig) => void }) {
  const list = technical.integrations;
  const update = (i: number, patch: Partial<Integration>) => onChange({ ...technical, integrations: list.map((x, k) => (k === i ? { ...x, ...patch } : x)) });
  return (
    <Panel>
      <PanelHeader
        title="External integrations"
        description="Services your backend adapter calls. Credentials stay server-side; reference them by variable name."
        actions={
          <Button
            size="sm"
            icon={<Plus size={14} aria-hidden="true" />}
            onClick={() =>
              onChange({
                ...technical,
                integrations: [...list, { id: uniqueId('integration', list.map((x) => x.id)), name: 'New integration', kind: 'other', baseUrl: 'https://', credentialEnv: 'PRAVESH_INTEGRATION_API_KEY', enabled: true }],
              })
            }
          >
            Add integration
          </Button>
        }
      />
      {list.length === 0 ? (
        <EmptyState title="No integrations" body="Add GST, bank account, KYC or registry services that verify applicant data." />
      ) : (
        <ul className="divide-y divide-zinc-100">
          {list.map((it, i) => (
            <li key={it.id} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.9fr_1.4fr_1.4fr_auto] lg:items-end">
              <Field id={`in-name-${i}`} label="Name">
                <Input id={`in-name-${i}`} value={it.name} onChange={(e) => update(i, { name: e.target.value })} />
              </Field>
              <Field id={`in-kind-${i}`} label="Kind">
                <Select id={`in-kind-${i}`} value={it.kind} onChange={(e) => update(i, { kind: e.target.value as Integration['kind'] })}>
                  {INTEGRATION_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {KIND_LABEL[k]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field id={`in-url-${i}`} label="Base URL">
                <Input id={`in-url-${i}`} mono value={it.baseUrl} onChange={(e) => update(i, { baseUrl: e.target.value })} />
              </Field>
              <Field id={`in-env-${i}`} label="Credential env var">
                <Input id={`in-env-${i}`} mono value={it.credentialEnv} onChange={(e) => update(i, { credentialEnv: normaliseEnvName(e.target.value) })} />
              </Field>
              <div className="flex items-center gap-2 pb-1.5">
                <Toggle id={`in-on-${i}`} size="sm" checked={it.enabled} onChange={(enabled) => update(i, { enabled })} label={`${it.name} enabled`} srOnlyLabel />
                <IconButton label={`Delete ${it.name}`} onClick={() => onChange({ ...technical, integrations: list.filter((_, k) => k !== i) })}>
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
