# 06 — SMUI implementation checklist

## Before coding

- [ ] Confirm Svelte 5 and installed SMUI version.
- [ ] Read `package.json` and the lockfile.
- [ ] Confirm whether the project uses SvelteKit or Svelte + Vite.
- [ ] Inspect existing theme builder configuration.
- [ ] Search for an existing component or wrapper.
- [ ] Identify the exact SMUI package and official demo.
- [ ] Check demo source and installed TypeScript declarations.
- [ ] Confirm the component belongs in Presentation.
- [ ] Confirm the UI task does not require moving business logic into a component.

## During coding

- [ ] Use the correct package import.
- [ ] Use Svelte 5 runes and snippets for new code.
- [ ] Bind only documented bindable properties.
- [ ] Use current event names.
- [ ] Use `$` inner-element props only when documented.
- [ ] Keep UI labels separate from domain codes.
- [ ] Use parser functions for untrusted values.
- [ ] Avoid `any`, `as const`, type assertions, and non-null assertions.
- [ ] Keep the component cohesive and below 600 lines.
- [ ] Prefer theme variables over one-off global overrides.
- [ ] Provide accessible labels and focus behavior.
- [ ] Check responsive and RTL requirements.

## After coding

- [ ] Run Svelte checking.
- [ ] Run TypeScript checking.
- [ ] Run lint and formatting checks.
- [ ] Run relevant unit and integration tests.
- [ ] Run the production build.
- [ ] Rebuild the SMUI theme if packages changed.
- [ ] Verify the generated CSS is included.
- [ ] Test keyboard interaction and focus.
- [ ] Test light and dark themes.
- [ ] Test narrow viewport behavior.
- [ ] Confirm no file exceeds 600 lines.
- [ ] Document added packages and architectural decisions.

## Report format

Return:

1. Feature or component implemented.
2. SMUI packages used or added.
3. Official demos/references consulted.
4. Files created or modified.
5. Accessibility and responsive checks.
6. Commands/tests executed and their results.
7. Known limitations or API uncertainty.
8. Confirmation that Clean Architecture boundaries and project coding rules were preserved.
