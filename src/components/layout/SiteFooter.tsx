import { Link } from 'react-router-dom';
import { Logo, REPO_URL, VERSION } from './Logo';

const COLS = [
  {
    title: 'Product',
    links: [
      { label: 'Configurator', to: '/wizard' },
      { label: 'Portal runtime', to: '/portal' },
      { label: 'Reviewer console', to: '/portal/admin' },
    ],
  },
  {
    title: 'Docs',
    links: [
      { label: 'Installation', to: '/docs/installation' },
      { label: 'Configuration', to: '/docs/configuration' },
      { label: 'Architecture', to: '/docs/architecture' },
      { label: 'Environment', to: '/docs/environment' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Contributing', to: '/docs/contributing' },
      { label: 'Repository', href: REPO_URL },
      { label: 'Issues', href: `${REPO_URL}/issues` },
      { label: 'Releases', href: `${REPO_URL}/releases` },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="container-page grid grid-cols-1 gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-[13px] text-zinc-500">Build your provider onboarding portal. Your way. Open source under the MIT licence.</p>
          <p className="mt-4 font-mono text-[11.5px] text-zinc-400">{VERSION} · schema 1.0</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h2 className="label-xs">{c.title}</h2>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.label}>
                  {'to' in l && l.to ? (
                    <Link to={l.to} className="text-[13px] text-zinc-600 hover:text-zinc-900">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={(l as { href: string }).href} target="_blank" rel="noreferrer" className="text-[13px] text-zinc-600 hover:text-zinc-900">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-zinc-200">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-4 text-[12px] text-zinc-500">
          <span>© 2026 Samhita Social Ventures and Pravesh contributors.</span>
          <span>Pravesh means “entry” in Hindi.</span>
        </div>
      </div>
    </footer>
  );
}
