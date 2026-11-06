import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Section } from './Section';

const GUIDES = [
  { slug: 'installation', title: 'Installation', body: 'Requirements, scripts, deploying dist/ and troubleshooting.' },
  { slug: 'configuration', title: 'Configuration reference', body: 'Every key in pravesh.config.json, with types and validation rules.' },
  { slug: 'architecture', title: 'Architecture', body: 'State, validation, the portal runtime and backend integration points.' },
  { slug: 'environment', title: 'Environment variables', body: 'Public VITE_ values versus server-side secrets, and .env.example.' },
  { slug: 'contributing', title: 'Contributing', body: 'Workflow, conventions and the checks every pull request passes.' },
];

export function Documentation() {
  return (
    <Section id="docs" eyebrow="Documentation" title="Guides that ship with the code" intro="The same Markdown files in the repository, rendered here.">
      <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 sm:grid-cols-2 lg:grid-cols-5">
        {GUIDES.map((g) => (
          <li key={g.slug} className="bg-white">
            <Link to={`/docs/${g.slug}`} className="group flex h-full flex-col p-5 hover:bg-zinc-50">
              <span className="flex items-center justify-between text-[14px] font-semibold text-zinc-900">
                {g.title}
                <ArrowUpRight size={15} className="text-zinc-400 transition-colors group-hover:text-zinc-900" aria-hidden="true" />
              </span>
              <span className="mt-2 text-[13px] leading-5 text-zinc-500">{g.body}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
