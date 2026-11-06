import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Flag, Plus, Trash2 } from 'lucide-react';
import type { PraveshConfig, WorkflowStage } from '../../config/types';
import { moveItem, uniqueId } from '../../services/util';
import { TONE_CLASSES, removeStage, renameStageId, validateWorkflow } from '../../services/workflow';
import { Button, Dialog, cx, useToast } from '../ui';
import { StageEditor } from './StageEditor';
import { TransitionMatrix } from './TransitionMatrix';

export interface WorkflowBuilderProps {
  config: PraveshConfig;
  onChange: (config: PraveshConfig) => void;
}

/**
 * Visual workflow builder: stages as nodes in a horizontal pipeline (drag or
 * arrow buttons to reorder), a stage inspector, and a transitions matrix.
 */
export function WorkflowBuilder({ config, onChange }: WorkflowBuilderProps) {
  const { notify } = useToast();
  const { workflow } = config;
  const [selectedId, setSelectedId] = useState(workflow.stages[0]?.id ?? '');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<WorkflowStage | null>(null);
  const [announce, setAnnounce] = useState('');
  const issues = validateWorkflow(workflow);
  const selected = workflow.stages.find((s) => s.id === selectedId) ?? workflow.stages[0];

  const setStages = (stages: WorkflowStage[]) => onChange({ ...config, workflow: { ...workflow, stages } });
  const updateStage = (id: string, patch: Partial<WorkflowStage>) => setStages(workflow.stages.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const reorder = (from: number, to: number) => {
    if (to < 0 || to >= workflow.stages.length) return;
    setStages(moveItem(workflow.stages, from, to));
    setAnnounce(`${workflow.stages[from].name} moved to position ${to + 1}.`);
  };

  const addStage = () => {
    const id = uniqueId('new_stage', workflow.stages.map((s) => s.id));
    const stage: WorkflowStage = { id, name: 'New stage', description: '', tone: 'info', terminal: false, requiredActions: [], transitions: [] };
    // Insert before the first terminal stage so the pipeline reads left-to-right.
    const firstTerminal = workflow.stages.findIndex((s) => s.terminal);
    const stages = workflow.stages.slice();
    stages.splice(firstTerminal === -1 ? stages.length : firstTerminal, 0, stage);
    setStages(stages);
    setSelectedId(id);
    notify('Stage added', { body: 'Connect it with transitions so it is reachable.' });
    window.setTimeout(() => document.getElementById('st-name')?.focus(), 30);
  };

  useEffect(() => {
    if (selected) document.getElementById(`wf-node-${selected.id}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [selected?.id]);

  const issueStages = new Set(issues.filter((i) => i.level === 'error' && i.stageId).map((i) => i.stageId));
  const incoming = (id: string) => workflow.stages.filter((s) => s.transitions.includes(id)).length;

  return (
    <div className="space-y-5">
      {/* Pipeline */}
      <section className="rounded-lg border border-zinc-200 bg-white" aria-labelledby="wf-pipeline-h">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3">
          <div>
            <h3 id="wf-pipeline-h" className="text-[13.5px] font-semibold">Pipeline</h3>
            <p className="text-[12px] text-zinc-500">Drag stages to reorder, or select one and use the arrow buttons.</p>
          </div>
          <Button size="sm" variant="primary" icon={<Plus size={14} aria-hidden="true" />} onClick={addStage}>
            Add stage
          </Button>
        </div>
        <div className="grid-bg relative overflow-x-auto px-4 py-5">
          <ol className="flex min-w-max items-stretch" aria-label="Workflow stages in order">
            {workflow.stages.map((s, i) => {
              const tone = TONE_CLASSES[s.tone];
              const isSel = s.id === selected?.id;
              return (
                <li key={s.id} className="flex items-stretch">
                  <div
                    draggable
                    onDragStart={(e) => {
                      setDragIndex(i);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', s.id);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setOverIndex(i);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragIndex !== null) reorder(dragIndex, i);
                      setDragIndex(null);
                      setOverIndex(null);
                    }}
                    onDragEnd={() => {
                      setDragIndex(null);
                      setOverIndex(null);
                    }}
                    className={cx(
                      'relative flex w-[176px] cursor-grab rounded-md border bg-white text-left shadow-card transition-[border-color,opacity] active:cursor-grabbing',
                      isSel ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200 hover:border-zinc-400',
                      dragIndex === i && 'opacity-40',
                      overIndex === i && dragIndex !== null && dragIndex !== i && 'border-teal-600',
                    )}
                  >
                    <button type="button" onClick={() => setSelectedId(s.id)} aria-pressed={isSel} id={`wf-node-${s.id}`} className="flex w-full flex-col px-3 pb-2 pt-2.5 text-left">
                      <span className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className={cx('h-2 w-2 shrink-0 rounded-full', tone.dot)} aria-hidden="true" />
                          <span className="truncate text-[13px] font-semibold text-zinc-900">{s.name || 'Untitled'}</span>
                        </span>
                        {issueStages.has(s.id) && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-label="has errors" />}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[10.5px] text-zinc-400">{s.id}</span>
                      <span className="mb-2 mt-2 flex min-h-[18px] flex-wrap gap-1">
                        {s.id === workflow.initialStage && <span className="rounded border border-zinc-200 bg-zinc-50 px-1 font-mono text-[10px] text-zinc-600">START</span>}
                        {s.id === workflow.submittedStage && <span className="rounded border border-sky-200 bg-sky-50 px-1 font-mono text-[10px] text-sky-700">ON SUBMIT</span>}
                        {s.terminal && (
                          <span className="inline-flex items-center gap-0.5 rounded border border-zinc-300 bg-white px-1 font-mono text-[10px] text-zinc-700">
                            <Flag size={9} aria-hidden="true" /> END
                          </span>
                        )}
                      </span>
                      <span className="mt-auto flex w-full justify-between border-t border-zinc-100 pt-1.5 font-mono text-[10.5px] text-zinc-500">
                        <span>in {incoming(s.id)}</span>
                        <span>out {s.transitions.length}</span>
                        <span>act {s.requiredActions.length}</span>
                      </span>
                    </button>
                  </div>
                  {i < workflow.stages.length - 1 && (
                    <span className="flex w-8 items-center justify-center self-center text-zinc-300" aria-hidden="true">
                      <svg width="24" height="10" viewBox="0 0 24 10">
                        <path d="M0 5h20M16 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </span>
                  )}
                </li>
              );
            })}
            <li className="flex items-center pl-8">
              <button type="button" onClick={addStage} className="flex h-full min-h-[104px] w-[120px] flex-col items-center justify-center gap-1 rounded-md border border-dashed border-zinc-300 bg-white/60 text-[12.5px] text-zinc-500 hover:border-zinc-400 hover:text-zinc-900">
                <Plus size={16} aria-hidden="true" />
                Add stage
              </button>
            </li>
          </ol>
        </div>
        {selected && (
          <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 px-4 py-2 text-[12.5px] text-zinc-600">
            <span>
              Position {workflow.stages.findIndex((s) => s.id === selected.id) + 1} of {workflow.stages.length}
            </span>
            <span className="text-zinc-300">·</span>
            <Button size="sm" variant="ghost" icon={<ArrowLeft size={13} aria-hidden="true" />} aria-label={`Move ${selected.name} earlier`} disabled={workflow.stages[0]?.id === selected.id} onClick={() => reorder(workflow.stages.findIndex((s) => s.id === selected.id), workflow.stages.findIndex((s) => s.id === selected.id) - 1)}>
              Earlier
            </Button>
            <Button size="sm" variant="ghost" iconRight={<ArrowRight size={13} aria-hidden="true" />} aria-label={`Move ${selected.name} later`} disabled={workflow.stages[workflow.stages.length - 1]?.id === selected.id} onClick={() => reorder(workflow.stages.findIndex((s) => s.id === selected.id), workflow.stages.findIndex((s) => s.id === selected.id) + 1)}>
              Later
            </Button>
            <span className="sr-only" aria-live="polite">
              {announce}
            </span>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {selected ? (
          <StageEditor
            key={selected.id}
            stage={selected}
            workflow={workflow}
            onChange={(patch) => updateStage(selected.id, patch)}
            onRenameId={(to) => {
              onChange(renameStageId(config, selected.id, to));
              setSelectedId(to);
            }}
            onSetInitial={() => onChange({ ...config, workflow: { ...workflow, initialStage: selected.id } })}
            onSetSubmitted={() => onChange({ ...config, workflow: { ...workflow, submittedStage: selected.id } })}
            onDelete={() => setConfirm(selected)}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-[13px] text-zinc-500">Add a stage to begin.</div>
        )}

        <div className="space-y-5">
          <section className="rounded-lg border border-zinc-200 bg-white" aria-labelledby="wf-issues-h">
            <h3 id="wf-issues-h" className="border-b border-zinc-200 px-4 py-3 text-[13.5px] font-semibold">
              Workflow checks
            </h3>
            {issues.length === 0 ? (
              <p className="px-4 py-3 text-[13px] text-teal-800">All stages are reachable, every path ends in a terminal stage.</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {issues.map((iss, k) => (
                  <li key={k} className="flex gap-2 px-4 py-2 text-[12.5px]">
                    <span className={cx('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', iss.level === 'error' ? 'bg-red-500' : 'bg-amber-500')} aria-hidden="true" />
                    <span className="sr-only">{iss.level}:</span>
                    {iss.stageId ? (
                      <button type="button" className="text-left text-zinc-800 hover:underline" onClick={() => setSelectedId(iss.stageId!)}>
                        {iss.message}
                      </button>
                    ) : (
                      <span className="text-zinc-800">{iss.message}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <TransitionMatrix workflow={workflow} onToggle={(from, to) => {
            const s = workflow.stages.find((x) => x.id === from);
            if (!s) return;
            updateStage(from, { transitions: s.transitions.includes(to) ? s.transitions.filter((t) => t !== to) : [...s.transitions, to] });
          }} />
        </div>
      </div>

      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        size="sm"
        title={`Delete stage “${confirm?.name ?? ''}”?`}
        description="Transitions into this stage are removed. Consents collected at this stage move to the start stage."
        footer={
          <>
            <Button onClick={() => setConfirm(null)}>Cancel</Button>
            <Button
              variant="danger"
              icon={<Trash2 size={13} aria-hidden="true" />}
              onClick={() => {
                if (!confirm) return;
                const next = removeStage(config, confirm.id);
                onChange(next);
                setSelectedId(next.workflow.stages[0]?.id ?? '');
                notify(`Deleted stage “${confirm.name}”`, { tone: 'info' });
                setConfirm(null);
              }}
            >
              Delete stage
            </Button>
          </>
        }
      />
    </div>
  );
}

