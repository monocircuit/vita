# Forms Architecture

This folder contains form-related UI composition and integration logic.

## Goals

- Keep reusable selectors independent from concrete form modules.
- Keep form-library integration in dedicated adapters.
- Keep form screens/components focused on composition and submission flows.

## Layers

### 1. Selectors (UI + selector-specific behavior)

Path: `selectors/`

- Contains reusable selector components and selector-specific hooks.
- Should not depend on route-level feature components.
- Should expose selector APIs through `selectors/index.ts`.

Examples:
- `EntitySelector`
- `KnotsSelector`

### 2. Form Adapters (form-library integration)

Path: `adapters/`

- Bridges TanStack form fields and selectors.
- Owns field validators and form field wiring.
- Should consume selectors, but not feature modules.

Examples:
- `EntityFieldAdapter`
- `KnotsFieldAdapter`

### 3. Form Composition (screen/form modules)

Path: `domains/chronicle/create/`, `domains/entity/create/`

- Composes fields, adapters, submission logic, and domain workflows.
- Should consume adapters and non-selector field components.

For form-local UI internals, prefer this structure inside a form module:

- `fields/inputs/`: pure input field components
- `fields/actions/`: submit and feedback components
- `fields/validators.ts`: shared field validators for that form
- `fields/index.tsx`: single barrel for form-local field exports

## Dependency Direction

Use this one-way direction only:

`selectors -> adapters -> form modules`

Allowed imports:
- Form modules may import from `adapters` and field components.
- Adapters may import from `selectors`.
- Selectors may import shared UI/data utilities.

Disallowed imports:
- Selectors importing from `adapters` or form modules.
- Adapters importing from route feature components.

## Public API

- Export form entry points from `forms/index.ts`.
- Export selector entry points from `selectors/index.ts`.
- Prefer barrel imports over deep file imports for stability.

## Practical Rule

If a component can be used outside a specific form, place it in `selectors`.
If a component requires a form field contract, place it in `adapters`.
