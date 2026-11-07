---
name: svelte-material-ui
description: Build, refactor, review, and document Svelte 5 web interfaces using Svelte Material UI (SMUI), with Sass theming, typed components, accessible interactions, and project Clean Architecture rules.
---

# Svelte Material UI — Agent Skill

## 1. Purpose and activation

Use this skill whenever a task creates, modifies, reviews, migrates, or documents a web interface built with **Svelte 5 and Svelte Material UI (SMUI)**.

The target library is **Svelte Material UI**, published from `hperrin/svelte-material-ui`. It is not React's `@mui/material`, and React Material UI documentation must not be used as an API reference.

This skill is written against the SMUI 9 documentation and package family. The research baseline found version `9.0.6` as the latest published release on 2026-11-07. This is a reference baseline, not permission to upgrade a project's installed version.

## 2. Source-of-truth order

Before writing SMUI code, inspect the repository's installed versions and use sources in this order:

1. The project's `package.json` and lockfile. Never silently upgrade or downgrade Svelte, SMUI, Sass, or the theme builder.
2. The exact installed package's TypeScript declarations and source in `node_modules`, when available.
3. The official SMUI demo page and its **Show source code** example for the component being used.
4. The matching component README in the official SMUI repository.
5. The official installation, SvelteKit, theming, typography, and migration guides.
6. External explanations only when the official sources do not answer the question.

The SMUI repository explicitly notes that its component documentation is a work in progress and that demo code should be treated as the main source of truth. Do not infer a prop, event, slot, snippet, or package name from React Material UI.

Official sources are indexed in `references/07-official-references.md`.

## 3. Project architecture rules

SMUI belongs to the **Presentation Layer**. It must not become a reason to move business logic into Svelte components.

Follow the project's Clean Architecture boundaries:

- Domain: entities, value objects, enums, pure calculations, parsers, domain errors.
- Application: use cases, DTOs, ports, orchestration.
- Infrastructure: adapters, persistence, HTTP clients, external integrations.
- Presentation: Svelte pages, layouts, SMUI components, UI state, formatting for display.
- Composition root: connect use cases to infrastructure adapters.

### Required boundaries

- Svelte components must not calculate financial results.
- Svelte components must not call repositories, databases, or HTTP clients directly.
- Components should invoke application use cases through an approved presentation adapter or injected callback.
- Do not import SMUI into Domain or Application.
- Do not make domain types depend on SMUI component types.
- Keep reusable design-system wrappers in a presentation/shared UI area only when a real shared behavior or visual contract exists. Do not wrap every SMUI component mechanically.
- Prefer feature-local components when reuse is not yet demonstrated.

## 4. Mandatory coding conventions

These are project rules and apply to all examples and generated code:

- Maximum 600 physical lines per maintained source file.
- Warn and review responsibility boundaries at 450 lines.
- Use enums for finite domain values; use regular string enums, not `const enum`.
- Do not use magic strings for domain codes, statuses, modes, or business options.
- Do not use `as const`.
- Do not use forced TypeScript assertions such as `value as SomeType`.
- Do not use double assertions or non-null assertions to silence the compiler.
- Do not use `any`.
- Parse untrusted inputs from forms, URLs, APIs, storage, or files using parser functions that accept `unknown` and return typed results.
- Do not hide invalid input by coercing it into a domain type.
- Prefer explicit props, return types, and small cohesive functions.
- Do not duplicate an existing component, formatter, parser, or domain rule.
- Do not add dependencies without checking whether the project already solves the problem and documenting why the dependency is needed.
- Keep all files below the 600-line limit.

UI copy such as visible labels and helper text is presentation content, not a domain code. Keep domain identifiers separate from translated or human-readable labels.

## 5. SMUI installation and imports

SMUI components are installed individually. Import components from their package entry points, for example:

```svelte
<script lang="ts">
  import Button, { Label } from '@smui/button';
</script>

<Button variant="raised">
  <Label>Save</Label>
</Button>
```

Do not import every component from a single React-style barrel. Install only the packages actually used by the feature.

For SvelteKit, install `smui-theme`, create the Sass theme files with `npx smui-theme template src/theme`, compile the theme, and include the generated stylesheet in `src/app.html`. Rebuild the theme after installing another SMUI package because the theme compiler includes the Sass for packages installed at compile time.

Read `references/01-installation-and-sveltekit.md` before configuring the project.

## 6. Svelte 5 compatibility rules

- SMUI 8 and later require Svelte 5. SMUI 7 is the last release line for Svelte 4.
- Use Svelte 5 runes for new local component state (`$state`, `$derived`, `$effect` only when needed).
- Use Svelte 5 snippets for content insertion points. Do not copy old slot or `let:` examples from SMUI 7 documentation.
- Bind only properties documented as bindable by the installed component version.
- Prefer Svelte 5 event attributes such as `onclick` for DOM event handlers when supported by the component.
- For SMUI custom events, inspect the current component demo and installed types. Do not invent event names.
- SMUI event names changed between major versions. In the SMUI 8 migration, names moved from colon-separated legacy names to CamelCase names, for example `SMUISwitchChange`.
- If event modifiers are needed, consult the current `@smui/common/events` API. Do not copy obsolete modifier syntax without verifying it against the installed version.
- Avoid legacy reactivity workarounds such as reassigning an array to itself after `push()` when using `$state`.

Read `references/03-svelte5-and-migration.md` before migrating existing SMUI code.

## 7. SMUI component usage rules

- Use the official component package for each component.
- Read the demo source for the exact component composition, named exports, snippets, event names, and bindable properties.
- Use named exports such as `Label`, `Icon`, `Title`, `Content`, `Actions`, `Head`, `Body`, `Row`, and `Cell` only from the package that documents them.
- Some components have special subcomponents. Textfield icons/helper text/character counters, Select icons/helper text, and Chips labels/icons do not necessarily follow the generic common export pattern.
- SMUI supports forwarding arbitrary attributes and Svelte actions. Use the documented `use` prop for actions.
- Inner-element props use a prefix ending in `$`, such as `input$maxlength`. Verify the prefix for the exact child element before using it.
- In scoped Svelte CSS, use `:global(...)` when intentionally targeting SMUI-rendered descendants. Prefer Sass theme variables and mixins over depending on undocumented internal class names.
- Use the `tag` prop only when the component documents it and the semantic element is appropriate.
- Do not disable ripple, focus rings, or touch targets just for visual preference without considering accessibility and interaction feedback.

Read `references/04-component-catalog.md` and `references/05-component-patterns-and-accessibility.md`.

## 8. Theming rules

SMUI uses Sass for its full theming system.

- Prefer a project-owned custom Sass theme generated with `smui-theme`.
- Keep light and dark theme source files together in the theme directory.
- Configure theme colors, shape, density, typography, and interaction states centrally.
- Do not scatter hard-coded Material palette values across individual components.
- Add Material typography deliberately; it is not necessary to apply every typography mixin globally.
- If using `bare.css` or a premade theme, understand that CSS-variable customization is limited: not every SMUI color reads from CSS variables.
- Recompile the theme whenever an SMUI package is added.
- Keep app-specific layout and feature styling separate from library theme configuration.

See `references/02-theming-and-styles.md` and `examples/theme/_smui-theme.scss`.

## 9. Accessibility, responsiveness, and internationalization

SMUI advertises ARIA support, keyboard accessibility, RTL awareness, SSR support, and 48px minimum touch targets in accordance with the Material specification.

These defaults do not remove the developer's responsibility:

- Provide meaningful labels for controls.
- Keep form errors understandable and associated with the relevant field.
- Preserve keyboard focus and visible focus indication.
- Give icon-only actions an accessible name or title.
- Use correct semantic elements and heading order.
- Check contrast in both themes.
- Test dialogs, menus, drawers, tabs, and data tables with keyboard navigation.
- Test narrow viewports and touch interaction.
- Verify RTL layouts if the product supports RTL.
- Do not assume a component's default ARIA behavior covers the full page context.

## 10. Data and forms

- Treat values from SMUI controls as UI input, not trusted domain objects.
- Keep raw input strings separate from parsed domain values where validation or formatting matters.
- Use parser functions before calling application use cases.
- For `Select` with primitive string options, bind the value and use documented `Option` children.
- For object options, provide a stable `key` function that returns a unique string.
- If a SMUI `Select` is placed inside a native HTML form, consult the current docs for `hiddenInput` and `input$name` so the value is included in form submission.
- Avoid converting monetary input to binary floating point without the project's approved financial precision policy.

## 11. SSR and runtime safety

SMUI supports server-side rendering and SvelteKit. Preserve that capability:

- Do not access `window`, `document`, `localStorage`, or other browser-only globals at module initialization.
- Put browser-only behavior behind an appropriate client lifecycle boundary.
- Do not make UI components depend on Node-only APIs.
- Keep SSR output deterministic.
- Test production builds, not only the development server.

## 12. Implementation workflow

For every SMUI task:

1. Inspect the installed versions and existing theme setup.
2. Identify the exact component package(s) needed.
3. Read the official demo and its source example.
4. Check the installed TypeScript declarations for the exact API.
5. Confirm the component belongs in Presentation.
6. Reuse an existing project component if it already satisfies the requirement.
7. Implement the smallest cohesive component.
8. Keep business logic in Domain/Application.
9. Validate labels, keyboard behavior, focus, responsiveness, and theme contrast.
10. Run Svelte checking, TypeScript checking, lint, tests, and production build.
11. Verify no source file exceeds 600 lines.
12. Report packages added, files changed, checks run, and any API uncertainty.

Do not proceed to another migration phase or broaden the task without authorization.

## 13. Definition of done

A SMUI implementation is complete only when:

- The installed SMUI version is respected.
- All imports resolve from the correct package.
- Theme CSS is generated and loaded.
- No unsupported or guessed props/events are used.
- Type checking and Svelte checking pass.
- No `any`, `as const`, forced assertions, or non-null assertions have been introduced.
- Domain and application code remain UI-library independent.
- Accessibility and responsive behavior have been reviewed.
- Tests and production build pass, or pre-existing failures are explicitly reported.
- Every modified source file is at most 600 lines.
- Relevant decisions and dependencies are documented.

## 14. Reference map

- Installation and SvelteKit: `references/01-installation-and-sveltekit.md`
- Theming and Sass: `references/02-theming-and-styles.md`
- Svelte 5 and migration: `references/03-svelte5-and-migration.md`
- Component/package catalog: `references/04-component-catalog.md`
- Component patterns and accessibility: `references/05-component-patterns-and-accessibility.md`
- Implementation checklist: `references/06-implementation-checklist.md`
- Official links: `references/07-official-references.md`
- Runnable-style examples: `examples`

Always verify version-specific details against the installed package before generating production code.
