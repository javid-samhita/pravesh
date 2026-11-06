import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { EXAMPLES } from '../../data/examples';
import { readableOn } from '../../services/util';
import { CopyButton, buttonClass } from '../ui';
import { VERSION } from '../layout/Logo';

const example = EXAMPLES[0].config;

function SnippetLine({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="flex">
      <span className="w-7 shrink-0 select-none pr-3 text-right text-zinc-600">{n}</span>
      <span className="whitespace-pre">{children}</span>
    </div>
  );
}

const K = ({ children }: { children: string }) => <span className="text-zinc-400">"{children}"</span>;
const S = ({ children }: { children: string }) => <span className="text-teal-300">"{children}"</span>;
const B = ({ children }: { children: string }) => <span className="text-amber-200">{children}</span>;

export function Hero() {
  const primary = example.identity.colors.primary;
  const seller = example.fields.filter((f) => f.providerTypes.length === 0 || f.providerTypes.includes('seller')).slice(0, 4);
  return (
    <section className="grid-bg border-b border-zinc-200">
      <div className="container-page grid grid-cols-1 gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-center lg:gap-16 lg:py-24">
        <div className="min-w-0">
          <Link to="/docs/overview" className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[12.5px] text-zinc-600 hover:border-zinc-300">
            <span className="font-mono text-[11px] text-teal-700">{VERSION}</span>
            <span className="h-3 w-px bg-zinc-200" aria-hidden="true" />
            Visual workflow builder and schema 1.0
            <ArrowRight size={12} aria-hidden="true" />
          </Link>
          <h1 className="mt-6 max-w-xl text-[36px] font-semibold leading-[1.08] tracking-[-0.025em] text-zinc-950 sm:text-[46px] lg:text-[52px]">Build your provider onboarding portal. Your way.</h1>
          <p className="mt-5 max-w-lg text-[16px] leading-7 text-zinc-600">
            Pravesh is an open-source starter kit for onboarding sellers, lenders, employers and service providers. Describe your process in one JSON file. Get a working portal, a reviewer
            console and a schema you can version.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/wizard" className={buttonClass('primary', 'md', 'h-10 px-4')}>
              Get started <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link to="/docs" className={buttonClass('secondary', 'md', 'h-10 px-4')}>
              <BookOpen size={15} aria-hidden="true" /> View documentation
            </Link>
          </div>
          <div className="mt-8 inline-flex max-w-full items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 py-1.5 pl-3 pr-1.5 font-mono text-[12.5px] text-zinc-200">
            <span className="select-none text-zinc-500">$</span>
            <span className="truncate">npx degit samhita-oss/pravesh my-portal</span>
            <CopyButton text="npx degit samhita-oss/pravesh my-portal" />
          </div>
        </div>

        {/* Config → portal visual, rendered from the bundled example */}
        <div className="relative min-w-0" aria-label="A configuration file and the portal it generates" role="img">
          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-pop">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 font-mono text-[11px] text-zinc-500">
              <span>examples/implementation-partner-network.json</span>
              <span>JSON</span>
            </div>
            <pre className="overflow-hidden px-1 py-3 font-mono text-[12px] leading-[1.7] text-zinc-300">
              <SnippetLine n={1}>{'{'}</SnippetLine>
              <SnippetLine n={2}>
                {'  '}
                <K>id</K>: <S>{example.id}</S>,
              </SnippetLine>
              <SnippetLine n={3}>
                {'  '}
                <K>identity</K>: {'{ '}
                <K>name</K>: <S>{example.identity.name}</S> {'},'}
              </SnippetLine>
              <SnippetLine n={4}>
                {'  '}
                <K>providerTypes</K>: [{example.providerTypes.map((p, i) => (
                  <span key={p.id}>
                    <S>{p.id}</S>
                    {i < example.providerTypes.length - 1 ? ', ' : ''}
                  </span>
                ))}],
              </SnippetLine>
              <SnippetLine n={5}>
                {'  '}
                <K>fields</K>: [{'{ '}
                <K>id</K>: <S>gstin</S>, <K>required</K>: <B>true</B> {'}, …],'}
              </SnippetLine>
              <SnippetLine n={6}>
                {'  '}
                <K>workflow</K>: {'{ '}
                <K>stages</K>: [<span className="text-zinc-500">{example.workflow.stages.length} stages</span>] {'}'}
              </SnippetLine>
              <SnippetLine n={7}>{'}'}</SnippetLine>
            </pre>
          </div>
          <div className="relative -mt-6 ml-6 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-pop sm:ml-16">
            <div className="h-1" style={{ background: primary }} />
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-semibold" style={{ background: primary, color: readableOn(primary) }}>
                  BC
                </span>
                <span className="text-[12.5px] font-semibold text-zinc-900">{example.identity.name}</span>
              </div>
              <span className="font-mono text-[10.5px] text-zinc-400">/portal</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 px-4 py-3.5">
              {seller.map((f) => (
                <div key={f.id}>
                  <p className="mb-1 truncate text-[10.5px] font-medium text-zinc-700">
                    {f.label}
                    {f.required && <span className="text-red-600">*</span>}
                  </p>
                  <div className="h-6 rounded border border-zinc-200 px-1.5 text-[10px] leading-6 text-zinc-400">{f.placeholder ?? (f.type === 'dropdown' ? 'Select…' : '')}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5">
              <span className="text-[10.5px] text-zinc-500">Step 2 of 4 · Business information</span>
              <span className="rounded px-2 py-1 text-[10.5px] font-medium" style={{ background: primary, color: readableOn(primary) }}>
                Continue
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
