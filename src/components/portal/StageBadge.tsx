import type { WorkflowStage } from '../../config/types';
import { TONE_CLASSES } from '../../services/workflow';
import { cx } from '../ui';

export function StageBadge({ stage, fallback }: { stage?: WorkflowStage; fallback?: string }) {
  const tone = TONE_CLASSES[stage?.tone ?? 'neutral'];
  return (
    <span className={cx('inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded border px-2 text-[12px] font-medium', tone.badge)}>
      <span className={cx('h-1.5 w-1.5 rounded-full', tone.dot)} aria-hidden="true" />
      {stage?.name ?? fallback ?? 'Unknown stage'}
    </span>
  );
}
