import type { ReactNode } from 'react';
import { cx } from '../ui';

export function Section({ id, eyebrow, title, intro, children, className, aside }: { id: string; eyebrow: string; title: string; intro?: ReactNode; children: ReactNode; className?: string; aside?: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={cx('border-t border-zinc-200 py-16 sm:py-20', className)}>
      <div className="container-page">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="label-xs">{eyebrow}</p>
            <h2 id={`${id}-h`} className="mt-2 text-[26px] font-semibold leading-tight tracking-tight text-zinc-900 sm:text-[30px]">
              {title}
            </h2>
            {intro && <p className="mt-3 text-[15px] leading-7 text-zinc-600">{intro}</p>}
          </div>
          {aside}
        </div>
        {children}
      </div>
    </section>
  );
}
