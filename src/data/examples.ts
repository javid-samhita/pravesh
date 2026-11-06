/**
 * Example configurations bundled with the app. The JSON files in
 * `/examples` are the single source of truth; they are imported here so the
 * "Load example" picker and the repository examples can never drift apart.
 */
import type { PraveshConfig } from '../config/types';
import partners from '../../examples/implementation-partner-network.json';
import employment from '../../examples/employment-ecosystem.json';
import lending from '../../examples/lending-partner-network.json';

export interface ExamplePreset {
  id: string;
  file: string;
  title: string;
  summary: string;
  config: PraveshConfig;
}

export const EXAMPLES: ExamplePreset[] = [
  {
    id: 'implementation-partner-network',
    file: 'examples/implementation-partner-network.json',
    title: 'Implementation partner network',
    summary: 'NGOs, social enterprises and training institutes. CSR-1 and 12A/80G checks, site visit.',
    config: partners as unknown as PraveshConfig,
  },
  {
    id: 'employment-ecosystem',
    file: 'examples/employment-ecosystem.json',
    title: 'Employment ecosystem',
    summary: 'Employers, training partners and placement agencies with a site-visit stage.',
    config: employment as unknown as PraveshConfig,
  },
  {
    id: 'lending-partner-network',
    file: 'examples/lending-partner-network.json',
    title: 'Lending partner network',
    summary: 'Banks, NBFCs and loan service providers. Due diligence, credit committee, API certification.',
    config: lending as unknown as PraveshConfig,
  },
];

export function cloneConfig(config: PraveshConfig): PraveshConfig {
  return JSON.parse(JSON.stringify(config)) as PraveshConfig;
}
