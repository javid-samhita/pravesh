# Configuration reference

A Pravesh portal is described by one JSON document, `pravesh.config.json`. The configurator writes it for you, but it is designed to be read, reviewed and edited by hand. The schema lives in `schema/pravesh.config.schema.json`; complete examples live in `examples/`.

```json
{
  "$schema": "./schema/pravesh.config.schema.json",
  "schemaVersion": "1.0",
  "id": "implementation-partner-network",
  "identity": { "...": "..." },
  "providerTypes": [],
  "fields": [],
  "documents": [],
  "workflow": { "initialStage": "draft", "submittedStage": "submitted", "stages": [] },
  "consents": [],
  "technical": { "...": "..." }
}
```

## Root

| Key | Type | Required | Description |
| --- | --- | --- | --- |
| `$schema` | string | No | Path or URL to the JSON Schema, for editor completion. |
| `schemaVersion` | `"1.0"` | Yes | Version of the configuration format. |
| `id` | slug | Yes | Stable identifier, lower-case letters, digits, `_` or `-`. Stored applications are scoped to it. |
| `identity` | object | Yes | Branding and contact details. |
| `providerTypes` | array | Yes | Kinds of organisations that can apply. At least one. |
| `fields` | array | Yes | Business information form. |
| `documents` | array | Yes | Uploads required from applicants. |
| `workflow` | object | Yes | Review stages and transitions. |
| `consents` | array | Yes | Versioned consents. |
| `technical` | object | Yes | API, webhooks, callbacks, integrations, notifications, env vars. |

Ids inside every array must be unique and use the slug format.

## identity

| Key | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | Yes | Portal name shown in the header. |
| `tagline` | string | No | One line under the name. |
| `description` | string | Yes | Introduction above the application form. |
| `logo` | string | Yes | Data URL or URL. Use `""` for a generated monogram. The configurator embeds uploads up to 256 KB as data URLs. |
| `colors.primary` | hex | Yes | `#RRGGBB`. Buttons, progress and selected states. Text colour on it is chosen automatically for contrast. |
| `colors.accent` | hex | Yes | `#RRGGBB`. Secondary emphasis. |
| `supportEmail` | email | Yes | Shown in the portal footer. |
| `website` | URL | Yes | Shown in the portal footer. |

## providerTypes[]

| Key | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | slug | Yes | Referenced by `fields[].providerTypes` and `documents[].providerTypes`. |
| `name` | string | Yes | Label applicants choose. |
| `description` | string | Yes | Explanation under the label. |

## fields[]

| Key | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | slug | Yes | Key in submitted data. |
| `label` | string | Yes | Visible label. |
| `type` | enum | Yes | `text`, `number`, `email`, `mobile`, `date`, `dropdown`, `multiselect`, `radio`, `checkbox`, `file`, `textarea`, `url`. |
| `required` | boolean | Yes | Blocks progress when empty. For `checkbox`, it must be ticked. |
| `placeholder` | string | No | Input placeholder. |
| `helpText` | string | No | Hint below the input. |
| `options` | string[] | For `dropdown`, `multiselect`, `radio` | At least two options. |
| `providerTypes` | string[] | Yes | Provider type ids. Empty array means all types. |
| `validation.minLength` / `maxLength` | number | No | Text length limits. |
| `validation.min` / `max` | number | No | Numeric limits for `number`. |
| `validation.pattern` | regex | No | ECMAScript pattern, anchored automatically (`^(?:…)$`). |
| `validation.patternMessage` | string | No | Error shown when the pattern fails. |

Built-in rules: `email` must be an address, `mobile` must be an Indian mobile number (10 digits starting 6-9, optional `+91`), `url` must be http(s).

## documents[]

| Key | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | slug | Yes | Key in submitted data. |
| `name` | string | Yes | Document name. |
| `description` | string | Yes | What is acceptable. |
| `acceptedTypes` | string[] | Yes | Lower-case extensions without the dot, e.g. `pdf`, `jpg`. `jpeg` is treated as `jpg`. |
| `maxSizeMB` | number | Yes | Maximum file size in megabytes. |
| `required` | boolean | Yes | Blocks submission when missing. |
| `providerTypes` | string[] | Yes | Empty array means all types. |

## workflow

| Key | Type | Required | Description |
| --- | --- | --- | --- |
| `initialStage` | stage id | Yes | Stage while the applicant is filling the form. |
| `submittedStage` | stage id | Yes | Stage entered on submit. Must be a transition of `initialStage`. |
| `stages` | array | Yes | Ordered list; order drives the pipeline view and the applicant progress bar. |

### workflow.stages[]

| Key | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | slug | Yes | Referenced by transitions, consents and notifications. |
| `name` | string | Yes | Shown to applicants and reviewers. |
| `description` | string | Yes | Shown on the applicant's status page. |
| `tone` | enum | Yes | `neutral`, `info`, `warning`, `success`, `danger`. Drives badge colour and the applicant's progress path. |
| `terminal` | boolean | Yes | Ends the lifecycle. Should have no transitions. |
| `requiredActions` | string[] | Yes | Reviewer checklist that must be complete before moving to a non-negative stage. |
| `transitions` | stage id[] | Yes | Stages this stage may move to. |

Validation rejects workflows with: no terminal stage, unknown or self transitions, stages unreachable from `initialStage`, non-terminal dead ends, or a `submittedStage` the initial stage cannot reach directly.

## consents[]

| Key | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | slug | Yes | Stored with each grant. |
| `title` | string | Yes | Short title. |
| `description` | string | Yes | Exact text the applicant agrees to. |
| `purpose` | string | Yes | Why it is collected. |
| `required` | boolean | Yes | Required consents block submission, or forward movement at their stage. |
| `stage` | stage id | Yes | Consents at `initialStage` or `submittedStage` are collected on submit. Others are requested when the application enters that stage. |
| `version` | string | Yes | Recorded with each grant. Bump it when the text changes. |

## technical

| Key | Type | Required | Description |
| --- | --- | --- | --- |
| `apiBaseUrl` | URL | Yes | Base URL of your onboarding API. |
| `webhooks[]` | array | Yes | See below. |
| `callbacks.onSubmit` / `onApproved` / `onRejected` | URL | Yes | Redirect targets; `""` to disable. |
| `integrations[]` | array | Yes | See below. |
| `notifications.channels` | enum[] | Yes | Any of `email`, `sms`, `webhook`. |
| `notifications.senderEmail` | email | Yes | From address. |
| `notifications.notifyOnStages` | stage id[] | Yes | Stages that trigger an applicant notification. |
| `envVars[]` | array | Yes | Declared environment variables. See `ENVIRONMENT.md`. |

### technical.webhooks[]

| Key | Type | Description |
| --- | --- | --- |
| `id` | slug | Identifier. |
| `url` | URL | HTTPS endpoint. |
| `events` | enum[] | `application.submitted`, `application.stage_changed`, `application.approved`, `application.rejected`, `document.uploaded`, `consent.recorded`. |
| `secretEnv` | env name | Name of the variable holding the HMAC signing secret. |
| `enabled` | boolean | Toggle without deleting. |

### technical.integrations[]

| Key | Type | Description |
| --- | --- | --- |
| `id` | slug | Identifier. |
| `name` | string | Display name. |
| `kind` | enum | `kyc`, `gst`, `bank`, `esign`, `crm`, `registry`, `other`. |
| `baseUrl` | URL | Service endpoint, called from your backend. |
| `credentialEnv` | env name | Variable holding the credential. |
| `enabled` | boolean | Toggle without deleting. |

### technical.envVars[]

| Key | Type | Description |
| --- | --- | --- |
| `name` | `UPPER_SNAKE_CASE` | Variable name. Secrets must not start with `VITE_`. |
| `description` | string | Written as a comment in `.env.example`. |
| `secret` | boolean | Server-side only; value always empty in `.env.example`. |
| `required` | boolean | Documented in `.env.example`. |
| `example` | string | Example value for public variables. Must be `""` for secrets. |

## Stored application records

The portal stores submissions as `ApplicationRecord` objects (see `src/config/types.ts`): the provider type, field values, file metadata (name, size, type; never contents), consent grants with version and timestamp, the current stage, reviewer checklist progress and a full stage history.
