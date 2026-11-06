import { cx } from './cx';

export interface ToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  /** Hide the visible label (still announced). */
  srOnlyLabel?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

/** Accessible switch built on a native button with role="switch". */
export function Toggle({ id, checked, onChange, label, description, srOnlyLabel, disabled, size = 'md' }: ToggleProps) {
  const track = size === 'sm' ? 'h-4 w-7' : 'h-5 w-9';
  const knob = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const shift = size === 'sm' ? 'translate-x-3' : 'translate-x-4';
  return (
    <div className="flex items-start gap-2.5">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={srOnlyLabel ? label : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative mt-0.5 inline-flex shrink-0 items-center rounded-full border transition-colors disabled:opacity-50',
          track,
          checked ? 'border-teal-700 bg-teal-700' : 'border-zinc-300 bg-zinc-200',
        )}
      >
        <span className={cx('ml-px inline-block rounded-full bg-white shadow-sm transition-transform', knob, checked && shift)} />
      </button>
      {!srOnlyLabel && (
        <label htmlFor={id} className="cursor-pointer select-none" onClick={(e) => { e.preventDefault(); if (!disabled) onChange(!checked); }}>
          <span className="block text-[13px] font-medium leading-5 text-zinc-800">{label}</span>
          {description && <span className="block text-[12.5px] leading-5 text-zinc-500">{description}</span>}
        </label>
      )}
    </div>
  );
}

export function Checkbox({ id, checked, onChange, label, description, disabled }: Omit<ToggleProps, 'srOnlyLabel' | 'size'>) {
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300 accent-teal-700"
      />
      <label htmlFor={id} className="cursor-pointer select-none">
        <span className="block text-[13px] leading-5 text-zinc-800">{label}</span>
        {description && <span className="block text-[12.5px] leading-5 text-zinc-500">{description}</span>}
      </label>
    </div>
  );
}
