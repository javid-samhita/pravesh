import { BookOpen, Eye, FileText, Folder, GitFork, Scale, Star, Tag } from 'lucide-react';
import { REPO_URL, VERSION } from '../layout/Logo';
import { buttonClass } from '../ui';
import { Section } from './Section';

const TREE = [
  { name: 'docs', dir: true, msg: 'docs: document VITE_ prefix rules', when: '2 days ago' },
  { name: 'examples', dir: true, msg: 'examples: add lending partner network', when: 'last week' },
  { name: 'schema', dir: true, msg: 'schema: require submittedStage', when: 'last week' },
  { name: 'src', dir: true, msg: 'workflow: flag unreachable stages', when: '2 days ago' },
  { name: '.env.example', dir: false, msg: 'chore: split public and server vars', when: '3 weeks ago' },
  { name: 'LICENSE', dir: false, msg: 'Initial commit', when: '8 months ago' },
  { name: 'README.md', dir: false, msg: 'docs: deployment section', when: '2 days ago' },
];

const LANGS = [
  { name: 'TypeScript', pct: 91.4, color: '#3178C6' },
  { name: 'CSS', pct: 4.1, color: '#663399' },
  { name: 'JavaScript', pct: 2.9, color: '#F1E05A' },
  { name: 'HTML', pct: 1.6, color: '#E34C26' },
];

export function Repository() {
  return (
    <Section id="github" eyebrow="GitHub" title="Built in the open" intro="Issues, discussions and releases happen on GitHub. Repository statistics below are illustrative placeholders for this prototype.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="self-start overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
            <div className="flex items-center gap-2 text-[14px]">
              <BookOpen size={15} className="text-zinc-500" aria-hidden="true" />
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="hover:underline">
                <span className="text-zinc-600">samhita-oss</span> <span className="text-zinc-400">/</span> <span className="font-semibold text-zinc-900">pravesh</span>
              </a>
              <span className="rounded-full border border-zinc-300 px-2 text-[11px] font-medium text-zinc-600">Public</span>
            </div>
            <div className="flex gap-1.5">
              {[
                { icon: Eye, label: 'Watch', n: '38' },
                { icon: GitFork, label: 'Fork', n: '184' },
                { icon: Star, label: 'Star', n: '1.2k' },
              ].map((b) => (
                <a key={b.label} href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex h-7 items-center overflow-hidden rounded-md border border-zinc-200 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50">
                  <span className="inline-flex items-center gap-1.5 px-2">
                    <b.icon size={13} aria-hidden="true" /> {b.label}
                  </span>
                  <span className="border-l border-zinc-200 bg-zinc-50 px-2 font-mono text-[11px]">{b.n}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50/70 px-4 py-2 text-[12.5px]">
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 font-mono text-[9px] text-white">AK</span>
              <span className="truncate text-zinc-600">
                <span className="font-medium text-zinc-900">akshara-k</span> workflow: flag unreachable stages (#212)
              </span>
            </span>
            <span className="hidden shrink-0 font-mono text-[11.5px] text-zinc-500 sm:inline">a3f9c1e · 2 days ago · 486 commits</span>
          </div>
          <ul>
            {TREE.map((f) => (
              <li key={f.name} className="grid grid-cols-[minmax(0,160px)_minmax(0,1fr)_auto] items-center gap-4 border-b border-zinc-100 px-4 py-2 text-[13px] last:border-0">
                <span className="flex items-center gap-2 truncate text-zinc-900">
                  {f.dir ? <Folder size={14} className="shrink-0 fill-zinc-300 text-zinc-400" aria-hidden="true" /> : <FileText size={14} className="shrink-0 text-zinc-400" aria-hidden="true" />}
                  {f.name}
                </span>
                <span className="truncate text-zinc-500">{f.msg}</span>
                <span className="whitespace-nowrap text-[12px] text-zinc-400">{f.when}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-5 text-[13px]">
          <div>
            <h3 className="font-semibold text-zinc-900">About</h3>
            <p className="mt-1.5 text-zinc-600">Configuration-driven provider onboarding portals. Form builder, workflow builder, JSON Schema, static deploy.</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['onboarding', 'kyb', 'react', 'typescript', 'json-schema', 'csr', 'vite'].map((t) => (
                <span key={t} className="rounded-full bg-teal-50 px-2 py-0.5 text-[11.5px] font-medium text-teal-800">
                  {t}
                </span>
              ))}
            </div>
            <ul className="mt-3 space-y-1.5 text-zinc-600">
              <li className="flex items-center gap-2">
                <Scale size={13} aria-hidden="true" /> MIT licence
              </li>
              <li className="flex items-center gap-2">
                <Tag size={13} aria-hidden="true" /> {VERSION} · Latest release
              </li>
              <li className="flex items-center gap-2">
                <Star size={13} aria-hidden="true" /> 1.2k stars · <GitFork size={13} aria-hidden="true" /> 184 forks
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900">Languages</h3>
            <div className="mt-2 flex h-2 overflow-hidden rounded-full">
              {LANGS.map((l) => (
                <span key={l.name} style={{ width: `${l.pct}%`, background: l.color }} />
              ))}
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-zinc-600">
              {LANGS.map((l) => (
                <li key={l.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: l.color }} aria-hidden="true" />
                  <span className="font-medium text-zinc-800">{l.name}</span> {l.pct}%
                </li>
              ))}
            </ul>
          </div>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className={buttonClass('secondary', 'md', 'w-full')}>
            github.com/samhita-oss/pravesh
          </a>
        </aside>
      </div>
    </Section>
  );
}
