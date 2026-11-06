/**
 * A deliberately tiny Markdown renderer for the bundled guides. It supports
 * the subset those files use: headings, paragraphs, fenced code, tables,
 * lists, blockquotes, rules, inline code, bold, italic and links: and emits
 * React elements (no innerHTML), so it is safe for untrusted input too.
 */
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CodeBlock } from '../ui';

export interface Heading {
  level: number;
  text: string;
  id: string;
}

export const headingId = (text: string) =>
  text
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

/** Maps repository links (docs/CONFIGURATION.md#x) to in-app routes. */
function resolveHref(href: string, docLinks: Record<string, string>): { to?: string; href?: string } {
  if (/^https?:|^mailto:/.test(href)) return { href };
  const [path, hash] = href.split('#');
  const file = path.split('/').pop()?.toUpperCase() ?? '';
  const slug = docLinks[file];
  if (slug) return { to: `/docs/${slug}${hash ? `#${hash}` : ''}` };
  if (!path && hash) return { to: `#${hash}` };
  return { href: `https://github.com/samhita-oss/pravesh/blob/main/${path}` };
}

function inline(text: string, docLinks: Record<string, string>, keyBase = 'i'): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))|(\*[^*\s][^*]*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${k++}`;
    if (tok.startsWith('`')) out.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith('**')) out.push(<strong key={key}>{inline(tok.slice(2, -2), docLinks, key)}</strong>);
    else if (tok.startsWith('[')) {
      const lm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok);
      if (lm) {
        const target = resolveHref(lm[2], docLinks);
        out.push(
          target.to ? (
            target.to.startsWith('#') ? (
              <a
                key={key}
                href={target.to}
                onClick={(e) => {
                  // In-page anchor: scroll instead of letting HashRouter treat it as a route.
                  e.preventDefault();
                  document.getElementById(target.to!.slice(1))?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {inline(lm[1], docLinks, key)}
              </a>
            ) : (
              <Link key={key} to={target.to}>
                {inline(lm[1], docLinks, key)}
              </Link>
            )
          ) : (
            <a key={key} href={target.href} target="_blank" rel="noreferrer">
              {inline(lm[1], docLinks, key)}
            </a>
          ),
        );
      }
    } else out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function extractHeadings(md: string): Heading[] {
  const hs: Heading[] = [];
  let inFence = false;
  md.split('\n').forEach((line) => {
    if (line.startsWith('```')) inFence = !inFence;
    const m = !inFence && /^(#{1,4})\s+(.*)$/.exec(line);
    if (m) hs.push({ level: m[1].length, text: m[2].replace(/`/g, ''), id: headingId(m[2]) });
  });
  return hs;
}

const splitRow = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.trim());

export function Markdown({ source, docLinks }: { source: string; docLinks: Record<string, string> }) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;
  const isBlockStart = (l: string) => /^(#{1,4}\s|```|>\s?|\s*[-*]\s|\s*\d+\.\s|\||---\s*$)/.test(l);

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';
      blocks.push(
        <Tag key={key++} id={headingId(h[2])}>
          {inline(h[2], docLinks)}
        </Tag>,
      );
      i += 1;
      continue;
    }
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++]);
      i += 1;
      blocks.push(<CodeBlock key={key++} code={body.join('\n')} title={lang || 'text'} shell={lang === 'bash'} className="my-4" />);
      continue;
    }
    if (/^---\s*$/.test(line)) {
      blocks.push(<hr key={key++} />);
      i += 1;
      continue;
    }
    if (line.startsWith('>')) {
      const body: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) body.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push(<blockquote key={key++}>{inline(body.join(' '), docLinks)}</blockquote>);
      continue;
    }
    if (line.startsWith('|')) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const [head, , ...body] = rows;
      blocks.push(
        <div key={key++} className="relative overflow-x-auto">
          <table>
            <thead>
              <tr>
                {splitRow(head).map((c, k) => (
                  <th key={k}>{inline(c, docLinks)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri}>
                  {splitRow(r).map((c, k) => (
                    <td key={k}>{inline(c.replace(/\\\|/g, '|'), docLinks)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    const listMatch = /^\s*([-*]|\d+\.)\s+/.exec(line);
    if (listMatch) {
      const ordered = /\d/.test(listMatch[1]);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ''));
        i += 1;
        // continuation lines
        while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) items[items.length - 1] += ` ${lines[i++].trim()}`;
      }
      const L = ordered ? 'ol' : 'ul';
      blocks.push(
        <L key={key++}>
          {items.map((it, k) => (
            <li key={k}>{inline(it, docLinks)}</li>
          ))}
        </L>,
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) para.push(lines[i++].trim());
    blocks.push(<p key={key++}>{inline(para.join(' '), docLinks)}</p>);
  }
  return <Fragment>{blocks}</Fragment>;
}
