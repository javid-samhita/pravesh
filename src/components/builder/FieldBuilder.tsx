import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { FIELD_TYPE_LABELS } from '../../config/defaults';
import { FIELD_TYPES, OPTION_FIELD_TYPES, type FieldDefinition, type FieldType, type ProviderType } from '../../config/types';
import { slugify, uniqueId } from '../../services/util';
import { Button, Dialog, EmptyState, Panel, cx, useToast } from '../ui';
import { appliesLabel } from '../wizard/ProviderTypePicker';
import { FieldEditor } from './FieldEditor';
import { FIELD_TYPE_ICONS } from './fieldTypeIcons';
import { SortableList } from './SortableList';

export interface FieldBuilderProps {
  fields: FieldDefinition[];
  providerTypes: ProviderType[];
  brand: string;
  onChange: (fields: FieldDefinition[]) => void;
}

/**
 * Dynamic form builder: add, edit, delete, duplicate and reorder fields.
 * Fields are addressed by array index while editing so that renaming a key
 * never loses the selection.
 */
export function FieldBuilder({ fields, providerTypes, brand, onChange }: FieldBuilderProps) {
  const { notify } = useToast();
  const [selected, setSelected] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);

  useEffect(() => {
    if (selected > fields.length - 1) setSelected(Math.max(0, fields.length - 1));
  }, [fields.length, selected]);

  const add = (type: FieldType) => {
    const label = `${FIELD_TYPE_LABELS[type]} field`;
    const f: FieldDefinition = {
      id: uniqueId(slugify(label, 'field'), fields.map((x) => x.id)),
      label,
      type,
      required: false,
      providerTypes: [],
      ...(OPTION_FIELD_TYPES.includes(type) ? { options: ['Option 1', 'Option 2'] } : {}),
    };
    onChange([...fields, f]);
    setSelected(fields.length);
    setPickerOpen(false);
    notify(`Added ${FIELD_TYPE_LABELS[type].toLowerCase()} field`);
    window.setTimeout(() => document.getElementById('fe-label')?.focus(), 30);
  };

  const remove = (i: number) => {
    const removed = fields[i];
    onChange(fields.filter((_, k) => k !== i));
    setConfirmIndex(null);
    notify(`Deleted “${removed.label}”`, { tone: 'info' });
  };

  const duplicate = (i: number) => {
    const src = fields[i];
    const copy: FieldDefinition = JSON.parse(JSON.stringify(src));
    copy.id = uniqueId(`${src.id}_copy`, fields.map((x) => x.id));
    copy.label = `${src.label} (copy)`;
    const next = fields.slice();
    next.splice(i + 1, 0, copy);
    onChange(next);
    setSelected(i + 1);
  };

  const current = fields[selected];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <Panel className="self-start overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3">
          <div>
            <h3 className="text-[13.5px] font-semibold">Form fields</h3>
            <p className="text-[12px] text-zinc-500">
              {fields.length} field{fields.length === 1 ? '' : 's'} · {fields.filter((f) => f.required).length} required
            </p>
          </div>
          <Button size="sm" variant="primary" icon={<Plus size={14} aria-hidden="true" />} onClick={() => setPickerOpen(true)}>
            Add field
          </Button>
        </div>
        {fields.length === 0 ? (
          <EmptyState title="No fields yet" body="Add the information applicants must provide about their business." action={<Button onClick={() => setPickerOpen(true)}>Add your first field</Button>} />
        ) : (
          <SortableList
            ariaLabel="Form fields. Use the move up and move down buttons to reorder."
            items={fields}
            getKey={(f) => `${fields.indexOf(f)}:${f.id}`}
            getLabel={(f) => f.label}
            selectedKey={current ? `${selected}:${current.id}` : undefined}
            onSelect={(f) => setSelected(fields.indexOf(f))}
            onReorder={(next) => {
              const cur = fields[selected];
              onChange(next);
              setSelected(Math.max(0, next.indexOf(cur)));
            }}
            renderItem={(f) => {
              const Icon = FIELD_TYPE_ICONS[f.type];
              return (
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-zinc-200 bg-white text-zinc-500">
                    <Icon size={14} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-medium text-zinc-900">{f.label || 'Untitled'}</span>
                      {f.required && <span className="text-[12px] text-red-600" aria-label="required">*</span>}
                    </span>
                    <span className="block truncate text-[11.5px] text-zinc-500">
                      {FIELD_TYPE_LABELS[f.type]} · {appliesLabel(providerTypes, f.providerTypes)}
                    </span>
                  </span>
                </span>
              );
            }}
          />
        )}
      </Panel>

      <Panel className="min-w-0 self-start">
        {current ? (
          <FieldEditor
            key={selected}
            field={current}
            providerTypes={providerTypes}
            brand={brand}
            takenIds={fields.filter((_, k) => k !== selected).map((f) => f.id)}
            onChange={(f) => onChange(fields.map((x, k) => (k === selected ? f : x)))}
            onDelete={() => setConfirmIndex(selected)}
            onDuplicate={() => duplicate(selected)}
          />
        ) : (
          <EmptyState title="Select a field" body="Choose a field on the left to edit its properties." />
        )}
      </Panel>

      <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)} title="Add a field" description="Pick an input type. You can change it later." size="md">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FIELD_TYPES.map((t, i) => {
            const Icon = FIELD_TYPE_ICONS[t];
            return (
              <button
                key={t}
                type="button"
                data-autofocus={i === 0 ? true : undefined}
                onClick={() => add(t)}
                className={cx('flex items-center gap-2.5 rounded-md border border-zinc-200 px-3 py-2.5 text-left text-[13px] font-medium text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-zinc-50')}
              >
                <Icon size={15} className="text-zinc-500" aria-hidden="true" />
                {FIELD_TYPE_LABELS[t]}
              </button>
            );
          })}
        </div>
      </Dialog>

      <Dialog
        open={confirmIndex !== null}
        onClose={() => setConfirmIndex(null)}
        size="sm"
        title={`Delete “${confirmIndex !== null ? fields[confirmIndex]?.label : ''}”?`}
        description="Applicants will no longer be asked for this information."
        footer={
          <>
            <Button onClick={() => setConfirmIndex(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => confirmIndex !== null && remove(confirmIndex)}>
              Delete field
            </Button>
          </>
        }
      />
    </div>
  );
}
