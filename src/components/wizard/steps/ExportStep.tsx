import { useMemo, useState } from 'react';
import { ClipboardCopy, Download, FileJson, KeyRound } from 'lucide-react';
import { useConfig } from '../../../config/ConfigContext';
import type { PraveshConfig } from '../../../config/types';
import { configFileName, copyText, downloadText, generateEnvExample, readConfigFile, serializeConfig, type ImportOutcome } from '../../../services/configIO';
import { validateConfig } from '../../../services/validation';
import { Button, CodeBlock, Dialog, FileDrop, Notice, Panel, PanelHeader, useToast } from '../../ui';
import { IssueList } from '../StepHeader';

function displayJson(config: PraveshConfig): string {
  const c = config.identity.logo.length > 80 ? { ...config, identity: { ...config.identity, logo: `${config.identity.logo.slice(0, 48)}…(${config.identity.logo.length} chars)` } } : config;
  return serializeConfig(c);
}

export function ExportStep() {
  const { config, replace } = useConfig();
  const { notify } = useToast();
  const result = useMemo(() => validateConfig(config), [config]);
  const [imported, setImported] = useState<{ name: string; outcome: ImportOutcome } | null>(null);
  const json = serializeConfig(config);

  const stats = [
    ['Provider types', config.providerTypes.length],
    ['Fields', config.fields.length],
    ['Documents', config.documents.length],
    ['Stages', config.workflow.stages.length],
    ['Consents', config.consents.length],
    ['Env vars', config.technical.envVars.length],
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-6">
        <Panel>
          <PanelHeader
            title={configFileName(config)}
            description={`${(new Blob([json]).size / 1024).toFixed(1)} KB · schema ${config.schemaVersion}`}
            actions={
              <>
                <Button
                  size="sm"
                  icon={<ClipboardCopy size={14} aria-hidden="true" />}
                  onClick={async () => {
                    const ok = await copyText(json);
                    notify(ok ? 'Configuration copied to clipboard' : 'Copy failed', { tone: ok ? 'success' : 'error' });
                  }}
                >
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Download size={14} aria-hidden="true" />}
                  onClick={() => {
                    downloadText(configFileName(config), json);
                    notify(`Downloaded ${configFileName(config)}`, { body: result.valid ? undefined : 'Note: the configuration still has validation errors.' });
                  }}
                >
                  Download JSON
                </Button>
              </>
            }
          />
          <dl className="grid grid-cols-3 border-b border-zinc-200 sm:grid-cols-6">
            {stats.map(([k, v]) => (
              <div key={k} className="border-r border-zinc-100 px-4 py-3 last:border-0">
                <dt className="text-[11.5px] text-zinc-500">{k}</dt>
                <dd className="font-mono text-[18px] font-medium text-zinc-900">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="p-4">
            {result.valid ? (
              <Notice tone="success" title="Configuration is valid">
                {result.warnings.length ? `${result.warnings.length} warning(s) to review below.` : 'No errors or warnings.'}
              </Notice>
            ) : (
              <Notice tone="error" title={`${result.errors.length} error(s) must be fixed before deploying`} />
            )}
            <div className="mt-3">
              <IssueList issues={[...result.errors, ...result.warnings]} />
            </div>
            <CodeBlock code={displayJson(config)} title={configFileName(config)} maxHeight={420} />
          </div>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel>
          <PanelHeader title="Import configuration" description="Validated against the Pravesh schema before anything is replaced." />
          <div className="p-4">
            <FileDrop
              id="import-config"
              accept="application/json,.json"
              label="Choose a .json file or drop it here"
              hint="e.g. examples/lending-partner-network.json"
              onFile={async (file) => {
                const outcome = await readConfigFile(file);
                setImported({ name: file.name, outcome });
                if (!outcome.config) notify('Import failed validation', { tone: 'error', body: `${outcome.result.errors.length} error(s) in ${file.name}` });
              }}
            />
            {imported && !imported.outcome.config && (
              <div className="mt-3" role="alert">
                <p className="mb-2 text-[13px] font-medium text-red-800">
                  {imported.name} was not imported. {imported.outcome.result.errors.length} error(s):
                </p>
                <IssueList issues={imported.outcome.result.errors.slice(0, 25)} />
                {imported.outcome.result.errors.length > 25 && <p className="text-[12px] text-zinc-500">…and {imported.outcome.result.errors.length - 25} more.</p>}
              </div>
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Environment" description="Variable names declared in Technical, with empty secret values." />
          <div className="space-y-3 p-4">
            <Button
              className="w-full"
              icon={<KeyRound size={14} aria-hidden="true" />}
              onClick={() => {
                downloadText('.env.example', generateEnvExample(config), 'text/plain');
                notify('Downloaded .env.example');
              }}
            >
              Download .env.example
            </Button>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Deploy with this configuration" />
          <div className="space-y-3 p-4 text-[13px] text-zinc-600">
            <p>Serve the portal with your configuration baked in:</p>
            <CodeBlock
              shell
              code={`cp ~/Downloads/${configFileName(config)} public/pravesh.config.json\necho "VITE_PRAVESH_CONFIG_URL=./pravesh.config.json" >> .env.production\nnpm run build`}
            />
            <p>
              The <code className="font-mono text-[12px]">/portal</code> route then loads that file instead of the browser's working copy.
            </p>
          </div>
        </Panel>
      </div>

      <Dialog
        open={!!imported?.outcome.config}
        onClose={() => setImported(null)}
        title="Replace current configuration?"
        description={imported ? `${imported.name} is valid${imported.outcome.result.warnings.length ? ` with ${imported.outcome.result.warnings.length} warning(s)` : ''}.` : undefined}
        footer={
          <>
            <Button onClick={() => setImported(null)}>Cancel</Button>
            <Button
              variant="primary"
              icon={<FileJson size={14} aria-hidden="true" />}
              onClick={() => {
                if (imported?.outcome.config) {
                  replace(imported.outcome.config);
                  notify(`Imported ${imported.outcome.config.identity.name}`);
                }
                setImported(null);
              }}
            >
              Import and replace
            </Button>
          </>
        }
      >
        {imported?.outcome.config && (
          <dl className="grid grid-cols-2 gap-2 text-[13px]">
            <dt className="text-zinc-500">Portal</dt>
            <dd className="font-medium">{imported.outcome.config.identity.name}</dd>
            <dt className="text-zinc-500">Provider types</dt>
            <dd>{imported.outcome.config.providerTypes.map((p) => p.name).join(', ')}</dd>
            <dt className="text-zinc-500">Fields / documents</dt>
            <dd>
              {imported.outcome.config.fields.length} / {imported.outcome.config.documents.length}
            </dd>
            <dt className="text-zinc-500">Stages</dt>
            <dd>{imported.outcome.config.workflow.stages.length}</dd>
          </dl>
        )}
      </Dialog>
    </div>
  );
}
