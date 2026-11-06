import { useId, useRef, useState, type ReactNode } from 'react';
import { Upload } from 'lucide-react';
import { cx } from './cx';

export interface FileDropProps {
  id?: string;
  accept?: string;
  onFile: (file: File) => void;
  hint?: ReactNode;
  label?: string;
  invalid?: boolean;
  compact?: boolean;
  describedBy?: string;
}

/** Click or drag-and-drop file picker backed by a real file input. */
export function FileDrop({ id, accept, onFile, hint, label = 'Choose a file or drag it here', invalid, compact, describedBy }: FileDropProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className={cx(
        'relative flex items-center gap-3 rounded-md border border-dashed bg-white transition-colors',
        compact ? 'px-3 py-2.5' : 'px-4 py-4',
        over ? 'border-teal-600 bg-teal-50/40' : invalid ? 'border-red-300' : 'border-zinc-300 hover:border-zinc-400',
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-500">
        <Upload size={15} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <label htmlFor={inputId} className="cursor-pointer text-[13px] font-medium text-zinc-800 after:absolute after:inset-0">
          {label}
        </label>
        {hint && <p className="text-[12px] text-zinc-500">{hint}</p>}
      </div>
      <input
        ref={ref}
        id={inputId}
        type="file"
        accept={accept}
        aria-describedby={describedBy}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          if (ref.current) ref.current.value = '';
        }}
      />
    </div>
  );
}
