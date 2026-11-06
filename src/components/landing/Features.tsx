import { Blocks, FileCheck2, GitBranch, KeyRound, LayoutTemplate, ShieldCheck } from 'lucide-react';
import { Section } from './Section';

const FEATURES = [
  { icon: LayoutTemplate, title: 'Dynamic form builder', body: 'Twelve field types, per-provider applicability, regex rules and required flags. Reorder by drag or keyboard.', tag: 'fields[]' },
  { icon: GitBranch, title: 'Visual workflow builder', body: 'Stages as a pipeline, a transitions matrix, required reviewer actions, and checks for unreachable or dead-end stages.', tag: 'workflow' },
  { icon: FileCheck2, title: 'Document requirements', body: 'Accepted formats, size limits and provider-specific rules, enforced at upload in the browser.', tag: 'documents[]' },
  { icon: ShieldCheck, title: 'Versioned consent', body: 'Collect consents at submission or at a later stage. Every grant is stored with its version and timestamp.', tag: 'consents[]' },
  { icon: KeyRound, title: 'Secrets stay server-side', body: 'Declare variable names, not values. VITE_ hygiene is validated and .env.example is generated for you.', tag: 'technical.envVars' },
  { icon: Blocks, title: 'Schema and validator', body: 'A JSON Schema for your editor and CI, plus a dependency-free validator with readable, path-addressed errors.', tag: 'schema 1.0' },
];

export function Features() {
  return (
    <Section id="features" eyebrow="Features" title="Everything an onboarding team asks for, as configuration" intro="Product, compliance and engineering edit the same file. The runtime never hard-codes a provider type, field or stage.">
      <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-zinc-200 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <article key={f.title} className="relative border-zinc-200 bg-white p-6 [&:not(:last-child)]:border-b sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(n+4)]:border-b-0">
            <div className="flex items-center justify-between">
              <f.icon size={18} className="text-zinc-900" strokeWidth={1.75} aria-hidden="true" />
              <span className="font-mono text-[11px] text-zinc-400">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="mt-5 text-[15px] font-semibold text-zinc-900">{f.title}</h3>
            <p className="mt-1.5 text-[13.5px] leading-6 text-zinc-600">{f.body}</p>
            <code className="mt-4 inline-block font-mono text-[11.5px] text-teal-700">{f.tag}</code>
          </article>
        ))}
      </div>
    </Section>
  );
}
