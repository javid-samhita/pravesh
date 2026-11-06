# Contributing to Pravesh

Thanks for helping build Pravesh. This guide covers the workflow, conventions and the checks a pull request must pass.

## Getting set up

```bash
git clone https://github.com/mahammedjavid/pravesh.git
cd pravesh
npm install
npm run dev
```

## Before you open a pull request

```bash
npm run typecheck
npm run build
```

Both must finish with zero errors. If you change the configuration model, update all of these together:

1. `src/config/types.ts` (TypeScript model)
2. `schema/pravesh.config.schema.json` (JSON Schema)
3. `src/services/validation.ts` (runtime validator)
4. `docs/CONFIGURATION.md` (reference)
5. The three files in `examples/`

## Conventions

- **TypeScript strict.** No `any`; prefer narrow union types.
- **Configuration-driven.** The portal runtime in `src/components/portal` must never mention a specific provider type, field, document or stage. If you need a new behaviour, add it to the config model.
- **No new runtime dependencies** without discussion. Pravesh deliberately ships with React, React Router and lucide-react only.
- **Accessibility.** Every control has a label. Reordering must work with a keyboard. Dialogs trap focus and close on Escape.
- **Design.** Monochrome zinc palette, teal as a sparing accent, 1px borders, radius at most 8px, no gradients, no emoji.
- **Small files.** Split components that grow beyond a few hundred lines.

## Commit messages

Use the imperative mood and a scope, for example:

```
workflow: flag non-terminal stages without outgoing transitions
portal: render multi-select fields as checkbox groups
```

## Reporting security issues

Do not open a public issue. Email security@samhita.example with details and we will respond within three working days.

## Licence

By contributing you agree that your contributions are licensed under the MIT licence in `LICENSE`.
