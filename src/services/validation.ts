/**
 * Configuration validation.
 *
 * `validateConfig` checks an unknown value against the Pravesh schema
 * (structure + types, mirroring `schema/pravesh.config.schema.json`) and then
 * runs semantic checks: cross references between sections, workflow graph
 * integrity and environment-variable hygiene. It has no dependencies so it
 * can run in the browser, in Node, or in CI.
 */
import {
  FIELD_TYPES,
  INTEGRATION_KINDS,
  NOTIFICATION_CHANNELS,
  OPTION_FIELD_TYPES,
  SCHEMA_VERSION,
  STAGE_TONES,
  WEBHOOK_EVENTS,
  type PraveshConfig,
} from '../config/types';
import { validateWorkflow } from './workflow';

export interface Issue {
  level: 'error' | 'warning';
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Issue[];
  warnings: Issue[];
}

const ID_RE = /^[a-z0-9][a-z0-9_-]*$/;
const ENV_RE = /^[A-Z][A-Z0-9_]*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

class Checker {
  issues: Issue[] = [];
  err(path: string, message: string) {
    this.issues.push({ level: 'error', path, message });
  }
  warn(path: string, message: string) {
    this.issues.push({ level: 'warning', path, message });
  }
  obj(v: unknown, path: string): v is Obj {
    if (!isObj(v)) {
      this.err(path, 'must be an object');
      return false;
    }
    return true;
  }
  arr(v: unknown, path: string): v is unknown[] {
    if (!Array.isArray(v)) {
      this.err(path, 'must be an array');
      return false;
    }
    return true;
  }
  str(o: Obj, key: string, path: string, opts: { required?: boolean; nonEmpty?: boolean; re?: RegExp; reMsg?: string } = {}) {
    const v = o[key];
    const p = `${path}.${key}`;
    if (v === undefined) {
      if (opts.required !== false) this.err(p, 'is required');
      return;
    }
    if (typeof v !== 'string') return this.err(p, 'must be a string');
    if (opts.nonEmpty && !v.trim()) return this.err(p, 'must not be empty');
    if (opts.re && v && !opts.re.test(v)) this.err(p, opts.reMsg ?? `must match ${opts.re}`);
  }
  bool(o: Obj, key: string, path: string) {
    if (typeof o[key] !== 'boolean') this.err(`${path}.${key}`, 'must be true or false');
  }
  num(o: Obj, key: string, path: string, opts: { required?: boolean; min?: number } = {}) {
    const v = o[key];
    if (v === undefined) {
      if (opts.required !== false) this.err(`${path}.${key}`, 'is required');
      return;
    }
    if (typeof v !== 'number' || Number.isNaN(v)) return this.err(`${path}.${key}`, 'must be a number');
    if (opts.min !== undefined && v < opts.min) this.err(`${path}.${key}`, `must be at least ${opts.min}`);
  }
  oneOf(o: Obj, key: string, path: string, allowed: readonly string[]) {
    const v = o[key];
    if (typeof v !== 'string' || !allowed.includes(v)) this.err(`${path}.${key}`, `must be one of: ${allowed.join(', ')}`);
  }
  strArr(o: Obj, key: string, path: string, allowed?: readonly string[]) {
    const v = o[key];
    const p = `${path}.${key}`;
    if (!Array.isArray(v)) return this.err(p, 'must be an array of strings');
    v.forEach((item, i) => {
      if (typeof item !== 'string') this.err(`${p}[${i}]`, 'must be a string');
      else if (allowed && !allowed.includes(item)) this.err(`${p}[${i}]`, `"${item}" is not one of: ${allowed.join(', ')}`);
    });
  }
  ids(list: unknown[], path: string): Set<string> {
    const seen = new Set<string>();
    list.forEach((item, i) => {
      if (!isObj(item)) return;
      const id = item.id;
      if (typeof id !== 'string' || !ID_RE.test(id)) {
        this.err(`${path}[${i}].id`, 'must be a lower-case id (letters, digits, _ or -)');
        return;
      }
      if (seen.has(id)) this.err(`${path}[${i}].id`, `duplicate id "${id}"`);
      seen.add(id);
    });
    return seen;
  }
}

function checkStructure(c: Checker, input: unknown): input is PraveshConfig {
  if (!c.obj(input, 'config')) return false;
  const root = input;
  if (root.schemaVersion !== SCHEMA_VERSION) c.err('schemaVersion', `must be "${SCHEMA_VERSION}"`);
  c.str(root, 'id', 'config', { re: ID_RE, reMsg: 'must be a lower-case slug' });

  // identity
  if (c.obj(root.identity, 'identity')) {
    const id = root.identity;
    c.str(id, 'name', 'identity', { nonEmpty: true });
    c.str(id, 'tagline', 'identity', { required: false });
    c.str(id, 'description', 'identity');
    c.str(id, 'logo', 'identity');
    c.str(id, 'supportEmail', 'identity', { re: EMAIL_RE, reMsg: 'must be a valid email address' });
    c.str(id, 'website', 'identity');
    if (c.obj(id.colors, 'identity.colors')) {
      c.str(id.colors, 'primary', 'identity.colors', { re: HEX_RE, reMsg: 'must be a 6-digit hex colour like #0F766E' });
      c.str(id.colors, 'accent', 'identity.colors', { re: HEX_RE, reMsg: 'must be a 6-digit hex colour like #0F766E' });
    }
  }

  // provider types
  if (c.arr(root.providerTypes, 'providerTypes')) {
    c.ids(root.providerTypes, 'providerTypes');
    root.providerTypes.forEach((p, i) => {
      const path = `providerTypes[${i}]`;
      if (!c.obj(p, path)) return;
      c.str(p, 'name', path, { nonEmpty: true });
      c.str(p, 'description', path);
    });
  }

  // fields
  if (c.arr(root.fields, 'fields')) {
    c.ids(root.fields, 'fields');
    root.fields.forEach((f, i) => {
      const path = `fields[${i}]`;
      if (!c.obj(f, path)) return;
      c.str(f, 'label', path, { nonEmpty: true });
      c.oneOf(f, 'type', path, FIELD_TYPES);
      c.bool(f, 'required', path);
      c.str(f, 'placeholder', path, { required: false });
      c.str(f, 'helpText', path, { required: false });
      c.strArr(f, 'providerTypes', path);
      if (f.options !== undefined) c.strArr(f, 'options', path);
      if (f.validation !== undefined && c.obj(f.validation, `${path}.validation`)) {
        const v = f.validation;
        (['minLength', 'maxLength', 'min', 'max'] as const).forEach((k) => c.num(v, k, `${path}.validation`, { required: false }));
        c.str(v, 'pattern', `${path}.validation`, { required: false });
        c.str(v, 'patternMessage', `${path}.validation`, { required: false });
        if (typeof v.pattern === 'string') {
          try {
            new RegExp(v.pattern);
          } catch {
            c.err(`${path}.validation.pattern`, 'is not a valid regular expression');
          }
        }
      }
    });
  }

  // documents
  if (c.arr(root.documents, 'documents')) {
    c.ids(root.documents, 'documents');
    root.documents.forEach((d, i) => {
      const path = `documents[${i}]`;
      if (!c.obj(d, path)) return;
      c.str(d, 'name', path, { nonEmpty: true });
      c.str(d, 'description', path);
      c.strArr(d, 'acceptedTypes', path);
      c.num(d, 'maxSizeMB', path, { min: 0.1 });
      c.bool(d, 'required', path);
      c.strArr(d, 'providerTypes', path);
    });
  }

  // workflow
  if (c.obj(root.workflow, 'workflow')) {
    const w = root.workflow;
    c.str(w, 'initialStage', 'workflow', { nonEmpty: true });
    c.str(w, 'submittedStage', 'workflow', { nonEmpty: true });
    if (c.arr(w.stages, 'workflow.stages')) {
      c.ids(w.stages, 'workflow.stages');
      w.stages.forEach((s, i) => {
        const path = `workflow.stages[${i}]`;
        if (!c.obj(s, path)) return;
        c.str(s, 'name', path, { nonEmpty: true });
        c.str(s, 'description', path);
        c.oneOf(s, 'tone', path, STAGE_TONES);
        c.bool(s, 'terminal', path);
        c.strArr(s, 'requiredActions', path);
        c.strArr(s, 'transitions', path);
      });
    }
  }

  // consents
  if (c.arr(root.consents, 'consents')) {
    c.ids(root.consents, 'consents');
    root.consents.forEach((s, i) => {
      const path = `consents[${i}]`;
      if (!c.obj(s, path)) return;
      c.str(s, 'title', path, { nonEmpty: true });
      c.str(s, 'description', path, { nonEmpty: true });
      c.str(s, 'purpose', path);
      c.bool(s, 'required', path);
      c.str(s, 'stage', path, { nonEmpty: true });
      c.str(s, 'version', path, { nonEmpty: true });
    });
  }

  // technical
  if (c.obj(root.technical, 'technical')) {
    const t = root.technical;
    c.str(t, 'apiBaseUrl', 'technical');
    if (c.arr(t.webhooks, 'technical.webhooks')) {
      c.ids(t.webhooks, 'technical.webhooks');
      t.webhooks.forEach((w, i) => {
        const path = `technical.webhooks[${i}]`;
        if (!c.obj(w, path)) return;
        c.str(w, 'url', path, { nonEmpty: true });
        c.strArr(w, 'events', path, WEBHOOK_EVENTS);
        c.str(w, 'secretEnv', path, { re: ENV_RE, reMsg: 'must be an UPPER_SNAKE_CASE variable name' });
        c.bool(w, 'enabled', path);
      });
    }
    if (c.obj(t.callbacks, 'technical.callbacks')) {
      (['onSubmit', 'onApproved', 'onRejected'] as const).forEach((k) => c.str(t.callbacks as Obj, k, 'technical.callbacks'));
    }
    if (c.arr(t.integrations, 'technical.integrations')) {
      c.ids(t.integrations, 'technical.integrations');
      t.integrations.forEach((it, i) => {
        const path = `technical.integrations[${i}]`;
        if (!c.obj(it, path)) return;
        c.str(it, 'name', path, { nonEmpty: true });
        c.oneOf(it, 'kind', path, INTEGRATION_KINDS);
        c.str(it, 'baseUrl', path);
        c.str(it, 'credentialEnv', path, { re: ENV_RE, reMsg: 'must be an UPPER_SNAKE_CASE variable name' });
        c.bool(it, 'enabled', path);
      });
    }
    if (c.obj(t.notifications, 'technical.notifications')) {
      const n = t.notifications;
      c.strArr(n, 'channels', 'technical.notifications', NOTIFICATION_CHANNELS);
      c.str(n, 'senderEmail', 'technical.notifications');
      c.strArr(n, 'notifyOnStages', 'technical.notifications');
    }
    if (c.arr(t.envVars, 'technical.envVars')) {
      const seen = new Set<string>();
      t.envVars.forEach((e, i) => {
        const path = `technical.envVars[${i}]`;
        if (!c.obj(e, path)) return;
        c.str(e, 'name', path, { re: ENV_RE, reMsg: 'must be an UPPER_SNAKE_CASE variable name' });
        c.str(e, 'description', path);
        c.bool(e, 'secret', path);
        c.bool(e, 'required', path);
        c.str(e, 'example', path);
        if (typeof e.name === 'string') {
          if (seen.has(e.name)) c.err(`${path}.name`, `duplicate variable "${e.name}"`);
          seen.add(e.name);
        }
      });
    }
  }
  return !c.issues.some((i) => i.level === 'error');
}

/** Cross-reference and hygiene checks on a structurally valid config. */
function checkSemantics(c: Checker, cfg: PraveshConfig) {
  const providerIds = new Set(cfg.providerTypes.map((p) => p.id));
  const stageIds = new Set(cfg.workflow.stages.map((s) => s.id));

  if (cfg.providerTypes.length === 0) c.err('providerTypes', 'add at least one provider type');

  const refProviders = (list: string[], path: string) =>
    list.forEach((id, i) => {
      if (!providerIds.has(id)) c.err(`${path}[${i}]`, `unknown provider type "${id}"`);
    });

  cfg.fields.forEach((f, i) => {
    refProviders(f.providerTypes, `fields[${i}].providerTypes`);
    if (OPTION_FIELD_TYPES.includes(f.type)) {
      const opts = (f.options ?? []).filter((o) => o.trim());
      if (opts.length < 2) c.err(`fields[${i}].options`, `"${f.label}" needs at least two options`);
      if (new Set(opts).size !== opts.length) c.warn(`fields[${i}].options`, `"${f.label}" has duplicate options`);
    }
  });
  if (cfg.fields.length === 0) c.warn('fields', 'no business information fields are configured');

  cfg.documents.forEach((d, i) => {
    refProviders(d.providerTypes, `documents[${i}].providerTypes`);
    if (d.acceptedTypes.length === 0) c.err(`documents[${i}].acceptedTypes`, `"${d.name}" accepts no file types`);
  });

  validateWorkflow(cfg.workflow).forEach((w) => {
    const idx = w.stageId ? cfg.workflow.stages.findIndex((s) => s.id === w.stageId) : -1;
    const path = idx >= 0 ? `workflow.stages[${idx}]` : 'workflow';
    if (w.level === 'error') c.err(path, w.message);
    else c.warn(path, w.message);
  });

  cfg.consents.forEach((s, i) => {
    if (!stageIds.has(s.stage)) c.err(`consents[${i}].stage`, `unknown workflow stage "${s.stage}"`);
  });

  const t = cfg.technical;
  const declared = new Map(t.envVars.map((e) => [e.name, e]));
  t.envVars.forEach((e, i) => {
    if (e.secret && e.name.startsWith('VITE_')) {
      c.err(`technical.envVars[${i}].name`, `"${e.name}" is marked secret but uses the VITE_ prefix, which would ship it to the browser`);
    }
    if (e.secret && e.example) c.err(`technical.envVars[${i}].example`, `secret "${e.name}" must not carry an example value`);
  });
  const requireSecret = (name: string, path: string) => {
    if (!name) return;
    const d = declared.get(name);
    if (!d) c.warn(path, `"${name}" is not declared in technical.envVars`);
    else if (!d.secret) c.warn(path, `"${name}" holds a credential but is not marked secret`);
  };
  t.webhooks.forEach((w, i) => {
    requireSecret(w.secretEnv, `technical.webhooks[${i}].secretEnv`);
    if (w.events.length === 0) c.warn(`technical.webhooks[${i}].events`, 'webhook subscribes to no events');
    if (!/^https:\/\//.test(w.url)) c.warn(`technical.webhooks[${i}].url`, 'webhook URLs should use https');
  });
  t.integrations.forEach((it, i) => requireSecret(it.credentialEnv, `technical.integrations[${i}].credentialEnv`));
  t.notifications.notifyOnStages.forEach((s, i) => {
    if (!stageIds.has(s)) c.err(`technical.notifications.notifyOnStages[${i}]`, `unknown workflow stage "${s}"`);
  });

  // Last line of defence: no obvious secrets embedded anywhere.
  const raw = JSON.stringify(cfg);
  if (/(sk_live_|sk_test_|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/.test(raw)) {
    c.err('config', 'the configuration appears to contain a credential. Secrets belong in environment variables, not in the config');
  }
}

export function validateConfig(input: unknown): ValidationResult {
  const c = new Checker();
  if (checkStructure(c, input)) checkSemantics(c, input);
  const errors = c.issues.filter((i) => i.level === 'error');
  const warnings = c.issues.filter((i) => i.level === 'warning');
  return { valid: errors.length === 0, errors, warnings };
}
