import type { ApplicationRecord, PraveshConfig, StageTone, Workflow, WorkflowStage } from '../config/types';

export interface WorkflowIssue {
  level: 'error' | 'warning';
  stageId?: string;
  message: string;
}

export function stageById(workflow: Workflow, id: string): WorkflowStage | undefined {
  return workflow.stages.find((s) => s.id === id);
}

/** Stage ids reachable from the initial stage by following transitions. */
export function reachableStages(workflow: Workflow): Set<string> {
  const seen = new Set<string>();
  const ids = new Set(workflow.stages.map((s) => s.id));
  if (!ids.has(workflow.initialStage)) return seen;
  const queue = [workflow.initialStage];
  while (queue.length) {
    const id = queue.shift() as string;
    if (seen.has(id)) continue;
    seen.add(id);
    const stage = stageById(workflow, id);
    stage?.transitions.forEach((t) => {
      if (ids.has(t) && !seen.has(t)) queue.push(t);
    });
  }
  return seen;
}

/** Semantic checks for the workflow graph. */
export function validateWorkflow(workflow: Workflow): WorkflowIssue[] {
  const issues: WorkflowIssue[] = [];
  const { stages } = workflow;
  if (stages.length === 0) {
    issues.push({ level: 'error', message: 'The workflow has no stages.' });
    return issues;
  }
  const ids = new Set<string>();
  stages.forEach((s) => {
    if (ids.has(s.id)) issues.push({ level: 'error', stageId: s.id, message: `Duplicate stage id "${s.id}".` });
    ids.add(s.id);
    if (!s.name.trim()) issues.push({ level: 'error', stageId: s.id, message: `Stage "${s.id}" has no name.` });
  });

  if (!ids.has(workflow.initialStage)) {
    issues.push({ level: 'error', message: 'Initial stage is not set to an existing stage.' });
  }
  if (!ids.has(workflow.submittedStage)) {
    issues.push({ level: 'error', message: 'Submitted stage is not set to an existing stage.' });
  } else if (ids.has(workflow.initialStage)) {
    const initial = stageById(workflow, workflow.initialStage);
    if (initial && !initial.transitions.includes(workflow.submittedStage)) {
      issues.push({ level: 'error', stageId: initial.id, message: `"${initial.name}" must be able to move to the submitted stage.` });
    }
  }

  const terminals = stages.filter((s) => s.terminal);
  if (terminals.length === 0) issues.push({ level: 'error', message: 'No terminal stage. Mark at least one stage (e.g. Approved) as terminal.' });
  if (!terminals.some((s) => s.tone === 'success')) {
    issues.push({ level: 'warning', message: 'No terminal stage has the Success tone, so applicants never see a positive outcome.' });
  }

  stages.forEach((s) => {
    s.transitions.forEach((t) => {
      if (!ids.has(t)) issues.push({ level: 'error', stageId: s.id, message: `"${s.name}" transitions to unknown stage "${t}".` });
      if (t === s.id) issues.push({ level: 'error', stageId: s.id, message: `"${s.name}" transitions to itself.` });
    });
    if (s.terminal && s.transitions.length > 0) {
      issues.push({ level: 'warning', stageId: s.id, message: `"${s.name}" is terminal but still has outgoing transitions.` });
    }
    if (!s.terminal && s.transitions.length === 0) {
      issues.push({ level: 'error', stageId: s.id, message: `"${s.name}" is a dead end: it is not terminal and has no outgoing transitions.` });
    }
  });

  const reachable = reachableStages(workflow);
  if (ids.has(workflow.initialStage)) {
    stages.forEach((s) => {
      if (!reachable.has(s.id)) issues.push({ level: 'error', stageId: s.id, message: `"${s.name}" is unreachable from "${stageById(workflow, workflow.initialStage)?.name}".` });
    });
  }
  return issues;
}

/**
 * The happy path through the workflow (used for the applicant's progress bar):
 * the longest route from the initial stage to a successful terminal stage
 * that only moves forward in declared stage order, so loops such as
 * "Documents pending → Under review" are treated as detours.
 */
export function primaryPath(workflow: Workflow): WorkflowStage[] {
  const order = new Map(workflow.stages.map((s, i) => [s.id, i]));
  const memo = new Map<string, WorkflowStage[] | null>();
  const best = (id: string): WorkflowStage[] | null => {
    if (memo.has(id)) return memo.get(id)!;
    const stage = stageById(workflow, id);
    let result: WorkflowStage[] | null = null;
    if (stage) {
      if (stage.terminal) result = stage.tone === 'success' ? [stage] : null;
      else {
        for (const t of stage.transitions) {
          if ((order.get(t) ?? -1) <= (order.get(id) ?? 0)) continue;
          const tail = best(t);
          if (tail && (!result || tail.length + 1 > result.length)) result = [stage, ...tail];
        }
      }
    }
    memo.set(id, result);
    return result;
  };
  return best(workflow.initialStage) ?? greedyPath(workflow);
}

function greedyPath(workflow: Workflow): WorkflowStage[] {
  const path: WorkflowStage[] = [];
  const seen = new Set<string>();
  let current = stageById(workflow, workflow.initialStage);
  while (current && !seen.has(current.id)) {
    path.push(current);
    seen.add(current.id);
    if (current.terminal) break;
    // Prefer the next stage that heads towards a successful outcome, avoiding
    // 'warning'/'danger' detours, then fall back to declared order.
    const order = workflow.stages.map((s) => s.id);
    const candidates = current.transitions
      .map((t) => stageById(workflow, t))
      .filter((s): s is WorkflowStage => !!s && !seen.has(s.id))
      .sort((a, b) => toneRank(a.tone) - toneRank(b.tone) || order.indexOf(a.id) - order.indexOf(b.id));
    current = candidates[0];
  }
  return path;
}

function toneRank(tone: StageTone): number {
  return { info: 0, warning: 1, success: 2, neutral: 3, danger: 4 }[tone];
}

export function canTransition(workflow: Workflow, from: string, to: string): boolean {
  return !!stageById(workflow, from)?.transitions.includes(to);
}

/** Required actions on the current stage still outstanding for this application. */
export function outstandingActions(workflow: Workflow, app: ApplicationRecord): string[] {
  const stage = stageById(workflow, app.stage);
  if (!stage) return [];
  const done = app.completedActions[stage.id] ?? [];
  return stage.requiredActions.filter((a) => !done.includes(a));
}

/** Tailwind classes for a stage tone. Kept here so badges stay consistent. */
export const TONE_CLASSES: Record<StageTone, { badge: string; dot: string; ring: string }> = {
  neutral: { badge: 'bg-zinc-100 text-zinc-700 border-zinc-200', dot: 'bg-zinc-400', ring: 'border-zinc-300' },
  info: { badge: 'bg-sky-50 text-sky-800 border-sky-200', dot: 'bg-sky-500', ring: 'border-sky-300' },
  warning: { badge: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500', ring: 'border-amber-300' },
  success: { badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', ring: 'border-emerald-300' },
  danger: { badge: 'bg-red-50 text-red-800 border-red-200', dot: 'bg-red-500', ring: 'border-red-300' },
};

/* ------------------------------------------------------------------ */
/* Config-wide cascades: keep references consistent when stages change */
/* ------------------------------------------------------------------ */


export function renameStageId(config: PraveshConfig, from: string, to: string): PraveshConfig {
  const swap = (id: string) => (id === from ? to : id);
  const { workflow } = config;
  return {
    ...config,
    workflow: {
      initialStage: swap(workflow.initialStage),
      submittedStage: swap(workflow.submittedStage),
      stages: workflow.stages.map((s) => ({ ...s, id: swap(s.id), transitions: s.transitions.map(swap) })),
    },
    consents: config.consents.map((c) => ({ ...c, stage: swap(c.stage) })),
    technical: {
      ...config.technical,
      notifications: { ...config.technical.notifications, notifyOnStages: config.technical.notifications.notifyOnStages.map(swap) },
    },
  };
}

export function removeStage(config: PraveshConfig, id: string): PraveshConfig {
  const { workflow } = config;
  const stages = workflow.stages.filter((s) => s.id !== id).map((s) => ({ ...s, transitions: s.transitions.filter((t) => t !== id) }));
  const fallback = stages[0]?.id ?? '';
  const initialStage = workflow.initialStage === id ? fallback : workflow.initialStage;
  const submittedStage = workflow.submittedStage === id ? (stages.find((s) => s.id !== initialStage)?.id ?? fallback) : workflow.submittedStage;
  return {
    ...config,
    workflow: { initialStage, submittedStage, stages },
    consents: config.consents.map((c) => (c.stage === id ? { ...c, stage: initialStage } : c)),
    technical: {
      ...config.technical,
      notifications: { ...config.technical.notifications, notifyOnStages: config.technical.notifications.notifyOnStages.filter((s) => s !== id) },
    },
  };
}
