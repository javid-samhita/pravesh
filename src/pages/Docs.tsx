import { useEffect, useMemo } from 'react';
import { Link, NavLink, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { SiteHeader } from '../components/layout/SiteHeader';
import { SiteFooter } from '../components/layout/SiteFooter';
import { REPO_URL } from '../components/layout/Logo';
import { Markdown, extractHeadings } from '../components/docs/Markdown';
import { DOCS, DOC_LINKS } from '../data/docs';
import { Select, cx } from '../components/ui';

export default function Docs() {
  const { slug = 'overview' } = useParams();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const doc = DOCS.find((d) => d.slug === slug);
  const headings = useMemo(() => (doc ? extractHeadings(doc.source).filter((h) => h.level === 2) : []), [doc]);

  useEffect(() => {
    if (!doc) return;
    document.title = `${doc.title} · Pravesh docs`;
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo({ top: 0 });
  }, [doc, hash]);

  if (!doc) return <Navigate to="/docs" replace />;
  const idx = DOCS.indexOf(doc);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="container-page grid grid-cols-1 flex-1 gap-8 py-8 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_200px]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="lg:hidden">
            <label htmlFor="docs-select" className="label-xs mb-1.5 block">
              Guide
            </label>
            <Select id="docs-select" value={doc.slug} onChange={(e) => navigate(`/docs/${e.target.value}`)}>
              {DOCS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.title}
                </option>
              ))}
            </Select>
          </div>
          <nav aria-label="Documentation" className="hidden lg:block">
            <p className="label-xs mb-2">Guides</p>
            <ul className="space-y-0.5">
              {DOCS.map((d) => (
                <li key={d.slug}>
                  <NavLink to={`/docs/${d.slug}`} end className={({ isActive }) => cx('block rounded-md px-2 py-1.5 text-[13px]', isActive ? 'bg-zinc-100 font-medium text-zinc-900' : 'text-zinc-600 hover:text-zinc-900')}>
                    {d.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="doc-prose min-w-0 max-w-[760px]">
          <p className="mb-3 font-mono text-[11.5px] text-zinc-400">{doc.file}</p>
          <Markdown source={doc.source} docLinks={DOC_LINKS} />
          <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-zinc-200 pt-5 text-[13px]">
            {idx > 0 ? (
              <Link to={`/docs/${DOCS[idx - 1].slug}`} className="no-underline">
                ← {DOCS[idx - 1].title}
              </Link>
            ) : (
              <span />
            )}
            {idx < DOCS.length - 1 && (
              <Link to={`/docs/${DOCS[idx + 1].slug}`} className="no-underline">
                {DOCS[idx + 1].title} →
              </Link>
            )}
          </div>
        </article>

        <aside className="hidden xl:block xl:sticky xl:top-20 xl:self-start">
          {headings.length > 0 && (
            <nav aria-label="On this page">
              <p className="label-xs mb-2">On this page</p>
              <ul className="space-y-1 border-l border-zinc-200">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#/docs/${doc.slug}#${h.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="-ml-px block border-l border-transparent pl-3 text-[12.5px] text-zinc-500 hover:border-zinc-400 hover:text-zinc-900"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <a href={`${REPO_URL}/blob/main/${doc.file}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-1.5 text-[12.5px] text-zinc-500 hover:text-zinc-900">
            <ExternalLink size={12} aria-hidden="true" /> Edit on GitHub
          </a>
        </aside>
      </div>
      <SiteFooter />
    </div>
  );
}
