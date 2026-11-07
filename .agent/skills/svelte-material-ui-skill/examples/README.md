# SMUI examples

These are original, small examples based on the official SMUI 9 demos and adapted to the project's Clean Architecture and coding standards.

## Contents

- `domain/TransactionCategory.ts`: finite domain values, labels, and parser.
- `components/SaveButton.svelte`: typed button callback.
- `components/TransactionDescriptionField.svelte`: Textfield with a helper snippet.
- `components/CategorySelect.svelte`: Select with enum-backed values.
- `components/ConfirmTransactionDialog.svelte`: controlled confirmation dialog.
- `components/TransactionTable.svelte`: typed Data Table.
- `components/RecurringExpenseSwitch.svelte`: Switch with FormField label snippet.
- `components/NotificationSnackbar.svelte`: Snackbar instance usage.
- `theme/_smui-theme.scss`: custom Sass theme starting point.
- `sveltekit/app.html.fragment`: stylesheets and fonts fragment.

Install only the packages required by the examples you actually use. Rebuild the theme after adding packages.

These examples are illustrative; confirm package APIs against the installed version and the official demo source before production use.
