import { useMemo, useState, type CSSProperties } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { FIELD_TYPE_LABELS } from '../../config/defaults';
import { FIELD_TYPES, OPTION_FIELD_TYPES, type FieldDefinition, type FieldType, type FieldValue, type FileMeta, type ProviderType } from '../../config/types';
import { validateFieldValue } from '../../services/formRules';
import { readableOn } from '../../services/util';
import { Button, Field, Input, Select, Toggle } from '../ui';
import { DynamicField } from '../portal/DynamicField';
import { ProviderTypePicker } from '../wizard/ProviderTypePicker';
import { ListEditor } from '../wizard/ListEditor';

export interface FieldEditorProps {
  field: FieldDefinition;
  providerTypes: ProviderType[];
  takenIds: string[];
  brand: string;
  onChange: (f: FieldDefinition) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

/** Changes a field's type, keeping or seeding options as appropriate. */
export function changeFieldType(f: FieldDefinition, type: FieldType): FieldDefinition {
  const next: FieldDefinition = { ...f, type };
  if (OPTION_FIELD_TYPES.includes(type)) {
    next.options = f.options && f.options.length >= 2 ? f.options : ['Option 1', 'Option 2'];
  } else {
    delete next.options;
  }
  // Validation rules only exist for free-text and number inputs.
  if (type !== 'text' && type !== 'textarea' && type !== 'number') delete next.validation;
  if (type === 'number' && next.validation) {
    const { min, max } = next.validation;
    next.validation = min === undefined && max === undefined ? undefined : { min, max };
  }
  return next;
}

export function FieldEditor({ field, providerTypes, takenIds, brand, onChange, onDelete, onDuplicate }: FieldEditorProps) {
  const isOptions = OPTION_FIELD_TYPES.includes(field.type);
  const supportsText = field.type === 'text' || field.type === 'textarea';
  const [previewValue, setPreviewValue] = useState<FieldValue | undefined>(undefined);
  const [previewFile, setPreviewFile] = useState<FileMeta | undefined>(undefined);
  const [touched, setTouched] = useState(false);
  const idClash = takenIds.includes(field.id);
  const v = field.validation ?? {};
  const setValidation = (patch: Partial<NonNullable<FieldDefinition['validation']>>) => {
    const merged = { ...v, ...patch };
    (Object.keys(merged) as (keyof typeof merged)[]).forEach((k) => {
      if (merged[k] === undefined || merged[k] === '') delete merged[k];
    });
    onChange({ ...field, validation: Object.keys(merged).length ? merged : undefined });
  };
  const patternError = useMemo(() => {
    if (!v.pattern) return null;
    try {
      new RegExp(v.pattern);
      return null;
    } catch {
      return 'Not a valid regular expression.';
    }
  }, [v.pattern]);
  const previewError = touched ? validateFieldValue(field, previewValue, previewFile) : null;
  const optionCount = (field.options ?? []).filter((o) => o.trim()).length;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3">
        <div className="min-w-0">
          <p className="label-xs">Edit field</p>
          <p className="truncate text-[14px] font-semibold text-zinc-900">{field.label || 'Untitled field'}</p>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" icon={<Copy size={13} aria-hidden="true" />} onClick={onDuplicate}>
            Duplicate
          </Button>
          <Button size="sm" variant="danger" icon={<Trash2 size={13} aria-hidden="true" />} onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <Field id="fe-label" label="Label" required error={field.label.trim() ? null : 'Label is required.'}>
          <Input id="fe-label" value={field.label} invalid={!field.label.trim()} onChange={(e) => onChange({ ...field, label: e.target.value })} />
        </Field>
        <Field id="fe-id" label="Key" help="Used in exported data and the API payload." error={idClash ? 'Another field already uses this key.' : !/^[a-z0-9][a-z0-9_-]*$/.test(field.id) ? 'Lower-case letters, digits, _ or -.' : null}>
          <Input id="fe-id" mono value={field.id} invalid={idClash} onChange={(e) => onChange({ ...field, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_') })} />
        </Field>
        <Field id="fe-type" label="Field type">
          <Select id="fe-type" value={field.type} onChange={(e) => onChange(changeFieldType(field, e.target.value as FieldType))}>
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>
                {FIELD_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex items-end pb-1.5">
          <Toggle id="fe-required" checked={field.required} onChange={(required) => onChange({ ...field, required })} label="Required" description="Applicants cannot continue without it." />
        </div>
        {field.type !== 'checkbox' && field.type !== 'radio' && field.type !== 'multiselect' && field.type !== 'file' && (
          <Field id="fe-placeholder" label="Placeholder">
            <Input id="fe-placeholder" value={field.placeholder ?? ''} onChange={(e) => onChange({ ...field, placeholder: e.target.value || undefined })} />
          </Field>
        )}
        <Field id="fe-help" label="Help text" className={field.type === 'checkbox' || field.type === 'radio' || field.type === 'multiselect' || field.type === 'file' ? 'sm:col-span-2' : undefined}>
          <Input id="fe-help" value={field.helpText ?? ''} onChange={(e) => onChange({ ...field, helpText: e.target.value || undefined })} />
        </Field>

        {isOptions && (
          <Field id="fe-options-new" label="Options" className="sm:col-span-2" error={optionCount < 2 ? 'Add at least two options.' : null} help="Press Enter to add. Order is preserved.">
            <ListEditor id="fe-options-new" items={field.options ?? []} onChange={(options) => onChange({ ...field, options })} placeholder="New option" addLabel="Add option" />
          </Field>
        )}

        {(supportsText || field.type === 'number') && (
          <details className="rounded-md border border-zinc-200 sm:col-span-2" open={!!field.validation}>
            <summary className="cursor-pointer select-none px-3 py-2 text-[13px] font-medium text-zinc-800">Validation rules</summary>
            <div className="grid grid-cols-1 gap-3 border-t border-zinc-200 p-3 sm:grid-cols-2">
              {field.type === 'number' ? (
                <>
                  <Field id="fe-min" label="Minimum">
                    <Input id="fe-min" type="number" value={v.min ?? ''} onChange={(e) => setValidation({ min: e.target.value === '' ? undefined : Number(e.target.value) })} />
                  </Field>
                  <Field id="fe-max" label="Maximum">
                    <Input id="fe-max" type="number" value={v.max ?? ''} onChange={(e) => setValidation({ max: e.target.value === '' ? undefined : Number(e.target.value) })} />
                  </Field>
                </>
              ) : (
                <>
                  <Field id="fe-minlen" label="Min length">
                    <Input id="fe-minlen" type="number" min={0} value={v.minLength ?? ''} onChange={(e) => setValidation({ minLength: e.target.value === '' ? undefined : Number(e.target.value) })} />
                  </Field>
                  <Field id="fe-maxlen" label="Max length">
                    <Input id="fe-maxlen" type="number" min={0} value={v.maxLength ?? ''} onChange={(e) => setValidation({ maxLength: e.target.value === '' ? undefined : Number(e.target.value) })} />
                  </Field>
                  <Field id="fe-pattern" label="Pattern (regex)" error={patternError} help="Anchored automatically, e.g. [A-Z]{5}[0-9]{4}[A-Z]">
                    <Input id="fe-pattern" mono value={v.pattern ?? ''} invalid={!!patternError} onChange={(e) => setValidation({ pattern: e.target.value || undefined })} />
                  </Field>
                  <Field id="fe-patmsg" label="Pattern error message">
                    <Input id="fe-patmsg" value={v.patternMessage ?? ''} onChange={(e) => setValidation({ patternMessage: e.target.value || undefined })} />
                  </Field>
                </>
              )}
            </div>
          </details>
        )}

        <div className="sm:col-span-2">
          <ProviderTypePicker id="fe-applies" types={providerTypes} value={field.providerTypes} onChange={(providerTypes) => onChange({ ...field, providerTypes })} />
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-zinc-50/70 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="label-xs">Live field preview</p>
          <button type="button" className="text-[12px] text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline" onClick={() => setTouched(true)}>
            Test validation
          </button>
        </div>
        <div
          className="grid grid-cols-1 rounded-md border border-zinc-200 bg-white p-4 sm:grid-cols-2"
          style={{ '--brand': brand, '--brand-fg': readableOn(brand), '--brand-soft': `${brand}12` } as CSSProperties}
          onBlur={() => setTouched(true)}
        >
          <DynamicField
            field={field}
            idPrefix="fe-preview"
            value={previewValue}
            file={previewFile}
            error={previewError}
            onChange={setPreviewValue}
            onFile={setPreviewFile}
          />
        </div>
      </div>
    </div>
  );
}

