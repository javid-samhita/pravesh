import { FileText, X } from 'lucide-react';
import type { FieldDefinition, FieldValue, FileMeta } from '../../config/types';
import { formatBytes } from '../../services/util';
import { Field, FileDrop, Input, Select, Textarea, cx, describedBy } from '../ui';

export interface DynamicFieldProps {
  field: FieldDefinition;
  value: FieldValue | undefined;
  file?: FileMeta;
  error?: string | null;
  idPrefix: string;
  onChange: (value: FieldValue) => void;
  onFile: (file: FileMeta | undefined) => void;
}

const INPUT_TYPE: Partial<Record<FieldDefinition['type'], string>> = {
  text: 'text',
  number: 'number',
  email: 'email',
  mobile: 'tel',
  date: 'date',
  url: 'url',
};

/** Renders one configured field. Every input type in the schema is handled here. */
export function DynamicField({ field, value, file, error, idPrefix, onChange, onFile }: DynamicFieldProps) {
  const id = `${idPrefix}-${field.id}`;
  const help = field.helpText;
  const aria = describedBy(id, error, help);
  const str = typeof value === 'string' ? value : '';
  const arr = Array.isArray(value) ? value : [];

  if (field.type === 'checkbox') {
    return (
      <div className="sm:col-span-2">
        <div className="flex items-start gap-2.5">
          <input
            id={id}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            aria-invalid={!!error || undefined}
            aria-describedby={aria}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand)]"
          />
          <label htmlFor={id} className="text-[13.5px] leading-6 text-zinc-800">
            {field.label}
            {field.required && <span className="ml-0.5 text-red-600" aria-hidden="true">*</span>}
          </label>
        </div>
        {error ? <p id={`${id}-error`} className="ml-6 mt-1 text-[12.5px] text-red-700">{error}</p> : help ? <p id={`${id}-help`} className="ml-6 mt-1 text-[12.5px] text-zinc-500">{help}</p> : null}
      </div>
    );
  }

  if (field.type === 'radio' || field.type === 'multiselect') {
    const multi = field.type === 'multiselect';
    return (
      <fieldset className="sm:col-span-2" aria-describedby={aria} aria-invalid={!!error || undefined}>
        <legend className="mb-1.5 text-[13px] font-medium text-zinc-800">
          {field.label}
          {field.required && <span className="ml-0.5 text-red-600" aria-hidden="true">*</span>}
          {multi && <span className="ml-1.5 font-normal text-zinc-500">Select all that apply</span>}
        </legend>
        <div className="flex flex-wrap gap-2">
          {(field.options ?? []).map((opt, i) => {
            const checked = multi ? arr.includes(opt) : str === opt;
            const optId = `${id}-${i}`;
            return (
              <label
                key={opt}
                htmlFor={optId}
                className={cx(
                  'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-[13px] transition-colors',
                  checked ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-zinc-900' : 'border-zinc-200 text-zinc-700 hover:border-zinc-300',
                )}
              >
                <input
                  id={optId}
                  type={multi ? 'checkbox' : 'radio'}
                  name={id}
                  checked={checked}
                  onChange={() => {
                    if (multi) onChange(checked ? arr.filter((o) => o !== opt) : [...arr, opt]);
                    else onChange(opt);
                  }}
                  className="h-3.5 w-3.5 accent-[var(--brand)]"
                />
                {opt}
              </label>
            );
          })}
        </div>
        {error ? <p id={`${id}-error`} className="mt-1.5 text-[12.5px] text-red-700">{error}</p> : help ? <p id={`${id}-help`} className="mt-1.5 text-[12.5px] text-zinc-500">{help}</p> : null}
      </fieldset>
    );
  }

  const wide = field.type === 'textarea' || field.type === 'file';
  return (
    <Field id={id} label={field.label} required={field.required} help={help} error={error} className={wide ? 'sm:col-span-2' : undefined}>
      {field.type === 'textarea' ? (
        <Textarea id={id} value={str} placeholder={field.placeholder} invalid={!!error} aria-describedby={aria} onChange={(e) => onChange(e.target.value)} />
      ) : field.type === 'dropdown' ? (
        <Select id={id} value={str} invalid={!!error} aria-describedby={aria} onChange={(e) => onChange(e.target.value)}>
          <option value="">{field.placeholder || 'Select…'}</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      ) : field.type === 'file' ? (
        file ? (
          <div className="flex items-center gap-3 rounded-md border border-zinc-200 px-3 py-2">
            <FileText size={16} className="text-zinc-500" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-zinc-800">{file.name}</p>
              <p className="text-[12px] text-zinc-500">{formatBytes(file.size)}</p>
            </div>
            <button type="button" onClick={() => onFile(undefined)} className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900" aria-label={`Remove ${file.name}`}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <FileDrop id={id} compact invalid={!!error} describedBy={aria} hint="Any common format, up to 10 MB" onFile={(f) => onFile({ name: f.name, size: f.size, type: f.type })} />
        )
      ) : field.type === 'mobile' ? (
        <div className="flex">
          <span className="inline-flex h-9 items-center rounded-l-md border border-r-0 border-zinc-200 bg-zinc-50 px-2.5 font-mono text-[12.5px] text-zinc-500">+91</span>
          <Input id={id} type="tel" inputMode="numeric" autoComplete="tel-national" value={str} placeholder={field.placeholder || '98765 43210'} invalid={!!error} aria-describedby={aria} className="rounded-l-none" onChange={(e) => onChange(e.target.value)} />
        </div>
      ) : (
        <Input
          id={id}
          type={INPUT_TYPE[field.type] ?? 'text'}
          value={str}
          placeholder={field.placeholder}
          invalid={!!error}
          aria-describedby={aria}
          min={field.validation?.min}
          max={field.validation?.max}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}
