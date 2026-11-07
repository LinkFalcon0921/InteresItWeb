# 04 — SMUI component and package catalog

The catalog below covers the component families listed by the official SMUI documentation and repository README. The package names are intended as discovery hints; confirm the exact package and version against the official demo's Installation section and the project's package registry before adding a dependency.

| Family | Component | Package / implementation | Official demo |
|---|---|---|---|
| Expansion | Accordion | `@smui-extra/accordion` | https://sveltematerialui.com/demo/accordion/ |
| Actions | Button | `@smui/button` | https://sveltematerialui.com/demo/button/ |
| Actions | Floating Action Button | `@smui/fab` | https://sveltematerialui.com/demo/fab/ |
| Actions | Icon Button | `@smui/icon-button` | https://sveltematerialui.com/demo/icon-button/ |
| App bars | Bottom App Bar | `@smui-extra/bottom-app-bar` | https://sveltematerialui.com/demo/bottom-app-bar/ |
| App bars | Top App Bar | `@smui/top-app-bar` | https://sveltematerialui.com/demo/top-app-bar/ |
| Status | Badge | `@smui-extra/badge` | https://sveltematerialui.com/demo/badge/ |
| Status | Banner | `@smui/banner` | https://sveltematerialui.com/demo/banner/ |
| Content | Card | `@smui/card` | https://sveltematerialui.com/demo/card/ |
| Shared utilities | Common | `@smui/common` | https://sveltematerialui.com/demo/common/ |
| Data | Data Table | `@smui/data-table` | https://sveltematerialui.com/demo/data-table/ |
| Overlays | Dialog | `@smui/dialog` | https://sveltematerialui.com/demo/dialog/ |
| Navigation | Drawer | `@smui/drawer` | https://sveltematerialui.com/demo/drawer/ |
| Styling | Elevation | Sass utilities in common; no standalone Svelte component | https://sveltematerialui.com/demo/elevation/ |
| Overlays | Flyout Panel | `@smui/flyout-panel` | https://sveltematerialui.com/demo/flyout-panel/ |
| Content | Image List | `@smui/image-list` | https://sveltematerialui.com/demo/image-list/ |
| Inputs | Autocomplete | `@smui-extra/autocomplete` | https://sveltematerialui.com/demo/autocomplete/ |
| Inputs | Checkbox | `@smui/checkbox` | https://sveltematerialui.com/demo/checkbox/ |
| Inputs | Chips | `@smui/chips` | https://sveltematerialui.com/demo/chips/ |
| Inputs | Chip Input | `@smui-extra/chip-input` | https://sveltematerialui.com/demo/chip-input/ |
| Inputs | Floating Label | `@smui/floating-label` | https://sveltematerialui.com/demo/floating-label/ |
| Inputs | Form Field | `@smui/form-field` | https://sveltematerialui.com/demo/form-field/ |
| Inputs | Line Ripple | `@smui/line-ripple` | https://sveltematerialui.com/demo/line-ripple/ |
| Inputs | Notched Outline | `@smui/notched-outline` | https://sveltematerialui.com/demo/notched-outline/ |
| Inputs | Radio Button | `@smui/radio` | https://sveltematerialui.com/demo/radio/ |
| Inputs | Segmented Button | `@smui/segmented-button` | https://sveltematerialui.com/demo/segmented-button/ |
| Inputs | Select Menu | `@smui/select` | https://sveltematerialui.com/demo/select/ |
| Inputs | Slider | `@smui/slider` | https://sveltematerialui.com/demo/slider/ |
| Inputs | Switch | `@smui/switch` | https://sveltematerialui.com/demo/switch/ |
| Inputs | Text Field | `@smui/textfield` | https://sveltematerialui.com/demo/textfield/ |
| Layout | Layout Grid | `@smui/layout-grid` | https://sveltematerialui.com/demo/layout-grid/ |
| Navigation | List | `@smui/list` | https://sveltematerialui.com/demo/list/ |
| Menus | Menu Surface | `@smui/menu-surface` | https://sveltematerialui.com/demo/menu-surface/ |
| Menus | Menu | `@smui/menu` | https://sveltematerialui.com/demo/menu/ |
| Surfaces | Paper | `@smui/paper` | https://sveltematerialui.com/demo/paper/ |
| Progress | Circular Progress | `@smui/circular-progress` | https://sveltematerialui.com/demo/circular-progress/ |
| Progress | Linear Progress | `@smui/linear-progress` | https://sveltematerialui.com/demo/linear-progress/ |
| Interaction | Ripple | `@smui/ripple` | https://sveltematerialui.com/demo/ripple/ |
| Feedback | Snackbar | `@smui/snackbar` | https://sveltematerialui.com/demo/snackbar/ |
| Tabs | Tab | `@smui/tab` | https://sveltematerialui.com/demo/tabs/ |
| Tabs | Tab Bar | `@smui/tab-bar` | https://sveltematerialui.com/demo/tabs/ |
| Feedback | Tooltip | `@smui/tooltip` | https://sveltematerialui.com/demo/tooltip/ |
| Interaction | Touch Target | `@smui/touch-target` | https://sveltematerialui.com/demo/touch-target/ |
| Typography | Material Typography | Sass mixins; no standalone Svelte component | https://sveltematerialui.com/demo/typography/ |

## Related subcomponents

Some component families expose subcomponents from the same package or a package-specific subpath:

- Text Field: helper text, icon, character counter.
- Select: helper text and icon.
- Snackbar: Kitchen snackbar generator.
- Tabs: Tab and Tab Bar packages.
- Dialog: Title, Content, Actions, and specialized dialog helpers.
- Data Table: Head, Body, Row, Cell.
- Card: Content and action-related elements.
- Button and Icon Button: Label and Icon exports.

Do not assume every subcomponent is imported from `@smui/common`. The repository README explicitly notes exceptions for Chips, Textfield icons, and Select icons. Follow the exact demo imports.

## Component selection guidance

- Button: primary form actions, navigation actions, and commands.
- FAB: one prominent creation or primary action on a page.
- Icon Button: compact toolbar or row actions; always provide an accessible name.
- Card: grouped content and summary surfaces.
- Data Table: structured rows, selection, sorting, pagination, and progress states.
- Dialog: focused confirmation or short modal workflows.
- Drawer: persistent, dismissible, or modal navigation.
- Select: finite options; use Autocomplete when the option set is searchable or large.
- Text Field: text and numeric input; parse raw values before application use cases.
- Switch: immediate on/off settings; use a checkbox for form semantics when that is more appropriate.
- Slider: bounded continuous or discrete selection; not a substitute for precise financial input.
- Snackbar: brief status feedback; do not use it as the only place for critical errors.
- Tooltip: supplemental hints; do not hide essential instructions inside tooltips.
- Progress indicators: loading or progress feedback; communicate determinate progress where available.
- Tabs: peer content sections within the same context, not a replacement for primary navigation.
- Accordion: optional disclosure of secondary information.
- Flyout Panel: contextual panel for actions or status attached to a container or viewport.

## Important component-specific notes

### Select

- Primitive string options can be used with `Option`.
- Object options need a key function that returns unique strings.
- SMUI 8 changed the default value behavior: do not assume an undefined value becomes an empty string.
- Inside a native form, use the documented `hiddenInput` and `input$name` props when the value must be submitted.

### Data Table

The demos cover simple tables, progress indicators, sticky headers, row selection, pagination, and sorting. The sticky-header demo warns that sticky headers do not work when an ancestor has `overflow: hidden`, `scroll`, or `auto`.

### Bottom App Bar

The official demo notes that Material's specification recommends bottom app bars for mobile devices. Inside containers, only the static variant is documented as working.

### Tooltip

SMUI 9 requires a `Label` child for plain tooltips. Rich tooltips use `Content`. Verify exact composition in the current demo.

### Icon Button

SMUI 9 expects at least one `Icon` child. Use the current package's Icon export and include an accessible title/name.

### Typography and Elevation

These are Sass-based utilities. Do not look for a Svelte component where the official docs describe Sass mixins or modules.
