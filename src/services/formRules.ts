/** Rules the portal runtime uses to render and validate applicant input. */
import type { DocumentRequirement, FieldDefinition, FieldValue, FileMeta, PraveshConfig } from '../config/types';

export const appliesTo = (providerTypes: string[], providerType: string) =>
  providerTypes.length === 0 || providerTypes.includes(providerType);

export function fieldsFor(config: PraveshConfig, providerType: string): FieldDefinition[] {
  return config.fields.filter((f) => appliesTo(f.providerTypes, providerType));
}

export function documentsFor(config: PraveshConfig, providerType: string): DocumentRequirement[] {
  return config.documents.filter((d) => appliesTo(d.providerTypes, providerType));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MOBILE_RE = /^(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/;

function isEmpty(v: FieldValue | undefined): boolean {
  if (v === undefined) return true;
  if (typeof v === 'boolean') return !v;
  if (Array.isArray(v)) return v.length === 0;
  return v.trim() === '';
}

/** Returns an error message, or null when the value is acceptable. */
export function validateFieldValue(field: FieldDefinition, value: FieldValue | undefined, file?: FileMeta): string | null {
  if (field.type === 'file') {
    if (field.required && !file) return 'Upload a file.';
    return null;
  }
  if (isEmpty(value)) {
    if (!field.required) return null;
    if (field.type === 'checkbox') return 'This must be checked to continue.';
    if (field.type === 'multiselect') return 'Choose at least one option.';
    return `${field.label} is required.`;
  }
  const v = field.validation ?? {};
  if (typeof value === 'string') {
    const s = value.trim();
    switch (field.type) {
      case 'email':
        if (!EMAIL_RE.test(s)) return 'Enter a valid email address.';
        break;
      case 'mobile':
        if (!MOBILE_RE.test(s)) return 'Enter a 10-digit Indian mobile number, e.g. 98765 43210.';
        break;
      case 'url':
        try {
          const u = new URL(s);
          if (!/^https?:$/.test(u.protocol)) return 'Use an http(s) URL.';
        } catch {
          return 'Enter a full URL starting with https://';
        }
        break;
      case 'number': {
        const n = Number(s);
        if (Number.isNaN(n)) return 'Enter a number.';
        if (v.min !== undefined && n < v.min) return `Must be at least ${v.min.toLocaleString('en-IN')}.`;
        if (v.max !== undefined && n > v.max) return `Must be at most ${v.max.toLocaleString('en-IN')}.`;
        break;
      }
      default:
        break;
    }
    if (v.minLength !== undefined && s.length < v.minLength) return `Use at least ${v.minLength} characters.`;
    if (v.maxLength !== undefined && s.length > v.maxLength) return `Use at most ${v.maxLength} characters.`;
    if (v.pattern) {
      try {
        if (!new RegExp(`^(?:${v.pattern})$`).test(s)) return v.patternMessage || 'Value is not in the expected format.';
      } catch {
        /* invalid pattern is reported by config validation */
      }
    }
    if (field.options && (field.type === 'dropdown' || field.type === 'radio') && !field.options.includes(s)) {
      return 'Choose one of the listed options.';
    }
  }
  return null;
}

export function validateUpload(doc: Pick<DocumentRequirement, 'acceptedTypes' | 'maxSizeMB'>, file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const accepted = doc.acceptedTypes.map((t) => t.toLowerCase());
  const normalised = ext === 'jpeg' ? 'jpg' : ext;
  if (accepted.length && !accepted.includes(normalised)) return `Accepted formats: ${accepted.map((a) => a.toUpperCase()).join(', ')}.`;
  if (file.size > doc.maxSizeMB * 1024 * 1024) return `File is larger than ${doc.maxSizeMB} MB.`;
  return null;
}
