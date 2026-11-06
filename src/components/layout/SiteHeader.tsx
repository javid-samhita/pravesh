import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Github, Menu, X } from 'lucide-react';
import { Logo, REPO_URL, VERSION } from './Logo';
import { buttonClass, cx } from '../ui';

const LINKS = [
  { to: '/docs', label: 'Docs' },
  { to: '/wizard', label: 'Configurator' },
  { to: '/portal', label: 'Portal' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="hidden rounded border border-zinc-200 px-1.5 font-mono text-[11px] text-zinc-500 sm:inline">{VERSION}</span>
          </div>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => cx('rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors', isActive ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-900')}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className={buttonClass('ghost', 'sm')}>
            <Github size={15} aria-hidden="true" /> GitHub
          </a>
          <Link to="/wizard" className={buttonClass('primary', 'sm')}>
            Get started
          </Link>
        </div>
        <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 md:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-zinc-200 bg-white md:hidden">
          <div className="container-page flex flex-col py-2">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className="rounded-md px-2 py-2.5 text-[14px] text-zinc-800 hover:bg-zinc-50">
                {l.label}
              </NavLink>
            ))}
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="rounded-md px-2 py-2.5 text-[14px] text-zinc-800 hover:bg-zinc-50">
              GitHub
            </a>
            <Link to="/wizard" className={buttonClass('primary', 'md', 'mt-2')}>
              Get started
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
