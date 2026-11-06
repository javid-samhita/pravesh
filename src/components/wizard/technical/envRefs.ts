import type { EnvVarDeclaration, TechnicalConfig } from '../../../config/types';

export const ENV_NAME_RE = /^[A-Z][A-Z0-9_]*$/;

export function normaliseEnvName(v: string): string {
  return v.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
}

/** Credential env vars referenced by webhooks/integrations but not declared. */
export function missingSecretDeclarations(t: TechnicalConfig): EnvVarDeclaration[] {
  const declared = new Set(t.envVars.map((e) => e.name));
  const out: EnvVarDeclaration[] = [];
  const push = (name: string, description: string) => {
    if (name && ENV_NAME_RE.test(name) && !declared.has(name) && !out.some((o) => o.name === name)) {
      out.push({ name, description, secret: true, required: true, example: '' });
    }
  };
  t.webhooks.forEach((w) => push(w.secretEnv, `Signing secret for webhook ${w.url || w.id}`));
  t.integrations.forEach((i) => push(i.credentialEnv, `Credential for ${i.name}`));
  return out;
}
