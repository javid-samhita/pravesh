# Architecture

Pravesh has two halves that share one data model:

1. **The configurator** (`/#/wizard`) edits a `PraveshConfig` object.
2. **The portal runtime** (`/#/portal`) renders an onboarding application purely from a `PraveshConfig`.

The wizard's Preview step mounts the same runtime component in-page, so what you preview is exactly what you deploy.

```
            ┌─────────────────────┐        export / import        ┌──────────────────────┐
  author ─▶ │  Configurator (9    │ ───── pravesh.config.json ──▶ │  Portal runtime      │ ◀─ applicants
            │  steps, builders)   │                               │  apply · track ·     │ ◀─ reviewers
            └─────────┬───────────┘                               │  review              │
                      │ ConfigContext (reducer)                    └──────────┬───────────┘
                      ▼                                                       ▼
              localStorage (autosave)                          ApplicationStore adapter
                                                               (localStorage by default)
```

## Directory layout

```
src/
  config/        types.ts (model) · defaults.ts (presets) · ConfigContext.tsx (state)
  services/      validation · workflow · configIO · storage · formRules · util
  data/          examples.ts (imports /examples/*.json, the single source of truth)
  components/
    ui/          Button, Input, Select, Textarea, Toggle, Field, FileDrop, Dialog, Toast, CodeBlock
    builder/     FieldBuilder, FieldEditor, SortableList, WorkflowBuilder, StageEditor, TransitionMatrix
    wizard/      step components, top bar, technical panels
    portal/      PortalRuntime, ApplyFlow, DynamicField, StatusTracker, AdminConsole
    landing/     marketing sections
    layout/      site header and footer
  pages/         Landing, Wizard, Docs, Portal, PortalAdmin
schema/          pravesh.config.schema.json
examples/        three complete configurations
docs/            these guides (also rendered in-app at /#/docs)
```

## State

`ConfigProvider` holds the working configuration in a `useReducer`. Two actions exist: `set` (replace one top-level section) and `replace` (swap the whole config, used by import, examples and cascading edits). An effect debounces writes to `localStorage` by 450 ms and exposes `saveStatus` for the autosave indicator.

Cascades that touch several sections live in services, not components:

- `renameStageId` and `removeStage` (in `services/workflow.ts`) update transitions, consents and notification stages together.
- Deleting a provider type strips it from fields and documents.

## Validation

`services/validation.ts` is dependency-free and mirrors the JSON Schema. It runs in two passes:

1. **Structure**: types, required keys, enums, id formats, regex compilability.
2. **Semantics**: cross references (provider types, stages), option counts, workflow graph checks (via `validateWorkflow`), and secret hygiene for environment variables.

Each issue has a `level`, a JSON-path-like `path` (`workflow.stages[3]`) and a readable message. The wizard groups issues by step; import shows them as a list and refuses invalid files.

## Portal runtime

`PortalRuntime` receives `config`, an `ApplicationStore`, a `view` and an `onNavigate` callback. It does not know about routing, which is why it can run both at `/#/portal` (views mapped to URLs) and inside the wizard preview (views in component state, in-memory store).

- `ApplyFlow`, provider type → fields (filtered by type) → documents (filtered by type) → review and consents → submit.
- `StatusTracker`, progress along the workflow's primary path, detour notices, stage-specific consents, activity history.
- `AdminConsole`, queue with stage filters and search, required-action checklist, and buttons for exactly the transitions the current stage allows.

## Backend integration points

The frontend is complete on its own for evaluation, but production deployments need a backend. Replace these adapters:

| Adapter | Default | Replace with |
| --- | --- | --- |
| `ApplicationStore` (`services/storage.ts`) | `localStorage` | REST/GraphQL client against `technical.apiBaseUrl` |
| File uploads | metadata only | Pre-signed upload URLs from your API |
| Webhooks, notifications | declared only | Your backend, signing with the secrets named in `technical` |
| Integrations (GST, bank, KYC, registry) | declared only | Server-side calls; never from the browser |
| Reviewer authentication | none (open console) | Your identity provider; gate `/portal/admin` |

Anything that needs a credential must run on the server. See `ENVIRONMENT.md`.
