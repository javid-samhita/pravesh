import type { ProviderType } from '../../config/types';
import { cx } from '../ui';

/**
 * Chooses which provider types an item applies to. An empty selection means
 * "all provider types", which is how the runtime interprets it too.
 */
export function ProviderTypePicker({ id, types, value, onChange, legend = 'Applies to' }: { id: string; types: ProviderType[]; value: string[]; onChange: (v: string[]) => void; legend?: string }) {
  const all = value.length === 0;
  const chip = (active: boolean) =>
    cx('rounded-md border px-2 py-1 text-[12.5px] transition-colors', active ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300');
  return (
    <fieldset id={id}>
      <legend className="mb-1.5 text-[13px] font-medium text-zinc-800">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" aria-pressed={all} className={chip(all)} onClick={() => onChange([])}>
          All provider types
        </button>
        {types.map((t) => {
          const on = value.includes(t.id);
          return (
            <button key={t.id} type="button" aria-pressed={on} className={chip(on)} onClick={() => onChange(on ? value.filter((v) => v !== t.id) : [...value, t.id])}>
              {t.name}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function appliesLabel(types: ProviderType[], ids: string[]): string {
  if (ids.length === 0) return 'All types';
  return ids.map((id) => types.find((t) => t.id === id)?.name ?? id).join(', ');
}
