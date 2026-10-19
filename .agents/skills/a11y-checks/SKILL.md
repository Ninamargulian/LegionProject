---
name: a11y-checks
description: >-
  Adds an axe-core accessibility scan to Playwright tests that open a page.
  Use whenever creating or extending a spec that navigates to a screen,
  including a fresh page, a new page, or a new UI test, even when the user
  does not mention accessibility, axe, or a11y.
---

# Accessibility checks

A Playwright test that opens a Didaxis screen also scans that screen with
`@axe-core/playwright`. Add the scan without being asked.

## Scan

Use the stored session. Do not log in through the UI. Open the screen
through its page object (`ProgramsPage.goto()`, and the same pattern for
any new page).

```ts
import AxeBuilder from '@axe-core/playwright';

await expect(pageObject.heading).toBeVisible();
const results = await new AxeBuilder({ page }).analyze();
await expect(results.violations).toEqual([]);
```

`expect` comes from `@playwright/test` (or the cleanup fixture when the
test also creates data). The assertion is on `results.violations`, and it
stays empty. Do not filter the array in the test to hide a hit.

Tag the full-page scan `@regression` with Playwright's `tag` option.

## Scoped scan

After the page object opens a component, limit the scan with `include()`.
`include()` takes an axe selector string, not a Playwright locator. Open
the component with the page object first, then pass a role selector such
as `[role="dialog"]`.

```ts
await programs.openNewProgramForm();
await expect(programs.newProgramModal.dialog).toBeVisible();
const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
await expect(results.violations).toEqual([]);
```

## Rules

Do not call `disableRules()` to make a red scan pass. A real violation
stays failing. Record the rule id, impact, help text, and the target
nodes. That record is the input for the jira-bug-reporter skill; do not
file the bug unless the user asks.

`disableRules()` is allowed only with a comment on the previous line that
states why the rule is a false positive or an accepted exception. One
rule per call. Never disable a rule whose violation you have not read.
