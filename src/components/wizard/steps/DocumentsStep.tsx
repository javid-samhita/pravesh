import { useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useConfig } from '../../../config/ConfigContext';
import { DOCUMENT_PRESETS, FILE_TYPE_OPTIONS } from '../../../config/defaults';
import type { DocumentRequirement } from '../../../config/types';
import { moveItem, slugify, uniqueId } from '../../../services/util';
import { Badge, Button, Dialog, EmptyState, Field, IconButton, Input, Panel, PanelHeader, Textarea, Toggle, cx, useToast } from '../../ui';
import { ProviderTypePicker, appliesLabel } from '../ProviderTypePicker';

export function DocumentsStep() {
  const { config, set } = useConfig();
  const { notify } = useToast();
  const docs = config.documents;
  const [open, setOpen] = useState<string | null>(docs[0]?.id ?? null);
  const [confirm, setConfirm] = useState<DocumentRequirement | null>(null);
  const [customType, setCustomType] = useState('');

  const update = (i: number, patch: Partial<DocumentRequirement>) => set('documents', docs.map((d, k) => (k === i ? { ...d, ...patch } : d)));
  const add = (base?: Omit<DocumentRequirement, 'providerTypes'>) => {
    const name = base?.name ?? 'New document';
    const id = uniqueId(base?.id ?? slugify(name, 'document'), docs.map((d) => d.id));
    const doc: DocumentRequirement = base
      ? { ...base, id, acceptedTypes: [...base.acceptedTypes], providerTypes: [] }
      : { id, name, description: '', acceptedTypes: ['pdf'], maxSizeMB: 5, required: true, providerTypes: [] };
    set('documents', [...docs, doc]);
    setOpen(id);
    notify(`Added “${name}”`);
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <Panel>
        <PanelHeader
          title={`Documents (${docs.length})`}
          description={`${docs.filter((d) => d.required).length} required · ${docs.filter((d) => !d.required).length} optional`}
          actions={
            <Button size="sm" variant="primary" icon={<Plus size={14} aria-hidden="true" />} onClick={() => add()}>
              Add document
            </Button>
          }
        />
        {docs.length === 0 ? (
          <EmptyState title="No documents required" body="Add documents applicants must upload, or start from a preset." />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {docs.map((d, i) => {
              const expanded = open === d.id;
              const panelId = `doc-panel-${i}`;
              return (
                <li key={`${d.id}-${i}`}>
                  <div className="flex items-center gap-2 px-4 py-2.5">
                    <button type="button" className="flex min-w-0 flex-1 items-center gap-2.5 text-left" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen(expanded ? null : d.id)}>
                      <ChevronDown size={15} className={cx('shrink-0 text-zinc-400 transition-transform', !expanded && '-rotate-90')} aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate text-[13.5px] font-medium text-zinc-900">{d.name || 'Untitled document'}</span>
                          {d.required ? <Badge className="border-zinc-300 bg-white text-zinc-700">Required</Badge> : <Badge>Optional</Badge>}
                        </span>
                        <span className="block truncate font-mono text-[11px] uppercase text-zinc-400">
                          {d.acceptedTypes.join(' · ')} · {d.maxSizeMB} MB · <span className="normal-case">{appliesLabel(config.providerTypes, d.providerTypes)}</span>
                        </span>
                      </span>
                    </button>
                    <IconButton label={`Move ${d.name} up`} disabled={i === 0} onClick={() => set('documents', moveItem(docs, i, i - 1))}>
                      <ArrowUp size={13} />
                    </IconButton>
                    <IconButton label={`Move ${d.name} down`} disabled={i === docs.length - 1} onClick={() => set('documents', moveItem(docs, i, i + 1))}>
                      <ArrowDown size={13} />
                    </IconButton>
                    <IconButton label={`Delete ${d.name}`} onClick={() => setConfirm(d)}>
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                  {expanded && (
                    <div id={panelId} className="grid grid-cols-1 gap-4 border-t border-zinc-100 bg-zinc-50/50 px-4 py-4 sm:grid-cols-2">
                      <Field id={`doc-name-${i}`} label="Name" required error={d.name.trim() ? null : 'Name is required.'}>
                        <Input id={`doc-name-${i}`} value={d.name} onChange={(e) => update(i, { name: e.target.value })} />
                      </Field>
                      <Field id={`doc-size-${i}`} label="Maximum size (MB)">
                        <Input id={`doc-size-${i}`} type="number" min={0.5} step={0.5} value={d.maxSizeMB} onChange={(e) => update(i, { maxSizeMB: Math.max(0.5, Number(e.target.value) || 0.5) })} />
                      </Field>
                      <Field id={`doc-desc-${i}`} label="Description" className="sm:col-span-2" help="Tell applicants exactly what is acceptable.">
                        <Textarea id={`doc-desc-${i}`} rows={2} value={d.description} onChange={(e) => update(i, { description: e.target.value })} />
                      </Field>
                      <fieldset className="sm:col-span-2">
                        <legend className="mb-1.5 text-[13px] font-medium text-zinc-800">Accepted file types</legend>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.from(new Set([...FILE_TYPE_OPTIONS, ...d.acceptedTypes])).map((t) => {
                            const on = d.acceptedTypes.includes(t);
                            return (
                              <button
                                key={t}
                                type="button"
                                aria-pressed={on}
                                onClick={() => update(i, { acceptedTypes: on ? d.acceptedTypes.filter((x) => x !== t) : [...d.acceptedTypes, t] })}
                                className={cx('rounded-md border px-2 py-1 font-mono text-[11.5px] uppercase', on ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300')}
                              >
                                {t}
                              </button>
                            );
                          })}
                          <form
                            className="flex items-center gap-1"
                            onSubmit={(e) => {
                              e.preventDefault();
                              const t = customType.trim().toLowerCase().replace(/^\./, '');
                              if (t && /^[a-z0-9]{1,8}$/.test(t) && !d.acceptedTypes.includes(t)) update(i, { acceptedTypes: [...d.acceptedTypes, t] });
                              setCustomType('');
                            }}
                          >
                            <label htmlFor={`doc-ext-${i}`} className="sr-only">
                              Other extension
                            </label>
                            <Input id={`doc-ext-${i}`} mono value={customType} onChange={(e) => setCustomType(e.target.value)} placeholder=".ext" className="h-7 w-20 text-[11.5px]" />
                          </form>
                        </div>
                        {d.acceptedTypes.length === 0 && <p className="mt-1 text-[12.5px] text-red-700">Select at least one file type.</p>}
                      </fieldset>
                      <div className="sm:col-span-2">
                        <Toggle id={`doc-req-${i}`} checked={d.required} onChange={(required) => update(i, { required })} label="Required" description="Applicants cannot submit without uploading it." />
                      </div>
                      <div className="sm:col-span-2">
                        <ProviderTypePicker id={`doc-applies-${i}`} types={config.providerTypes} value={d.providerTypes} onChange={(providerTypes) => update(i, { providerTypes })} />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel className="self-start">
        <PanelHeader title="Common documents" description="Typical KYB requirements in India." />
        <ul className="p-2">
          {DOCUMENT_PRESETS.map((p) => {
            const added = docs.some((d) => d.id === p.id);
            return (
              <li key={p.id}>
                <button type="button" disabled={added} onClick={() => add(p)} className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-zinc-50 disabled:cursor-default disabled:text-zinc-400 disabled:hover:bg-transparent">
                  {p.name}
                  {added ? <span className="text-[11.5px]">Added</span> : <Plus size={14} className="text-zinc-400" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        size="sm"
        title={`Remove “${confirm?.name ?? ''}”?`}
        description="Applicants will no longer be asked to upload this document."
        footer={
          <>
            <Button onClick={() => setConfirm(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm) {
                  set('documents', docs.filter((d) => d !== confirm));
                  notify(`Removed “${confirm.name}”`, { tone: 'info' });
                }
                setConfirm(null);
              }}
            >
              Remove
            </Button>
          </>
        }
      />
    </div>
  );
}
