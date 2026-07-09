# ADR-004 — Tailwind + Radix over Material UI / styled-components

**Status**: Accepted
**Date**: 2026-06-04
**Deciders**: Gautam (founder / eng lead)

## Context

We need a styling and component system that supports:

- A custom, restrained visual identity (navy/amber, decision-tool not consumer-app — see `docs/03`).
- Strong accessibility out of the box (keyboard, screen reader, focus rings, ARIA wiring).
- Component primitives we own and can evolve without library version churn.
- One app (`apps/web`, see [ADR-007](./ADR-007-single-app-merge.md)) with mostly-shared components but room for surface-specific overrides (student/parent vs. advisor/internal).
- A small bundle.

## Decision

- **Tailwind CSS 3** for all styling. No CSS-in-JS, no CSS modules outside special cases.
- **Radix UI primitives** for accessible interactive components (Dialog, Dropdown, Tabs, Toast, etc.). We wrap each Radix primitive once in `packages/ui/src/primitives/` and consume the wrapper from both apps.
- **shadcn/ui-style ownership model** — we copy the patterns, we don't `npm install` shadcn. The wrappers live in our `packages/ui` and evolve with our needs.
- **Design tokens** in `@viacerta/design-tokens` (colors, typography, spacing, radius, shadows) consumed via a Tailwind preset.
- **`clsx` + `tailwind-merge`** for conditional class composition.

## Rationale

### Why Tailwind

- **Constraints by default**. The design tokens we define become the only utility classes; we can't accidentally use a one-off color or spacing value. `docs/03` shows the palette is small on purpose — Tailwind enforces it.
- **Zero runtime CSS**. No styled-components runtime, no emotion serialisation cost. The bundle is just the JSX + the pre-purged Tailwind CSS file.
- **Composition is colocated**. A component's variants live next to its JSX, not in a separate `.styles.ts` file.
- **PurgeCSS-equivalent built in**. Production CSS is only the classes actually used; typically < 20 KB gzipped for both apps combined.
- **Refactor-safe**. Renaming a token (`text-navy-700` → `text-primary-700`) is a global find/replace; no specificity battles.

### Why Radix for primitives

- **Accessibility is the hard part of UI**. Radix has solved focus management, keyboard interactions, ARIA, escape/click-outside, portalling, scroll-locking — for every primitive we'd otherwise reinvent.
- **Unstyled**. We get the behaviour; we provide every pixel of visual. Tailwind on top, no CSS reset to fight.
- **Modular**. We pull in only the primitives we use — `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, etc. — not a monolithic UI kit.
- **No theme system to opt into**. Radix doesn't have its own theme; our design tokens are the theme.

### Why shadcn/ui pattern (own the wrappers, not a library)

`shadcn/ui` isn't a dependency — it's a way of working. You take Radix + Tailwind and own the resulting component code in your repo. We follow this exactly:

- `packages/ui/src/primitives/Dialog.tsx` is *our* Dialog. It wraps `@radix-ui/react-dialog` with our Tailwind classes.
- When we want to change padding or add a third variant, we edit one file. We don't wait for an upstream PR, we don't fork.
- When Radix releases a new primitive, we decide whether to wrap it.

### Why we explicitly rejected MUI

Material UI is excellent at what it does. It's wrong for us:

| MUI characteristic | Problem for ViaCerta |
|---|---|
| Material Design aesthetic | We want a restrained, decision-tool look, not Google's design language |
| `@emotion`-based runtime CSS | Bundle weight + runtime cost we don't need |
| Theming via JS object | Hard to share with non-React contexts (PDF report templates, marketing site) |
| Component coverage is broad | We use ~15 components; a kitchen-sink library is wasted weight |
| Customisation requires fighting defaults | Override-style theming has a learning curve; we'd rather just write the component |
| Bundle size | MUI Core + Icons easily adds 100 KB+ gz; we have a strict budget |

Same critique applies to Chakra UI, Ant Design, Mantine. They're all opinionated component kits; we want primitives + ownership.

### Why we explicitly rejected styled-components / Emotion

- **Runtime cost**. Even with the Babel/SWC plugin, there's still a runtime parser.
- **CSS-in-JS dev ergonomics aren't a win for us**. Tailwind's utility classes are colocated by virtue of being in `className`; there's no separate style file to mentally trace.
- **Server rendering complications**. Not relevant for us (ADR-001 — no SSR), but it indicates the library is solving problems we don't have.
- **Theming via context** has the same re-render concerns as ADR-003.

### Why CSS modules don't fit either

CSS modules are fine, but they fragment by file rather than colocate by component. Tailwind colocates better; we picked Tailwind.

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| **Material UI** | Wrong aesthetic + heavy + theme system we'd fight |
| **Chakra UI** | Cleaner than MUI, same critique on weight + opinionation |
| **Mantine** | Similar — kitchen-sink with strong opinions we'd override |
| **Headless UI (Tailwind Labs)** | Smaller set of primitives than Radix; Radix has more coverage and the same accessibility quality |
| **shadcn/ui as a dependency** | It explicitly isn't a dependency — you own the code. Following the pattern, we own ours |
| **Tailwind without Radix** | We'd reinvent focus traps, keyboard handlers, escape behaviours — exactly the work Radix has done well |
| **DaisyUI / Tailwind UI components** | DaisyUI ships opinionated component styles; Tailwind UI is templates not primitives. Neither addresses the accessibility wiring Radix gives us |
| **Plain CSS + BEM** | Refactor-hostile; class naming becomes a discipline problem |

## Consequences

### Positive

- We own every primitive's code. No "library upgrade broke our dialog" situations.
- Accessibility wiring is correct from day one.
- CSS bundle is small (the Tailwind purged output) and predictable.
- Design tokens live in one package (`@viacerta/design-tokens`) and are consumed by Tailwind, by chart components, and (potentially) by the backend's WeasyPrint report template.

### Negative

- We write component code that other teams get for free with MUI. Mitigated by Radix taking the hard part (behavior + a11y), so we write only the visual layer.
- Class strings can get long; mitigated by `clsx`/`tailwind-merge` and pulling repeated variant systems into the component (Button's `variant` prop, etc.).
- New contributors who haven't used Tailwind have a small ramp; manageable given how widely Tailwind is used now.

## Follow-ups

- A Storybook setup (Phase 2 — see roadmap) gives `packages/ui` a visual home.
- If a third app appears (Phase 4 embeddable widget), the same primitives + tokens carry over without theme refactor.
- Per-tenant theming (also Phase 4) is done via CSS-variable overrides on the root, not by forking components.
