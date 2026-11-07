# 05 — Component patterns and accessibility

## Strict typing

SMUI describes itself as strictly typed and supports TypeScript props and HTML attributes. Keep application props explicitly typed and avoid widening component inputs to `any`.

## Component imports and composition

Import each component from its own package. Use the named subcomponents shown in that component's demo.

Example card composition:

```svelte
<script lang="ts">
  import Card, { Content } from '@smui/card';
</script>

<Card variant="outlined" padded>
  <Content>
    Transaction summary
  </Content>
</Card>
```

## Svelte snippets

SMUI 8+ is designed for Svelte 5. Use the exact snippet names documented by each component. Example helper snippet for Textfield:

```svelte
<script lang="ts">
  import Textfield from '@smui/textfield';
  import HelperText from '@smui/textfield/helper-text';

  let description = $state('');
</script>

<Textfield bind:value={description} label="Description">
  {#snippet helper()}
    <HelperText>Enter a short description.</HelperText>
  {/snippet}
</Textfield>
```

## Inner-element props

Many SMUI components expose props for internal DOM elements using a prefix that ends in `$`. The quick guide demonstrates `input$` and `icon$` patterns.

Example:

```svelte
<Textfield
  bind:value={reference}
  label="Reference"
  input$maxlength={40}
/>
```

Use the exact prefix documented by the component. Do not guess whether an internal field is named `input$`, `icon$`, `label$`, or something else.

## Svelte actions

SMUI supports arbitrary Svelte actions through its `use` prop. The repository README shows this pattern:

```svelte
<SomeSmuiComponent
  use={[
    firstAction,
    [secondAction, secondActionOptions]
  ]}
/>
```

This is a pattern illustration. Use real actions with correct types and confirm the component supports forwarding the action to its rendered element.

## Event forwarding

SMUI forwards DOM and component events. Prefer Svelte 5 event attributes for standard DOM handlers where supported. For SMUI-specific events, use the current event name and detail shape from the installed package's docs/types.

Do not copy event names from SMUI 7 examples into SMUI 8/9 code.

## Scoped styles

Because Svelte scopes component styles, use `:global(...)` when a selector must target an element rendered inside an SMUI component:

```svelte
<style>
  .filter-toolbar :global(.mdc-text-field) {
    width: 100%;
  }
</style>
```

Use application-owned wrapper classes to constrain the effect. Prefer Sass theming or public component props over coupling to internal CSS class names.

## Accessibility

SMUI advertises the following built-in capabilities:

- ARIA attributes on components.
- Keyboard accessibility.
- Touch-friendly targets, with 48px x 48px minimum target guidance.
- RTL awareness.
- Server-side rendering support.

Still verify the complete interaction in context:

- Label each text field and selection control.
- Provide a meaningful accessible name for icon-only controls.
- Keep focus visible.
- Ensure disabled state is not communicated by color alone.
- Provide text for validation errors and associate them with the correct field.
- Ensure dialogs have accessible title and description relationships.
- Keep keyboard order logical.
- Do not rely on tooltips for essential information.
- Test zoom, narrow screens, touch, and RTL if required.

## Forms and validation

SMUI controls are presentation controls. The application should own domain validation.

Recommended flow:

1. User types or selects a raw value.
2. Component holds the raw UI value.
3. A parser function validates the value.
4. A typed domain value is passed to an application use case.
5. The result is mapped to a UI state.
6. SMUI displays helper text, invalid state, progress, or feedback.

For financial input, keep raw decimal text separate from money values and apply the project's approved decimal precision and rounding policy.

## Data Table

Use Data Table for tabular data, not for arbitrary page layout. The official demos include row selection, sorting, pagination, and loading progress. Review sticky header behavior when any ancestor has overflow styling.

## Dialogs

Use Dialog for a focused interaction. Provide a title and description and keep the action labels clear. For destructive actions, make the consequence explicit and ensure the destructive action is not the accidental default.

## Snackbar

Use Snackbar for short feedback. Do not use it as the only channel for a blocking error, a financial warning, or an action requiring user confirmation.

## Responsive behavior

- Check the layout at phone, tablet, and desktop widths.
- Avoid fixed widths for data-heavy controls unless the layout explicitly requires them.
- Use the official Layout Grid when its responsive grid model matches the page.
- Bottom App Bar is intended for mobile according to the official demo's Material-spec note.
- Verify tables on narrow screens; consider a responsive alternative or horizontal scrolling where appropriate.

## RTL

SMUI is RTL-aware. The product still needs an RTL test pass, including app-owned wrappers, icons with directional meaning, table alignment, and custom Sass.
