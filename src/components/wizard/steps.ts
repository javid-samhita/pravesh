import { Blocks, Download, Eye, FileStack, Fingerprint, GitBranch, ListChecks, ServerCog, ShieldCheck, type LucideIcon } from 'lucide-react';

export interface WizardStepMeta {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: LucideIcon;
  /** Validation path prefixes that belong to this step. */
  paths: string[];
}

export const WIZARD_STEPS: WizardStepMeta[] = [
  { slug: 'identity', title: 'Application identity', short: 'Identity', description: 'Name, logo, brand colours and contact details shown in the portal header and footer.', icon: Fingerprint, paths: ['identity', 'config'] },
  { slug: 'providers', title: 'Provider categories', short: 'Provider types', description: 'The kinds of organisations that can apply. Fields and documents can target specific types.', icon: Blocks, paths: ['providerTypes'] },
  { slug: 'fields', title: 'Business information fields', short: 'Business fields', description: 'Build the application form. Drag to reorder, or use the arrow buttons.', icon: ListChecks, paths: ['fields'] },
  { slug: 'documents', title: 'Document requirements', short: 'Documents', description: 'Files applicants upload, with accepted formats, size limits and applicability.', icon: FileStack, paths: ['documents'] },
  { slug: 'workflow', title: 'Review workflow', short: 'Workflow', description: 'Stages an application moves through, and which moves are allowed between them.', icon: GitBranch, paths: ['workflow'] },
  { slug: 'consents', title: 'Consent requirements', short: 'Consents', description: 'Versioned consents collected from applicants at a specific workflow stage.', icon: ShieldCheck, paths: ['consents'] },
  { slug: 'technical', title: 'Technical configuration', short: 'Technical', description: 'API, webhooks, callbacks, integrations, notifications and environment variables.', icon: ServerCog, paths: ['technical'] },
  { slug: 'preview', title: 'Live preview', short: 'Preview', description: 'The generated portal, rendered from your current configuration. Submissions here are sandboxed.', icon: Eye, paths: [] },
  { slug: 'export', title: 'Export configuration', short: 'Export', description: 'Download or copy the configuration, import an existing one, and generate .env.example.', icon: Download, paths: [] },
];
