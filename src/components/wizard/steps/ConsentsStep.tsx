import { useState } from 'react';
import { Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useConfig } from '../../../config/ConfigContext';
import type { ConsentRequirement } from '../../../config/types';
import { slugify, uniqueId } from '../../../services/util';
import { stageById } from '../../../services/workflow';
import { Badge, Button, CodeBlock, Dialog, EmptyState, Field, IconButton, Input, Panel, PanelHeader, Select, Textarea, Toggle, useToast } from '../../ui';

const EMPTY: ConsentRequirement = { id: '', title: '', description: '', purpose: '', required: true, stage: '', version: '1.0' };

export function ConsentsStep() {
  const { config, set } = useConfig();
  const { notify } = useToast();
  const { consents, workflow } = config;
  const [draft, setDraft] = useState<ConsentRequirement | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const open = (i: number | null) => {
    setErrors({});
    setEditIndex(i);
    setDraft(i === null ? { ...EMPTY, stage: workflow.initialStage } : { ...consents[i] });
  };

  const save = () => {
    if (!draft) return;
    const e: Record<string, string> = {};
    if (!draft.title.trim()) e.title = 'Title is required.';
    if (!draft.description.trim()) e.description = 'Describe what the applicant agrees to.';
    if (!draft.version.trim()) e.version = 'Version is required.';
    setErrors(e);
    if (Object.keys(e).length) return;
    if (editIndex === null) {
      const id = uniqueId(slugify(draft.title, 'consent'), consents.map((c) => c.id));
      set('consents', [...consents, { ...draft, id }]);
      notify(`Added consent “${draft.title}”`);
    } else {
      set('consents', consents.map((c, k) => (k === editIndex ? draft : c)));
    }
    setDraft(null);
  };

  const sample = consents[0]
    ? JSON.stringify({ consentId: consents[0].id, title: consents[0].title, version: consents[0].version, stage: consents[0].stage, grantedAt: '2026-11-06T10:42:07.000Z' }, null, 2)
    : '';

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Panel>
        <PanelHeader
          title={`Consents (${consents.length})`}
          description="Collected at submission when tied to the start or submit stage; otherwise requested when the application reaches that stage."
          actions={
            <Button size="sm" variant="primary" icon={<Plus size={14} aria-hidden="true" />} onClick={() => open(null)}>
              Add consent
            </Button>
          }
        />
        {consents.length === 0 ? (
          <EmptyState icon={<ShieldCheck size={16} />} title="No consents configured" body="Most networks require at least terms of participation and a verification consent." />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {consents.map((c, i) => (
              <li key={c.id} className="flex gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-[13.5px] font-medium text-zinc-900">{c.title}</p>
                    <Badge mono>v{c.version}</Badge>
                    {c.required ? <Badge className="border-zinc-300 bg-white text-zinc-700">Required</Badge> : <Badge>Optional</Badge>}
                  </div>
                  <p className="mt-0.5 text-[13px] text-zinc-600">{c.description}</p>
                  <p className="mt-1 text-[12px] text-zinc-500">
                    Purpose: {c.purpose || '-'} · Collected at <span className="font-medium text-zinc-700">{stageById(workflow, c.stage)?.name ?? <span className="text-red-700">unknown stage “{c.stage}”</span>}</span>
                  </p>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  <IconButton label={`Edit ${c.title}`} onClick={() => open(i)}>
                    <Pencil size={14} />
                  </IconButton>
                  <IconButton label={`Delete ${c.title}`} onClick={() => setConfirm(i)}>
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <aside className="space-y-3 self-start">
        <p className="label-xs">Stored consent record</p>
        <p className="text-[12.5px] text-zinc-500">Every grant is stored with the consent version and timestamp, so you can prove what an applicant agreed to.</p>
        {sample && <CodeBlock code={sample} title="consents[0]" />}
      </aside>

      <Dialog
        open={!!draft}
        onClose={() => setDraft(null)}
        title={editIndex === null ? 'New consent' : 'Edit consent'}
        footer={
          <>
            <Button onClick={() => setDraft(null)}>Cancel</Button>
            <Button variant="primary" onClick={save}>
              {editIndex === null ? 'Add consent' : 'Save changes'}
            </Button>
          </>
        }
      >
        {draft && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="cn-title" label="Consent title" required error={errors.title} className="sm:col-span-2">
              <Input id="cn-title" data-autofocus value={draft.title} invalid={!!errors.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </Field>
            <Field id="cn-desc" label="Consent description" required error={errors.description} className="sm:col-span-2" help="The exact text the applicant agrees to.">
              <Textarea id="cn-desc" rows={3} value={draft.description} invalid={!!errors.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </Field>
            <Field id="cn-purpose" label="Purpose" className="sm:col-span-2" help="Why the data or agreement is needed, e.g. Identity verification.">
              <Input id="cn-purpose" value={draft.purpose} onChange={(e) => setDraft({ ...draft, purpose: e.target.value })} />
            </Field>
            <Field id="cn-stage" label="Applicable stage">
              <Select id="cn-stage" value={draft.stage} onChange={(e) => setDraft({ ...draft, stage: e.target.value })}>
                {workflow.stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="cn-version" label="Consent version" required error={errors.version}>
              <Input id="cn-version" mono value={draft.version} invalid={!!errors.version} onChange={(e) => setDraft({ ...draft, version: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Toggle id="cn-required" checked={draft.required} onChange={(required) => setDraft({ ...draft, required })} label="Required" description="Required consents block submission (or the stage) until granted." />
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        size="sm"
        title={`Delete “${confirm !== null ? consents[confirm]?.title : ''}”?`}
        description="Existing consent records in stored applications are kept."
        footer={
          <>
            <Button onClick={() => setConfirm(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm !== null) set('consents', consents.filter((_, k) => k !== confirm));
                setConfirm(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}
