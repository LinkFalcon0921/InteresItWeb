# 01 — Installation and SvelteKit

## Installation model

SMUI is modular. Install the individual packages used by the application rather than adding every component.

```bash
npm install --save-dev @smui/button
npm install --save-dev @smui/card
npm install --save-dev @smui/textfield
npm install --save-dev smui-theme
```

The commands above are examples. Before installing, inspect the repository's package manager, lockfile, existing dependencies, and approved versions. Do not run a package manager migration as part of an unrelated UI task.

Import Svelte components from their package:

```svelte
<script lang="ts">
  import Button, { Label } from '@smui/button';
</script>

<Button variant="raised">
  <Label>Continue</Label>
</Button>
```

The component package requires an SMUI theme. A component import alone does not provide the complete styled application theme.

## SvelteKit theme setup

Install the theme builder:

```bash
npm install --save-dev smui-theme
```

Generate the starter theme directory:

```bash
npx smui-theme template src/theme
```

The generated structure contains a light theme and a `dark` theme directory. Customize the generated `_smui-theme.scss` files rather than placing global palette overrides in every component.

## Theme build scripts

The official SvelteKit guide documents a `prepare` script that compiles light and dark themes:

```json
{
  "scripts": {
    "prepare": "npm run smui-theme-light && npm run smui-theme-dark",
    "smui-theme-light": "smui-theme compile static/smui.css -i src/theme",
    "smui-theme-dark": "smui-theme compile static/smui-dark.css -i src/theme/dark"
  }
}
```

For a light-only theme:

```json
{
  "scripts": {
    "prepare": "npm run smui-theme",
    "smui-theme": "smui-theme compile static/smui.css -i src/theme"
  }
}
```

Integrate these scripts into the project's existing scripts without overwriting unrelated commands.

**Important:** the theme compiler includes Sass for the SMUI packages installed when the theme is compiled. Whenever a new SMUI package is added, rerun the theme build and restart the SvelteKit development server.

## Load generated styles in `src/app.html`

Light and dark system preference example:

```html
<link
  rel="stylesheet"
  href="/smui.css"
  media="(prefers-color-scheme: light)"
/>
<link
  rel="stylesheet"
  href="/smui-dark.css"
  media="screen and (prefers-color-scheme: dark)"
/>
```

For a single theme:

```html
<link rel="stylesheet" href="/smui.css" />
```

## Fonts

SMUI's Material styling uses Roboto. The official guide also includes Roboto Mono for code-oriented content.

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<link
  href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital@0;1&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
  rel="stylesheet"
/>
```

If external font loading is not allowed by the product's privacy, CSP, or performance requirements, choose a locally hosted font strategy and document the decision.

## Icons

### Material Icons font

```html
<link
  href="https://fonts.googleapis.com/css2?family=Material+Icons&display=swap"
  rel="stylesheet"
/>
```

### Material Design Icons SVG package

```bash
npm install --save-dev @mdi/js
```

The MDI SVG approach can avoid downloading a complete icon font when only a subset of icons is used. Follow the official Icon Button demo for the exact SVG composition pattern.

Do not use text glyphs as the only accessible name for icon-only controls. Provide an accessible title or label.

## Default and premade themes

The `svelte-material-ui` package provides a `bare.css` stylesheet and premade themes. The official installation guide lists these theme files:

- `themes/svelte.css`
- `themes/svelte-dark.css`
- `themes/material.css`
- `themes/material-dark.css`
- `themes/fixation.css`
- `themes/fixation-dark.css`
- `themes/muted.css`
- `themes/muted-dark.css`
- `themes/bubblegum.css`
- `themes/bubblegum-dark.css`
- `themes/metro.css`
- `themes/metro-dark.css`
- `themes/unity.css`
- `themes/unity-dark.css`

The premade theme files are installed through the `svelte-material-ui` package. Verify the current package release before using a CDN URL; never copy an old version number from an example.

`bare.css` is convenient but offers fewer theming controls than a custom Sass theme. Individual package `bare.css` files can be useful when only a small subset of SMUI is used.

## Build tooling

The official installation guide mentions Svelte-aware package resolution for older Rollup and Webpack setups. For a current SvelteKit/Vite project, do not add legacy resolver configuration unless the actual build reports a package export-condition problem.

## Checklist

- [ ] Installed Svelte version is 5.
- [ ] Installed SMUI packages match the project's lockfile policy.
- [ ] Theme builder is installed if using a custom Sass theme.
- [ ] Theme template exists.
- [ ] Theme compilation includes all installed SMUI packages.
- [ ] Generated CSS is linked in `src/app.html`.
- [ ] Roboto and icon strategy is selected.
- [ ] Adding a component package triggers theme recompilation.
- [ ] Production build includes generated CSS.
