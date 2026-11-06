import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { TONE_LABELS } from '../../config/defaults';
import { STAGE_TONES, type Workflow, type WorkflowStage } from '../../config/types';
import { TONE_CLASSES } from '../../services/workflow';
import { slugify, uniqueId } from '../../services/util';
import { Button, Checkbox, Field, Input, Textarea, Toggle, cx } from '../ui';
import { ListEditor } from '../wizard/ListEditor';

export interface StageEditorProps {
  stage: WorkflowStage;
  workflow: Workflow;
  onChange: (patch: Partial<WorkflowStage>) => void;
  onRenameId: (id: string) => void;
  onSetInitial: () => void;
  onSetSubmitted: () => void;
  onDelete: () => void;
}

export function StageEditor({ stage, workflow, onChange, onRenameId, onSetInitial, onSetSubmitted, onDelete }: StageEditorProps) {
  const [idDraft, setIdDraft] = useState(stage.id);
  const others = workflow.stages.filter((s) => s.id !== stage.id);
  const idValid = /^[a-z0-9][a-z0-9_-]*$/.test(idDraft);
  const idTaken = others.some((s) => s.id === idDraft);
  const idError = !idValid ? 'Lower-case letters, digits, _ or -.' : idTaken ? 'Another stage uses this id.' : null;

  const commitId = () => {
    if (idDraft !== stage.id && !idError) onRenameId(idDraft);
  };

  return (
    <section className="rounded-lg border border-zinc-200 bg-white" aria-labelledby="st-editor-h">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3">
        <div className="min-w-0">
          <p className="label-xs">Stage</p>
          <h3 id="st-editor-h" className="truncate text-[14px] font-semibold">
            {stage.name || 'Untitled stage'}
          </h3>
        </div>
        <Button size="sm" variant="danger" icon={<Trash2 size={13} aria-hidden="true" />} onClick={onDelete} disabled={workflow.stages.length <= 1}>
          Delete
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <Field id="st-name" label="Name" required error={stage.name.trim() ? null : 'Name is required.'}>
          <Input
            id="st-name"
            value={stage.name}
            invalid={!stage.name.trim()}
            onChange={(e) => onChange({ name: e.target.value })}
            onBlur={() => {
              // Stages created with a placeholder id adopt an id derived from their name.
              if (/^new_stage(_\d+)?$/.test(stage.id) && stage.name.trim()) {
                const next = uniqueId(slugify(stage.name, 'stage'), others.map((s) => s.id));
                if (next !== stage.id) onRenameId(next);
              }
            }}
          />
        </Field>
        <Field id="st-id" label="Stage id" error={idError} help="Press Enter or leave the field to apply. References update automatically.">
          <Input
            id="st-id"
            mono
            value={idDraft}
            invalid={!!idError}
            onChange={(e) => setIdDraft(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_'))}
            onBlur={commitId}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitId();
            }}
          />
        </Field>
        <Field id="st-desc" label="Description" className="sm:col-span-2" help="Shown to applicants on their status page.">
          <Textarea id="st-desc" rows={2} value={stage.description} onChange={(e) => onChange({ description: e.target.value })} />
        </Field>

        <fieldset className="sm:col-span-2">
          <legend className="mb-1.5 text-[13px] font-medium text-zinc-800">Tone</legend>
          <div className="flex flex-wrap gap-1.5">
            {STAGE_TONES.map((t) => (
              <label key={t} className={cx('flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12.5px]', stage.tone === t ? 'border-zinc-900 text-zinc-900' : 'border-zinc-200 text-zinc-600 hover:border-zinc-300')}>
                <input type="radio" name="st-tone" className="sr-only" checked={stage.tone === t} onChange={() => onChange({ tone: t })} />
                <span className={cx('h-2 w-2 rounded-full', TONE_CLASSES[t].dot)} aria-hidden="true" />
                {TONE_LABELS[t]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-3 sm:col-span-2">
          <Toggle id="st-terminal" checked={stage.terminal} onChange={(terminal) => onChange({ terminal, transitions: terminal ? [] : stage.transitions })} label="Terminal stage" description="Ends the lifecycle. Terminal stages have no outgoing transitions." />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={workflow.initialStage === stage.id ? 'primary' : 'secondary'} onClick={onSetInitial} disabled={workflow.initialStage === stage.id} aria-pressed={workflow.initialStage === stage.id}>
              {workflow.initialStage === stage.id ? 'Start stage' : 'Set as start stage'}
            </Button>
            <Button size="sm" variant={workflow.submittedStage === stage.id ? 'primary' : 'secondary'} onClick={onSetSubmitted} disabled={workflow.submittedStage === stage.id} aria-pressed={workflow.submittedStage === stage.id}>
              {workflow.submittedStage === stage.id ? 'Entered on submit' : 'Enter on submit'}
            </Button>
          </div>
        </div>

        <Field id="st-actions" label="Required actions" className="sm:col-span-2" help="Reviewers tick these off before a forward transition is allowed.">
          <ListEditor id="st-actions" items={stage.requiredActions} onChange={(requiredActions) => onChange({ requiredActions })} placeholder="e.g. Verify GSTIN on GST portal" addLabel="Add action" />
        </Field>

        <fieldset className="sm:col-span-2" disabled={stage.terminal}>
          <legend className="mb-1.5 text-[13px] font-medium text-zinc-800">Allowed transitions</legend>
          {stage.terminal ? (
            <p className="text-[12.5px] text-zinc-500">Terminal stages cannot move anywhere.</p>
          ) : (
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {others.map((o) => (
                <Checkbox
                  key={o.id}
                  id={`st-tr-${o.id}`}
                  checked={stage.transitions.includes(o.id)}
                  onChange={(on) => onChange({ transitions: on ? [...stage.transitions, o.id] : stage.transitions.filter((t) => t !== o.id) })}
                  label={o.name}
                />
              ))}
            </div>
          )}
        </fieldset>
      </div>
    </section>
  );
}
