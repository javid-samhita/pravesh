import type { ReactNode } from 'react';
import { cx } from './cx';

export function Badge({ children, className, mono }: { children: ReactNode; className?: string; mono?: boolean }) {
  return (
    <span
      className={cx(
        'inline-flex h-5 items-center gap-1 whitespace-nowrap rounded border px-1.5 text-[11.5px] font-medium',
        mono && 'font-mono text-[11px]',
        className ?? 'border-zinc-200 bg-zinc-50 text-zinc-700',
      )}
    >
      {children}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 font-mono text-[11px] text-zinc-600">{children}</kbd>;
}
