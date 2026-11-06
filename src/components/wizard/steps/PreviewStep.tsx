import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, RotateCcw } from 'lucide-react';
import { useConfig } from '../../../config/ConfigContext';
import { createMemoryApplicationStore } from '../../../services/storage';
import { validateConfig } from '../../../services/validation';
import { Button, Notice, buttonClass } from '../../ui';
import { PortalRuntime } from '../../portal/PortalRuntime';
import type { PortalView } from '../../portal/types';

export function PreviewStep() {
  const { config } = useConfig();
  const [seed, setSeed] = useState(0);
  const store = useMemo(() => createMemoryApplicationStore(), [seed]);
  const [view, setView] = useState<PortalView>({ name: 'apply' });
  const result = useMemo(() => validateConfig(config), [config]);

  return (
    <div className="space-y-4">
      {!result.valid && (
        <Notice tone="warning" title={`${result.errors.length} configuration error${result.errors.length > 1 ? 's' : ''}`}>
          The preview still renders, but fix these before exporting. See the Export step for the full list.
        </Notice>
      )}
      <div className="overflow-hidden rounded-lg border border-zinc-300 shadow-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-200 bg-zinc-100 px-3 py-2">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          </span>
          <span className="min-w-0 flex-1 truncate rounded border border-zinc-200 bg-white px-2 py-0.5 font-mono text-[11.5px] text-zinc-500">
            {(config.identity.website || 'https://onboarding.example').replace(/\/$/, '')}/apply
          </span>
          <span className="rounded border border-amber-200 bg-amber-50 px-1.5 font-mono text-[10.5px] font-medium text-amber-800">SANDBOX</span>
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw size={13} aria-hidden="true" />}
            onClick={() => {
              setSeed((s) => s + 1);
              setView({ name: 'apply' });
            }}
          >
            Reset
          </Button>
          <Link to="/portal" className={buttonClass('secondary', 'sm')}>
            <ExternalLink size={13} aria-hidden="true" /> Open full portal
          </Link>
        </div>
        <div data-testid="portal-preview">
          <PortalRuntime key={seed} config={config} store={store} view={view} onNavigate={setView} embedded />
        </div>
      </div>
      <p className="text-[12.5px] text-zinc-500">Preview submissions are kept in memory only. The full portal at /portal persists submissions in this browser.</p>
    </div>
  );
}
