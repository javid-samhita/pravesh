import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '../ui';

/** Editable list of short strings (options, required actions, …). */
export function ListEditor({ id, items, onChange, placeholder, addLabel = 'Add', mono }: { id: string; items: string[]; onChange: (v: string[]) => void; placeholder?: string; addLabel?: string; mono?: boolean }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setDraft('');
  };
  return (
    <div>
      {items.length > 0 && (
        <ul className="mb-2 space-y-1">
          {items.map((it, i) => (
            <li key={`${it}-${i}`} className="flex items-center gap-1.5">
              <Input
                aria-label={`Item ${i + 1}`}
                value={it}
                mono={mono}
                onChange={(e) => onChange(items.map((x, k) => (k === i ? e.target.value : x)))}
                className="h-8"
              />
              <button type="button" onClick={() => onChange(items.filter((_, k) => k !== i))} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900" aria-label={`Remove ${it || `item ${i + 1}`}`}>
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-1.5">
        <Input
          id={id}
          value={draft}
          mono={mono}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          className="h-8"
        />
        <button type="button" onClick={add} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-zinc-200 px-2.5 text-[12.5px] font-medium text-zinc-800 hover:bg-zinc-50">
          <Plus size={13} aria-hidden="true" /> {addLabel}
        </button>
      </div>
    </div>
  );
}
