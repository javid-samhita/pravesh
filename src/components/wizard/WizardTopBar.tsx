import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Check, ExternalLink, FolderOpen, Loader2, RotateCcw } from 'lucide-react';
import { useConfig } from '../../config/ConfigContext';
import { EXAMPLES, cloneConfig } from '../../data/examples';
import { Button, Dialog, buttonClass, useToast } from '../ui';
import { Logo } from '../layout/Logo';

function SaveIndicator() {
  const { saveStatus, savedAt } = useConfig();
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500" role="status" aria-live="polite">
      {saveStatus === 'saving' ? (
        <>
          <Loader2 size={12} className="animate-spin" aria-hidden="true" /> Saving…
        </>
      ) : saveStatus === 'error' ? (
        <>
          <AlertCircle size={12} className="text-red-600" aria-hidden="true" /> Not saved (storage unavailable)
        </>
      ) : (
        <>
          <Check size={12} className="text-teal-700" aria-hidden="true" />
          {savedAt ? `Saved ${savedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}` : 'Saved locally'}
        </>
      )}
    </span>
  );
}

export function WizardTopBar() {
  const { config, replace, reset } = useConfig();
  const { notify } = useToast();
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white">
      <div className="flex h-14 items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Logo />
          <span className="hidden text-zinc-300 sm:inline" aria-hidden="true">
            /
          </span>
          <span className="hidden text-[13.5px] text-zinc-500 sm:inline">Configurator</span>
          <span className="hidden text-zinc-300 sm:inline" aria-hidden="true">
            /
          </span>
          <span className="hidden min-w-0 truncate text-[13.5px] font-medium text-zinc-900 sm:inline">{config.identity.name || 'Untitled'}</span>
          <span className="hidden md:inline-flex">
            <SaveIndicator />
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button size="sm" variant="ghost" icon={<FolderOpen size={14} aria-hidden="true" />} onClick={() => setExamplesOpen(true)}>
            <span className="hidden sm:inline">Load example</span>
            <span className="sr-only sm:hidden">Load example</span>
          </Button>
          <Button size="sm" variant="ghost" icon={<RotateCcw size={14} aria-hidden="true" />} onClick={() => setResetOpen(true)}>
            <span className="hidden sm:inline">Reset</span>
            <span className="sr-only sm:hidden">Reset</span>
          </Button>
          <Link to="/portal" className={buttonClass('secondary', 'sm')}>
            <ExternalLink size={14} aria-hidden="true" />
            <span className="hidden sm:inline">Open portal</span>
            <span className="sr-only sm:hidden">Open portal</span>
          </Link>
        </div>
      </div>

      <Dialog open={examplesOpen} onClose={() => setExamplesOpen(false)} title="Load an example configuration" description="Replaces your working configuration. Export it first if you want to keep it." size="lg">
        <ul className="space-y-2">
          {EXAMPLES.map((ex) => (
            <li key={ex.id}>
              <button
                type="button"
                onClick={() => {
                  replace(cloneConfig(ex.config));
                  setExamplesOpen(false);
                  notify(`Loaded “${ex.config.identity.name}”`, { body: ex.file });
                }}
                className="flex w-full items-start gap-3 rounded-md border border-zinc-200 p-3 text-left transition-colors hover:border-zinc-400 hover:bg-zinc-50"
              >
                <span className="mt-0.5 h-8 w-8 shrink-0 rounded-md" style={{ background: ex.config.identity.colors.primary }} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-zinc-900">{ex.config.identity.name}</span>
                  <span className="block text-[12.5px] text-zinc-500">{ex.summary}</span>
                  <span className="mt-1.5 flex flex-wrap gap-x-3 font-mono text-[11px] text-zinc-400">
                    <span>{ex.file}</span>
                    <span>
                      {ex.config.providerTypes.length} types · {ex.config.fields.length} fields · {ex.config.documents.length} docs · {ex.config.workflow.stages.length} stages
                    </span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Dialog>

      <Dialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        size="sm"
        title="Reset configuration?"
        description="Your working configuration is replaced with the starter template. Portal submissions are not affected."
        footer={
          <>
            <Button onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                reset();
                setResetOpen(false);
                notify('Configuration reset to the starter template', { tone: 'info' });
              }}
            >
              Reset
            </Button>
          </>
        }
      />
    </header>
  );
}
