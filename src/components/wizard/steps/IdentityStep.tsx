import { useState } from 'react';
import { Check, ImageOff, Trash2, TriangleAlert } from 'lucide-react';
import { useConfig } from '../../../config/ConfigContext';
import type { Identity } from '../../../config/types';
import { contrastRatio, isHexColor, readableOn, slugify } from '../../../services/util';
import { Button, Field, FileDrop, Input, Panel, PanelHeader, Textarea, cx } from '../../ui';
import { BrandMark } from '../../portal/BrandMark';

const MAX_LOGO_BYTES = 256 * 1024;

function ColorInput({ id, label, value, onChange, help }: { id: string; label: string; value: string; onChange: (v: string) => void; help: string }) {
  const [text, setText] = useState(value);
  const [prev, setPrev] = useState(value);
  if (prev !== value) {
    setPrev(value);
    setText(value);
  }
  const valid = isHexColor(text);
  return (
    <Field id={id} label={label} help={help} error={valid ? null : 'Use a 6-digit hex colour, e.g. #0F766E.'}>
      <div className="flex items-center gap-2">
        <input type="color" aria-label={`${label} picker`} value={isHexColor(value) ? value : '#000000'} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-9 w-11 shrink-0 cursor-pointer rounded-md border border-zinc-200 bg-white p-1" />
        <Input
          id={id}
          mono
          value={text}
          invalid={!valid}
          maxLength={7}
          onChange={(e) => {
            const v = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
            setText(v);
            if (isHexColor(v)) onChange(v.toUpperCase());
          }}
        />
      </div>
    </Field>
  );
}

function ContrastRow({ label, fg, bg }: { label: string; fg: string; bg: string }) {
  const ratio = contrastRatio(fg, bg);
  const aa = ratio >= 4.5;
  const aaLarge = ratio >= 3;
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-10 items-center justify-center rounded border border-zinc-200 font-semibold" style={{ background: bg, color: fg }}>
          Aa
        </span>
        <span className="text-zinc-700">{label}</span>
      </div>
      <span className="flex items-center gap-2">
        <span className="font-mono text-zinc-500">{ratio.toFixed(2)}:1</span>
        <span className={cx('inline-flex items-center gap-1 rounded border px-1.5 font-mono text-[11px]', aa ? 'border-teal-200 bg-teal-50 text-teal-800' : aaLarge ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-red-200 bg-red-50 text-red-700')}>
          {aa ? <Check size={11} aria-hidden="true" /> : <TriangleAlert size={11} aria-hidden="true" />}
          {aa ? 'AA' : aaLarge ? 'AA large' : 'Fail'}
        </span>
      </span>
    </div>
  );
}

export function IdentityStep() {
  const { config, set } = useConfig();
  const { identity } = config;
  const [logoError, setLogoError] = useState<string | null>(null);
  const update = (patch: Partial<Identity>) => set('identity', { ...identity, ...patch });

  const onLogo = (file: File) => {
    setLogoError(null);
    if (!/^image\/(png|svg\+xml|jpeg|webp)$/.test(file.type)) {
      setLogoError('Use a PNG, SVG, JPG or WebP image.');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError('Logo must be 256 KB or smaller. It is embedded in the configuration as a data URL.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update({ logo: String(reader.result) });
    reader.onerror = () => setLogoError('Could not read that file.');
    reader.readAsDataURL(file);
  };

  const emailOk = !identity.supportEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.supportEmail);
  const webOk = !identity.website || /^https?:\/\/\S+\.\S+/.test(identity.website);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <Panel>
          <PanelHeader title="Basics" description="Shown in the portal header and used as the configuration id." />
          <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2">
            <Field id="id-name" label="Application name" required error={identity.name.trim() ? null : 'Give your portal a name.'}>
              <Input id="id-name" value={identity.name} invalid={!identity.name.trim()} onChange={(e) => update({ name: e.target.value })} />
            </Field>
            <Field id="id-slug" label="Configuration id" help="Lower-case slug. Scopes stored applications to this config.">
              <div className="flex gap-1.5">
                <Input id="id-slug" mono value={config.id} onChange={(e) => set('id', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))} />
                <Button size="md" variant="secondary" onClick={() => set('id', slugify(identity.name, 'portal').replace(/_/g, '-'))}>
                  From name
                </Button>
              </div>
            </Field>
            <Field id="id-tagline" label="Tagline" className="sm:col-span-2" help="One line under the name in the portal header.">
              <Input id="id-tagline" value={identity.tagline ?? ''} onChange={(e) => update({ tagline: e.target.value })} />
            </Field>
            <Field id="id-desc" label="Description" className="sm:col-span-2" help="Introduces the application form to applicants.">
              <Textarea id="id-desc" rows={3} value={identity.description} onChange={(e) => update({ description: e.target.value })} />
            </Field>
            <Field id="id-email" label="Support email" error={emailOk ? null : 'Enter a valid email address.'}>
              <Input id="id-email" type="email" value={identity.supportEmail} invalid={!emailOk} onChange={(e) => update({ supportEmail: e.target.value })} />
            </Field>
            <Field id="id-web" label="Website" error={webOk ? null : 'Start with https://'}>
              <Input id="id-web" type="url" value={identity.website} invalid={!webOk} onChange={(e) => update({ website: e.target.value })} />
            </Field>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Logo" description="PNG, SVG, JPG or WebP up to 256 KB. Stored inline as a data URL." />
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50">
              {identity.logo ? <img src={identity.logo} alt="Logo preview" className="max-h-16 max-w-16 object-contain" /> : <ImageOff size={20} className="text-zinc-400" aria-label="No logo" />}
            </div>
            <div className="flex-1 space-y-2">
              <FileDrop id="id-logo" accept="image/png,image/svg+xml,image/jpeg,image/webp" onFile={onLogo} label={identity.logo ? 'Replace logo' : 'Upload logo'} hint="Square images work best (at least 128 × 128)." invalid={!!logoError} />
              {logoError && <p className="text-[12.5px] text-red-700">{logoError}</p>}
              {identity.logo && (
                <Button size="sm" variant="ghost" icon={<Trash2 size={13} aria-hidden="true" />} onClick={() => update({ logo: '' })}>
                  Remove logo
                </Button>
              )}
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Brand colours" description="Primary drives buttons and active states; accent is used sparingly." />
          <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2">
            <ColorInput id="id-primary" label="Primary" value={identity.colors.primary} onChange={(v) => update({ colors: { ...identity.colors, primary: v } })} help="Buttons, progress, selected states." />
            <ColorInput id="id-accent" label="Accent" value={identity.colors.accent} onChange={(v) => update({ colors: { ...identity.colors, accent: v } })} help="Highlights and secondary emphasis." />
          </div>
          <div className="border-t border-zinc-200 px-4 py-2">
            <p className="label-xs pt-1">Contrast check (WCAG 2.1)</p>
            <div className="divide-y divide-zinc-100">
              <ContrastRow label="Button text on primary" fg={readableOn(identity.colors.primary)} bg={identity.colors.primary} />
              <ContrastRow label="Primary as text on white" fg={identity.colors.primary} bg="#FFFFFF" />
              <ContrastRow label="Accent as text on white" fg={identity.colors.accent} bg="#FFFFFF" />
            </div>
          </div>
        </Panel>
      </div>

      <aside className="xl:sticky xl:top-20 xl:self-start">
        <p className="label-xs mb-2">Header preview</p>
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <div className="h-1" style={{ background: identity.colors.primary }} />
          <div className="flex items-center gap-2.5 border-b border-zinc-200 px-3 py-3">
            <BrandMark identity={identity} size={30} />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold">{identity.name || 'Untitled portal'}</p>
              <p className="truncate text-[11.5px] text-zinc-500">{identity.tagline}</p>
            </div>
          </div>
          <div className="space-y-3 bg-zinc-50 p-3">
            <p className="text-[12.5px] leading-5 text-zinc-600">{identity.description}</p>
            <div className="flex gap-2">
              <span className="inline-flex h-8 items-center rounded-md px-3 text-[12.5px] font-medium" style={{ background: identity.colors.primary, color: readableOn(identity.colors.primary) }}>
                Continue
              </span>
              <span className="inline-flex h-8 items-center rounded-md border px-2 text-[12px] font-medium" style={{ borderColor: identity.colors.accent, color: identity.colors.accent }}>
                Accent
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
