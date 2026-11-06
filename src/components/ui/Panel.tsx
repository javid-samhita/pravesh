import type { ReactNode } from 'react';
import { cx } from './cx';

export function Panel({ children, className, as: Tag = 'section' }: { children: ReactNode; className?: string; as?: 'section' | 'div' | 'article' }) {
  return <Tag className={cx('rounded-lg border border-zinc-200 bg-white', className)}>{children}</Tag>;
}

export function PanelHeader({ title, description, actions, className }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <div className={cx('flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3', className)}>
      <div className="min-w-0">
        <h3 className="text-[13.5px] font-semibold text-zinc-900">{title}</h3>
        {description && <p className="mt-0.5 text-[12.5px] text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      {icon && <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-500">{icon}</div>}
      <p className="text-[13.5px] font-medium text-zinc-900">{title}</p>
      {body && <p className="mt-1 max-w-sm text-[13px] text-zinc-500">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Notice({ tone = 'info', title, children }: { tone?: 'info' | 'warning' | 'error' | 'success'; title?: ReactNode; children?: ReactNode }) {
  const tones = {
    info: 'border-zinc-200 bg-zinc-50 text-zinc-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    success: 'border-teal-200 bg-teal-50 text-teal-900',
  };
  return (
    <div className={cx('rounded-md border px-3 py-2.5 text-[13px]', tones[tone])} role={tone === 'error' ? 'alert' : undefined}>
      {title && <p className="font-medium">{title}</p>}
      {children && <div className={cx(title ? 'mt-0.5' : undefined, 'opacity-90')}>{children}</div>}
    </div>
  );
}
