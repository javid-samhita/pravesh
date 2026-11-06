# Environment variables

Pravesh separates **public configuration** that the browser needs from **secrets** that only your backend may see. The configurator enforces this split and never stores secret values.

## The rule

> Only variables prefixed with `VITE_` are compiled into the browser bundle. Anything compiled into the bundle is public. Therefore a secret must never be a `VITE_` variable.

Vite replaces `import.meta.env.VITE_*` references at build time. Any person who loads your portal can read those values in the JavaScript. Webhook signing secrets, API keys, OAuth client secrets and private keys belong to your backend or API gateway.

## Client variables (read by this app)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_PRAVESH_CONFIG_URL` | No | URL of a configuration JSON file. When set, `/portal` renders that file instead of the configurator's working copy. Use `./pravesh.config.json` to serve it from `public/`. |
| `VITE_PRAVESH_API_BASE_URL` | No | Public base URL of your onboarding API, for a backend `ApplicationStore` adapter. |
| `VITE_PRAVESH_ENV` | No | Free-form environment label such as `staging`. |

## Server variables (declared in your configuration)

Webhooks and integrations in `technical` reference secrets **by name** only:

```json
{
  "url": "https://crm.example.in/webhooks/onboarding",
  "events": ["application.submitted"],
  "secretEnv": "PRAVESH_CRM_WEBHOOK_SECRET",
  "enabled": true
}
```

Every name should also be declared in `technical.envVars` with `"secret": true`. The configurator offers a one-click **Declare as secrets** action for any referenced name that is missing.

## Generating `.env.example`

The Technical and Export steps download a `.env.example` built from `technical.envVars`:

- Public variables are written with their `example` value.
- Secret variables are always written with an empty value.

Commit `.env.example`. Never commit `.env`, `.env.local` or `.env.production` containing real secrets; the bundled `.gitignore` already excludes them.

## Validation

`validateConfig` rejects a configuration when:

- a variable marked `secret` starts with `VITE_`;
- a secret variable carries an `example` value;
- a variable name is not `UPPER_SNAKE_CASE`, or is declared twice;
- the serialised configuration contains something that looks like a live credential (for example `sk_live_`, an AWS access key id, or a PEM private key).

It warns when a webhook or integration references a variable that is undeclared or not marked secret.
