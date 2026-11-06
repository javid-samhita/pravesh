/** Guides rendered by the in-app documentation page (imported as raw text). */
import readme from '../../README.md?raw';
import installation from '../../docs/INSTALLATION.md?raw';
import configuration from '../../docs/CONFIGURATION.md?raw';
import architecture from '../../docs/ARCHITECTURE.md?raw';
import environment from '../../docs/ENVIRONMENT.md?raw';
import contributing from '../../CONTRIBUTING.md?raw';

export interface DocPage {
  slug: string;
  title: string;
  file: string;
  source: string;
}

export const DOCS: DocPage[] = [
  { slug: 'overview', title: 'Overview', file: 'README.md', source: readme },
  { slug: 'installation', title: 'Installation', file: 'docs/INSTALLATION.md', source: installation },
  { slug: 'configuration', title: 'Configuration reference', file: 'docs/CONFIGURATION.md', source: configuration },
  { slug: 'architecture', title: 'Architecture', file: 'docs/ARCHITECTURE.md', source: architecture },
  { slug: 'environment', title: 'Environment variables', file: 'docs/ENVIRONMENT.md', source: environment },
  { slug: 'contributing', title: 'Contributing', file: 'CONTRIBUTING.md', source: contributing },
];

/** Upper-cased file name → slug, for resolving links between guides. */
export const DOC_LINKS: Record<string, string> = Object.fromEntries(DOCS.map((d) => [d.file.split('/').pop()!.toUpperCase(), d.slug]));
