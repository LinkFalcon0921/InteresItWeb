# 03 — Svelte 5 and SMUI migration rules

## Version compatibility

- SMUI 8 and later require Svelte 5.
- SMUI 7 is the last version line that supports Svelte 4.
- Never mix examples from SMUI 7 and SMUI 8/9 without checking the migration guide.

## Svelte 5 runes and snippets

SMUI 8 moved to Svelte 5's Runes mode. New examples should use:

- `$state` for reactive local state.
- `$derived` for values computed from state.
- `$effect` only for genuine side effects.
- Snippets (`{#snippet ...}` and `{@render ...}`) instead of legacy slot/`let:` patterns.

Example:

```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);

  function increment(): void {
    count += 1;
  }
</script>

<button onclick={increment}>Increment</button>
<p>Count: {count}</p>
<p>Double: {doubled}</p>
```

This is native Svelte 5 syntax, not an SMUI-specific component. Use SMUI components for the production UI.

## State migration notes

The official SMUI migration guide highlights:

- Remove legacy self-assignment patterns such as `items = items` after mutating `$state` arrays.
- Review `indexOf()` usage with `$state` arrays/items; the migration guide recommends `findIndex()` to avoid bugs in those cases.
- Only some SMUI component props are bindable. Check the component API before using `bind:`.

## Events

The SMUI 7-to-8 migration changed event names from colon-separated names to CamelCase. Example:

- Older event name: `SMUISwitch:change`
- Newer event name: `SMUISwitchChange`

The migration also removed deprecated MDC event names. Do not copy an old event name from an older article or answer.

For ordinary DOM events, prefer Svelte 5 event attributes such as `onclick` when the installed SMUI component forwards the corresponding property. For SMUI-specific custom events, verify the exact event name and event detail in the current demo and installed package types.

The migration guide states that event modifiers became wrapper functions exported from `@smui/common/events`. Inspect that module before applying modifiers; do not assume legacy Svelte modifier syntax is the current SMUI API.

## Snippets replacing slots

SMUI 8 expects snippets in places where older examples used slots or `let:` directives.

Examples shown by the migration guide:

- TabBar uses a `tab` snippet instead of `let:tab`.
- Chips Set uses a `chip` snippet instead of `let:chip`.
- SegmentedButton uses a `segment` snippet instead of older slot APIs.

Always use the snippet name shown in the current component demo.

## Select behavior

SMUI 8 no longer defaults Select's value to an empty string. Explicitly set a suitable value or provide the documented key function when `undefined` is a possible option value.

For object options, provide a key function that maps each object to a unique string. Do not rely on object identity or display labels as stable keys.

## SMUI 8 to SMUI 9

SMUI 9 migrated away from MDC-Web because MDC-Web was abandoned.

Key migration changes documented by SMUI:

- Replace `@material/*` imports with the corresponding `@smui/*` paths.
- Many shared Sass and JavaScript modules moved into `@smui/common`.
- Plain tooltips now require a `Label` component around their text. Rich tooltips continue to use `Content`.
- IconButton should contain at least one `Icon` child.
- Slider input markup moved inside the thumb element.
- Fullscreen and Sheet Dialogs need a `CloseTooltipWrapper` around the close button.
- In a Sheet Dialog, the close button is a child of Dialog, not Content.
- `IconButton` has a `focusRing` property.
- Dialog has a `scrimRemoved` property.
- Form Field has a `justify` property.
- Plain Tooltip timing changed to 250ms show and 100ms hide, and plain tooltips no longer respond to mouse events.
- Flyout Panel was added.

Examples of import migration:

```scss
@use '@smui/common/theme/index' as theme;
@use '@smui/common/shape/index' as shape;
```

```ts
import { events } from '@smui/common/events';
```

These are illustrative paths. Verify the exact exported symbol and path in the installed package.

## Migration process

1. Read the project's current SMUI and Svelte versions.
2. Identify all components and package imports.
3. Compare existing code against the correct migration section.
4. Migrate one component family at a time.
5. Replace old slots and `let:` with documented snippets.
6. Update event names and binding assumptions.
7. Replace `@material` imports where required.
8. Rebuild themes after package changes.
9. Run Svelte checking, TypeScript checking, tests, and production build.
10. Manually test keyboard and focus behavior.

Do not combine a major SMUI upgrade with unrelated feature redesign unless the migration plan explicitly authorizes it.
