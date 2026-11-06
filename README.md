# Pravesh

**Build your provider onboarding portal. Your way.**

Pravesh (Hindi for "entry") is an open-source, configuration-driven starter kit for provider onboarding. Describe your provider types, form fields, documents, review workflow and consents in one JSON file, and Pravesh renders a complete onboarding portal from it: application form, document upload, consent capture, status tracking and a reviewer console.

- **Configurator**, a nine-step wizard with a drag-and-drop form builder and a visual workflow builder.
- **Portal runtime**, renders purely from configuration; nothing provider-specific is hard-coded.
- **Schema and validator**, `schema/pravesh.config.schema.json` plus a dependency-free runtime validator.
- **Secure by default**, secrets are declared by name only; `.env.example` is generated for you.
- **Static deploy**, React, TypeScript and Vite; `dist/` runs on any static host.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check and build to dist/
npm run preview    # serve dist/ on http://localhost:4173
```

Requires Node.js 18.18 or newer.

## Routes

| Route | Purpose |
| --- | --- |
| `/#/` | Project site |
| `/#/wizard/:step` | Configurator (identity, providers, fields, documents, workflow, consents, technical, preview, export) |
| `/#/docs/:slug` | These guides, rendered in-app |
| `/#/portal` | Generated onboarding portal |
| `/#/portal/applications/:id` | Applicant status tracker |
| `/#/portal/admin` | Reviewer console |

## Configuration overview

```json
{
  "schemaVersion": "1.0",
  "id": "lending-partner-network",
  "identity": { "name": "Sahyog Lending Partner Network", "colors": { "primary": "#14532D", "accent": "#16A34A" } },
  "providerTypes": [{ "id": "nbfc", "name": "Financial institution (NBFC)", "description": "..." }],
  "fields": [{ "id": "cin", "label": "CIN", "type": "text", "required": true, "providerTypes": [] }],
  "documents": [{ "id": "rbi_cor", "name": "RBI certificate of registration", "acceptedTypes": ["pdf"], "maxSizeMB": 5, "required": true, "providerTypes": ["nbfc"] }],
  "workflow": { "initialStage": "draft", "submittedStage": "submitted", "stages": ["..."] },
  "consents": [{ "id": "msa", "title": "Master services agreement", "stage": "draft", "version": "2026-04", "required": true }],
  "technical": { "apiBaseUrl": "https://api.example.in", "webhooks": [], "envVars": [] }
}
```

Every key is documented in [docs/CONFIGURATION.md](docs/CONFIGURATION.md). Three complete examples ship in `examples/`:

| File | Scenario |
| --- | --- |
| `examples/implementation-partner-network.json` | NGOs, social enterprises and training institutes joining CSR programmes |
| `examples/employment-ecosystem.json` | Employers, training partners and placement agencies |
| `examples/lending-partner-network.json` | Banks, NBFCs and loan service providers |

## Deploying

1. Export your configuration from the configurator's **Export** step.
2. Save it as `public/pravesh.config.json`.
3. Add `VITE_PRAVESH_CONFIG_URL=./pravesh.config.json` to `.env.production`.
4. `npm run build` and upload `dist/` to any static host. Hash routing means no rewrites are needed.

Before going live, connect a backend `ApplicationStore`, file storage and reviewer authentication. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#backend-integration-points).

## Screenshots

This repository does not include screenshots. Run `npm run dev` and open `/#/wizard`, then use **Load example** to see a fully configured portal in under a minute.

## Documentation

- [Installation](docs/INSTALLATION.md)
- [Configuration reference](docs/CONFIGURATION.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Environment variables](docs/ENVIRONMENT.md)
- [Contributing](CONTRIBUTING.md)

## Licence

MIT. Copyright (c) 2026 Samhita Social Ventures and Pravesh contributors.
