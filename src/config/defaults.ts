import type {
  DocumentRequirement,
  FieldType,
  PraveshConfig,
  ProviderType,
  StageTone,
  WorkflowStage,
} from './types';
import { SCHEMA_VERSION } from './types';

/** Preset provider categories offered in step 2 of the wizard. */
export const PROVIDER_TYPE_PRESETS: ProviderType[] = [
  { id: 'seller', name: 'Seller', description: 'Businesses that list and sell products or services.' },
  { id: 'buyer', name: 'Buyer', description: 'Buyer-side applications or procurement organisations.' },
  { id: 'logistics', name: 'Logistics', description: 'Delivery, warehousing and fulfilment partners.' },
  { id: 'technology', name: 'Technology', description: 'Platforms and service providers integrating via API.' },
  { id: 'financial_institution', name: 'Financial Institution', description: 'Banks, NBFCs and payment service providers.' },
  { id: 'employer', name: 'Employer', description: 'Organisations hiring through the network.' },
];

/** Preset document requirements offered in step 4. */
export const DOCUMENT_PRESETS: Omit<DocumentRequirement, 'providerTypes'>[] = [
  { id: 'business_registration', name: 'Business registration', description: 'Certificate of incorporation, partnership deed or shop establishment licence.', acceptedTypes: ['pdf'], maxSizeMB: 5, required: true },
  { id: 'pan', name: 'PAN', description: 'PAN card of the business entity.', acceptedTypes: ['pdf', 'jpg', 'png'], maxSizeMB: 2, required: true },
  { id: 'gst', name: 'GST certificate', description: 'Form GST REG-06.', acceptedTypes: ['pdf'], maxSizeMB: 5, required: true },
  { id: 'address_proof', name: 'Address proof', description: 'Utility bill, rent agreement or property tax receipt, not older than 3 months.', acceptedTypes: ['pdf', 'jpg', 'png'], maxSizeMB: 5, required: true },
  { id: 'bank_statement', name: 'Bank statement', description: 'Last 6 months of the primary business account.', acceptedTypes: ['pdf'], maxSizeMB: 10, required: false },
  { id: 'authorization_letter', name: 'Authorization letter', description: 'Letter or board resolution authorising the signatory.', acceptedTypes: ['pdf'], maxSizeMB: 5, required: true },
];

export const FILE_TYPE_OPTIONS = ['pdf', 'jpg', 'png', 'webp', 'docx', 'xlsx', 'csv', 'zip'];

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'Text',
  number: 'Number',
  email: 'Email',
  mobile: 'Mobile',
  date: 'Date',
  dropdown: 'Dropdown',
  multiselect: 'Multi-select',
  radio: 'Radio',
  checkbox: 'Checkbox',
  file: 'File upload',
  textarea: 'Text area',
  url: 'URL',
};

export const TONE_LABELS: Record<StageTone, string> = {
  neutral: 'Neutral',
  info: 'In progress',
  warning: 'Needs attention',
  success: 'Success',
  danger: 'Negative',
};

export const DEFAULT_STAGES: WorkflowStage[] = [
  { id: 'draft', name: 'Draft', description: 'Applicant is completing the application.', tone: 'neutral', terminal: false, requiredActions: [], transitions: ['submitted'] },
  { id: 'submitted', name: 'Submitted', description: 'Application received and awaiting a reviewer.', tone: 'info', terminal: false, requiredActions: ['Assign reviewer'], transitions: ['under_review'] },
  { id: 'under_review', name: 'Under review', description: 'Business information is being verified.', tone: 'info', terminal: false, requiredActions: ['Verify business registration'], transitions: ['documents_pending', 'verification', 'rejected'] },
  { id: 'documents_pending', name: 'Documents pending', description: 'Additional documents requested from the applicant.', tone: 'warning', terminal: false, requiredActions: [], transitions: ['under_review'] },
  { id: 'verification', name: 'Verification', description: 'Documents and bank details are verified.', tone: 'info', terminal: false, requiredActions: ['Verify documents', 'Bank account check'], transitions: ['technical_review', 'approved', 'rejected'] },
  { id: 'technical_review', name: 'Technical review', description: 'API integration is tested in a sandbox.', tone: 'warning', terminal: false, requiredActions: ['Sandbox tests pass'], transitions: ['approved', 'rejected'] },
  { id: 'approved', name: 'Approved', description: 'Provider is onboarded.', tone: 'success', terminal: true, requiredActions: [], transitions: [] },
  { id: 'rejected', name: 'Rejected', description: 'Application was declined.', tone: 'danger', terminal: true, requiredActions: [], transitions: [] },
];

/** Configuration a new project starts from. */
export function createDefaultConfig(): PraveshConfig {
  return {
    $schema: './schema/pravesh.config.schema.json',
    schemaVersion: SCHEMA_VERSION,
    id: 'my-provider-network',
    identity: {
      name: 'Acme Provider Network',
      tagline: 'Join our network as a service provider.',
      description: 'Apply to become a verified provider. Most applications are reviewed within five working days.',
      logo: '',
      colors: { primary: '#18181B', accent: '#0D9488' },
      supportEmail: 'support@acme.example',
      website: 'https://acme.example',
    },
    providerTypes: [PROVIDER_TYPE_PRESETS[0], PROVIDER_TYPE_PRESETS[2]],
    fields: [
      { id: 'legal_name', label: 'Legal business name', type: 'text', required: true, placeholder: 'As on your registration certificate', providerTypes: [] },
      { id: 'gstin', label: 'GSTIN', type: 'text', required: true, placeholder: '29ABCDE1234F1Z5', helpText: '15-character GST identification number.', providerTypes: [], validation: { pattern: '[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]', patternMessage: 'Enter a valid 15-character GSTIN.' } },
      { id: 'contact_email', label: 'Contact email', type: 'email', required: true, providerTypes: [] },
      { id: 'contact_mobile', label: 'Contact mobile', type: 'mobile', required: true, providerTypes: [] },
    ],
    documents: [
      { ...DOCUMENT_PRESETS[0], providerTypes: [] },
      { ...DOCUMENT_PRESETS[1], providerTypes: [] },
    ],
    workflow: {
      initialStage: 'draft',
      submittedStage: 'submitted',
      stages: DEFAULT_STAGES.map((s) => ({ ...s, requiredActions: [...s.requiredActions], transitions: [...s.transitions] })),
    },
    consents: [
      { id: 'terms', title: 'Terms of participation', description: 'I accept the provider terms and the grievance redressal policy.', purpose: 'Contractual', required: true, stage: 'draft', version: '1.0' },
    ],
    technical: {
      apiBaseUrl: 'https://api.acme.example/onboarding/v1',
      webhooks: [],
      callbacks: { onSubmit: '', onApproved: '', onRejected: '' },
      integrations: [],
      notifications: { channels: ['email'], senderEmail: 'no-reply@acme.example', notifyOnStages: ['submitted', 'approved', 'rejected'] },
      envVars: [
        { name: 'VITE_PRAVESH_API_BASE_URL', description: 'Public onboarding API base URL used by the browser.', secret: false, required: true, example: 'https://api.acme.example/onboarding/v1' },
      ],
    },
  };
}
