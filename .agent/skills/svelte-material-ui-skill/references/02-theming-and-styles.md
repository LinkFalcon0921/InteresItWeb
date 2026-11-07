# 02 — Theming and styles

## Theme system

SMUI uses Sass as its primary theming system. The theme builder creates starter Sass files for light and dark themes. Use the generated files as the single place to define the application's SMUI theme.

## Minimal custom theme example

```scss
@use '@smui/common/theme/color-palette';

$background: #ffffff;

@use '@smui/common/theme/index' as theme with (
  $primary: color-palette.$blue-600,
  $secondary: color-palette.$teal-600,
  $surface: #ffffff,
  $background: $background,
  $error: #b00020
);

html,
body {
  background-color: $background;
  color: if(theme.contrast-tone($background) == 'dark', #000000, #ffffff);
}
```

This is a starting point, not a complete brand system. Choose palette values from the actual design system and test contrast for text, icons, controls, and interactive states.

## Shape customization

The official guide shows shape variables being configured after the common theme module:

```scss
@use '@smui/common/shape/index' as shape with (
  $small-component-radius: 0,
  $medium-component-radius: 0,
  $large-component-radius: 0
);
```

All Sass `@use` declarations must appear before style rules. If the app has light and dark theme files, apply compatible shape settings to both.

## Material theme classes and CSS variables

To include SMUI theme classes and CSS variables such as `var(--mdc-theme-primary)`, add the styles module to the Sass theme:

```scss
@use '@smui/common/theme/styles';
```

Do not assume that every SMUI component color is dynamically controlled by CSS variables. The official docs warn that bare CSS and premade themes expose only a subset of the full Sass theme options.

## Material typography

Material typography can be applied through Sass mixins:

```scss
@use '@smui/common/typography/index' as typography;

html {
  @include typography.typography('body1');
}

h1 {
  @include typography.typography('headline1');
}

h2 {
  @include typography.typography('headline2');
}

h3 {
  @include typography.typography('headline3');
}

code,
pre {
  font-family: 'Roboto Mono', monospace;
}
```

Apply typography intentionally. Check the hierarchy against the product's design system rather than blindly applying every Material typography role.

## Scoped Svelte CSS and global SMUI selectors

Svelte scopes component CSS. When a component intentionally needs to target an SMUI-generated descendant, use `:global(...)`:

```svelte
<style>
  .transaction-panel :global(.mdc-card) {
    min-width: 0;
  }
</style>
```

Prefer a stable wrapper class owned by the application. Avoid broad selectors such as `:global(.mdc-button)` across the entire app unless a global design-system rule is intended.

SMUI 9 is no longer built on MDC-Web as a dependency, but existing CSS class names may still be visible in markup and styles. Treat internal classes as implementation details unless the official theme API documents them.

## Styling policy

- Prefer Sass theme variables and mixins for library-wide tokens.
- Prefer local component classes for feature-specific layout.
- Avoid hard-coded palette values in individual Svelte components.
- Avoid `!important` unless there is a documented integration reason.
- Do not use deep selectors to override component internals when a public prop, theme variable, Sass mixin, or inner-element prop exists.
- Rebuild generated CSS after adding an SMUI package.
- Keep the theme source under version control; generated CSS should follow the repository's generated-artifact policy.

## Dark mode

The official SvelteKit guide demonstrates using separate light and dark generated stylesheets with `prefers-color-scheme`. If the product offers a manual theme toggle, design and test that switching strategy separately; a media query alone only follows the operating-system preference.

## Theme review checklist

- [ ] Primary, secondary, surface, background, and error colors are defined centrally.
- [ ] Light and dark theme contrast is checked.
- [ ] Focus, hover, disabled, and selected states are visible.
- [ ] Typography hierarchy is consistent.
- [ ] Shape and density are consistent.
- [ ] Global selectors are scoped under an application-owned wrapper where possible.
- [ ] New packages are included in the compiled theme.
