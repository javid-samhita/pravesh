import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyText } from '../../services/configIO';
import { cx } from './cx';

export interface CodeBlockProps {
  code: string;
  title?: string;
  language?: string;
  className?: string;
  /** Prefix each line with a shell prompt. */
  shell?: boolean;
  maxHeight?: number;
}

export function CopyButton({ text, label = 'Copy', className }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyText(text);
        setDone(ok);
        if (ok) window.setTimeout(() => setDone(false), 1600);
      }}
      className={cx('inline-flex items-center gap-1 rounded px-1.5 py-1 font-mono text-[11px] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100', className)}
      aria-label={done ? 'Copied' : `${label} to clipboard`}
    >
      {done ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
      {done ? 'Copied' : label}
    </button>
  );
}

export function CodeBlock({ code, title, language, className, shell, maxHeight }: CodeBlockProps) {
  const lines = code.replace(/\n$/, '').split('\n');
  return (
    <div className={cx('overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 text-zinc-100', className)}>
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
        <span className="font-mono text-[11px] text-zinc-400">{title ?? language ?? 'shell'}</span>
        <CopyButton text={shell ? lines.filter((l) => !l.startsWith('#')).join('\n') : code} />
      </div>
      <pre className="overflow-auto p-3 text-[12.5px] leading-[1.6]" style={maxHeight ? { maxHeight } : undefined}>
        <code>
          {lines.map((l, i) => (
            <div key={i} className={cx(shell && l.startsWith('#') && 'text-zinc-500')}>
              {shell && !l.startsWith('#') && l.trim() && <span className="select-none text-zinc-500">$ </span>}
              {l || ' '}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
