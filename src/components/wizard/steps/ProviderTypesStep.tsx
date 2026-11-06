import { useState } from 'react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { useConfig } from '../../../config/ConfigContext';
import { PROVIDER_TYPE_PRESETS } from '../../../config/defaults';
import type { PraveshConfig, ProviderType } from '../../../config/types';
import { slugify, uniqueId } from '../../../services/util';
import { Button, Dialog, EmptyState, Field, IconButton, Input, Panel, PanelHeader, Textarea, useToast } from '../../ui';

function usage(config: PraveshConfig, id: string) {
  return {
    fields: config.fields.filter((f) => f.providerTypes.includes(id)).length,
    documents: config.documents.filter((d) => d.providerTypes.includes(id)).length,
  };
}

export function ProviderTypesStep() {
  const { config, set, replace } = useConfig();
  const { notify } = useToast();
  const types = config.providerTypes;
  const [editing, setEditing] = useState<ProviderType | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ProviderType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startNew = () => {
    setIsNew(true);
    setError(null);
    setEditing({ id: '', name: '', description: '' });
  };

  const save = () => {
    if (!editing) return;
    const name = editing.name.trim();
    if (!name) {
      setError('Name is required.');
      return;
    }
    if (isNew) {
      const id = uniqueId(slugify(name, 'provider'), types.map((t) => t.id));
      set('providerTypes', [...types, { ...editing, id, name }]);
      notify(`Added provider type “${name}”`);
    } else {
      set('providerTypes', types.map((t) => (t.id === editing.id ? { ...editing, name } : t)));
    }
    setEditing(null);
  };

  const remove = (t: ProviderType) => {
    // Cascade: drop references so fields/documents don't point at a missing type.
    const strip = (ids: string[]) => ids.filter((x) => x !== t.id);
    replace({
      ...config,
      providerTypes: types.filter((x) => x.id !== t.id),
      fields: config.fields.map((f) => ({ ...f, providerTypes: strip(f.providerTypes) })),
      documents: config.documents.map((d) => ({ ...d, providerTypes: strip(d.providerTypes) })),
    });
    notify(`Removed “${t.name}”`, { tone: 'info' });
    setConfirmDelete(null);
  };

  const presetsAvailable = PROVIDER_TYPE_PRESETS.filter((p) => !types.some((t) => t.id === p.id));
  const deleteUsage = confirmDelete ? usage(config, confirmDelete.id) : null;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <Panel>
        <PanelHeader
          title={`Provider types (${types.length})`}
          description="Applicants pick one of these first. Order here is the order shown in the portal."
          actions={
            <Button size="sm" variant="primary" icon={<Plus size={14} aria-hidden="true" />} onClick={startNew}>
              Custom type
            </Button>
          }
        />
        {types.length === 0 ? (
          <EmptyState title="No provider types" body="Add a preset from the list or create a custom provider type." />
        ) : (
          <ul className="divide-y divide-zinc-100">
            {types.map((t) => {
              const u = usage(config, t.id);
              return (
                <li key={t.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[14px] font-medium text-zinc-900">{t.name}</p>
                      <code className="font-mono text-[11.5px] text-zinc-500">{t.id}</code>
                    </div>
                    <p className="text-[13px] text-zinc-500">{t.description || 'No description'}</p>
                    {(u.fields > 0 || u.documents > 0) && (
                      <p className="mt-1 text-[12px] text-zinc-400">
                        Targeted by {u.fields} field{u.fields === 1 ? '' : 's'} and {u.documents} document{u.documents === 1 ? '' : 's'}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    <IconButton
                      label={`Edit ${t.name}`}
                      onClick={() => {
                        setIsNew(false);
                        setError(null);
                        setEditing({ ...t });
                      }}
                    >
                      <Pencil size={14} />
                    </IconButton>
                    <IconButton label={`Delete ${t.name}`} onClick={() => setConfirmDelete(t)}>
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel className="self-start">
        <PanelHeader title="Presets" description="Common categories. Click to add." />
        <ul className="p-2">
          {PROVIDER_TYPE_PRESETS.map((p) => {
            const added = types.some((t) => t.id === p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={added}
                  onClick={() => {
                    set('providerTypes', [...types, { ...p }]);
                    notify(`Added “${p.name}”`);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-zinc-50 disabled:cursor-default disabled:hover:bg-transparent"
                >
                  <span className={added ? 'text-zinc-400' : 'text-zinc-800'}>{p.name}</span>
                  {added ? <Check size={14} className="text-teal-700" aria-label="Added" /> : <Plus size={14} className="text-zinc-400" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
        {presetsAvailable.length === 0 && <p className="px-4 pb-3 text-[12px] text-zinc-500">All presets added.</p>}
      </Panel>

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title={isNew ? 'New provider type' : 'Edit provider type'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={save}>
              {isNew ? 'Add type' : 'Save changes'}
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <Field id="pt-name" label="Name" required error={error}>
              <Input id="pt-name" data-autofocus value={editing.name} invalid={!!error} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Warehouse operator" />
            </Field>
            <Field id="pt-desc" label="Description" help="Shown under the option when applicants choose their type.">
              <Textarea id="pt-desc" rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Field>
            {!isNew && (
              <p className="text-[12px] text-zinc-500">
                Id <code className="font-mono">{editing.id}</code> stays fixed so existing references keep working.
              </p>
            )}
          </div>
        )}
      </Dialog>

      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title={`Delete “${confirmDelete?.name ?? ''}”?`}
        size="sm"
        description={
          deleteUsage && (deleteUsage.fields || deleteUsage.documents)
            ? `It is targeted by ${deleteUsage.fields} field(s) and ${deleteUsage.documents} document(s). Those references will be removed.`
            : 'This provider type is not referenced elsewhere.'
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => confirmDelete && remove(confirmDelete)}>
              Delete
            </Button>
          </>
        }
      />
    </div>
  );
}
