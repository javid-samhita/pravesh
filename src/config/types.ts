/**
 * Pravesh configuration model.
 *
 * A single `PraveshConfig` object fully describes an onboarding portal:
 * who runs it, which kinds of providers can apply, what they must fill in
 * and upload, how an application moves through review, which consents are
 * captured and how the portal talks to the outside world.
 *
 * The JSON Schema in `schema/pravesh.config.schema.json` mirrors these types.
 * Keep both in sync when you change the model.
 */

export const SCHEMA_VERSION = '1.0' as const;

export const FIELD_TYPES = [
  'text',
  'number',
  'email',
  'mobile',
  'date',
  'dropdown',
  'multiselect',
  'radio',
  'checkbox',
  'file',
  'textarea',
  'url',
] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

/** Field types whose value is chosen from `options`. */
export const OPTION_FIELD_TYPES: readonly FieldType[] = ['dropdown', 'multiselect', 'radio'];

export const STAGE_TONES = ['neutral', 'info', 'warning', 'success', 'danger'] as const;
export type StageTone = (typeof STAGE_TONES)[number];

export const WEBHOOK_EVENTS = [
  'application.submitted',
  'application.stage_changed',
  'application.approved',
  'application.rejected',
  'document.uploaded',
  'consent.recorded',
] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export const INTEGRATION_KINDS = ['kyc', 'gst', 'bank', 'esign', 'crm', 'registry', 'other'] as const;
export type IntegrationKind = (typeof INTEGRATION_KINDS)[number];

export const NOTIFICATION_CHANNELS = ['email', 'sms', 'webhook'] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export interface BrandColors {
  /** Buttons, active states, header accents. Hex, e.g. `#0F766E`. */
  primary: string;
  /** Secondary highlight (badges, progress). Hex. */
  accent: string;
}

export interface Identity {
  name: string;
  tagline?: string;
  description: string;
  /** Data URL (from the wizard upload) or absolute/relative URL. Empty string for none. */
  logo: string;
  colors: BrandColors;
  supportEmail: string;
  website: string;
}

export interface ProviderType {
  id: string;
  name: string;
  description: string;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  /** ECMAScript regular expression source, anchored by the runtime. */
  pattern?: string;
  patternMessage?: string;
}

export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  /** Only for dropdown / multiselect / radio. */
  options?: string[];
  /** Provider type ids this field applies to. Empty array = all provider types. */
  providerTypes: string[];
  validation?: FieldValidation;
}

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  /** Lower-case file extensions without the dot, e.g. `pdf`, `jpg`. */
  acceptedTypes: string[];
  maxSizeMB: number;
  required: boolean;
  /** Provider type ids. Empty array = all provider types. */
  providerTypes: string[];
}

export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  tone: StageTone;
  /** A terminal stage ends the application lifecycle (e.g. Approved, Rejected). */
  terminal: boolean;
  /** Checklist a reviewer completes before moving the application forward. */
  requiredActions: string[];
  /** Ids of stages this stage may move to. */
  transitions: string[];
}

export interface Workflow {
  /** Stage an application is created in while the applicant is filling it. */
  initialStage: string;
  /** Stage an application enters when the applicant presses Submit. */
  submittedStage: string;
  stages: WorkflowStage[];
}

export interface ConsentRequirement {
  id: string;
  title: string;
  description: string;
  purpose: string;
  required: boolean;
  /** Workflow stage id at which the consent is collected. */
  stage: string;
  /** Free-form version label recorded with every grant, e.g. `2026.1`. */
  version: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  /** NAME of the environment variable holding the signing secret. Never the secret itself. */
  secretEnv: string;
  enabled: boolean;
}

export interface Integration {
  id: string;
  name: string;
  kind: IntegrationKind;
  baseUrl: string;
  /** NAME of the environment variable holding the credential. */
  credentialEnv: string;
  enabled: boolean;
}

export interface CallbackUrls {
  onSubmit: string;
  onApproved: string;
  onRejected: string;
}

export interface NotificationSettings {
  channels: NotificationChannel[];
  senderEmail: string;
  /** Workflow stage ids that trigger an applicant notification. */
  notifyOnStages: string[];
}

export interface EnvVarDeclaration {
  /** UPPER_SNAKE_CASE. Client-exposed variables must start with `VITE_`. */
  name: string;
  description: string;
  /** Secrets are server-side only and must never be `VITE_`-prefixed. */
  secret: boolean;
  required: boolean;
  /** Non-secret example value written to `.env.example`. Ignored for secrets. */
  example: string;
}

export interface TechnicalConfig {
  apiBaseUrl: string;
  webhooks: Webhook[];
  callbacks: CallbackUrls;
  integrations: Integration[];
  notifications: NotificationSettings;
  envVars: EnvVarDeclaration[];
}

export interface PraveshConfig {
  $schema?: string;
  schemaVersion: typeof SCHEMA_VERSION;
  /** Stable slug; scopes stored applications to this configuration. */
  id: string;
  identity: Identity;
  providerTypes: ProviderType[];
  fields: FieldDefinition[];
  documents: DocumentRequirement[];
  workflow: Workflow;
  consents: ConsentRequirement[];
  technical: TechnicalConfig;
}

/* ------------------------------------------------------------------ */
/* Runtime (portal) records                                            */
/* ------------------------------------------------------------------ */

export type FieldValue = string | string[] | boolean;

export interface FileMeta {
  name: string;
  size: number;
  type: string;
}

export interface ConsentRecord {
  consentId: string;
  title: string;
  version: string;
  stage: string;
  grantedAt: string;
}

export interface StageEvent {
  from: string | null;
  to: string;
  at: string;
  actor: 'applicant' | 'reviewer' | 'system';
  note?: string;
}

export interface ApplicationRecord {
  id: string;
  configId: string;
  providerType: string;
  organisation: string;
  values: Record<string, FieldValue>;
  files: Record<string, FileMeta>;
  documents: Record<string, FileMeta>;
  consents: ConsentRecord[];
  stage: string;
  /** stageId → completed required actions. */
  completedActions: Record<string, string[]>;
  history: StageEvent[];
  createdAt: string;
  updatedAt: string;
}
