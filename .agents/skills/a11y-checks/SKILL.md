---
name: a11y-checks
description: >-
  Adds a WCAG axe scan and a keyboard check to Playwright tests that open a
  page. Use whenever creating or extending a spec that navigates to a screen,
  including the programs page, a fresh page, or a new UI test, even when the
  user does not mention accessibility, axe, or a11y.
---

# Accessibility checks

A Playwright test that opens a Didaxis screen also covers that screen for
accessibility. Add the coverage without being asked. On the programs page
that is two tests: an axe scan, and a keyboard check axe cannot do.

Use the stored session. Do not log in through the UI. Open the screen
through its page object (`ProgramsPage.goto()`, and the same pattern for
any new page). The spec uses that page object's properties and methods.
No inline locators in the spec: no `getByRole`, `getByLabel`,
`getByPlaceholder`, `getByText`, `getByTestId`, or `locator()`. Role-based
locators stay on the page object. `ProgramsPage.newProgramButton` is
`getByRole('button', { name: '+ New Program' })`.
`NewProgramModal.dialog` is `getByRole('dialog', { name: 'New Program' })`.

Each test has exactly one tag, `@regression`. Do not put a second tag on
the same test.

## Axe scan

Wait until the page object's heading is visible, then scan.

```ts
import AxeBuilder from '@axe-core/playwright';

await expect(programs.heading).toBeVisible();
const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa'])
  .analyze();
await expect(results.violations).toEqual([]);
```

`expect` comes from `@playwright/test` (or the cleanup fixture when the
test also creates data). The assertion is `toEqual([])` on
`results.violations`. Do not filter the array.

Scan the page that is open. Call `.include()` or `.exclude()` only when a
third-party widget is noisy. The comment on the previous line names that
widget and why. Do not scope the scan to a Didaxis dialog, and do not
scope it to hide a violation in the app. `include()` and `exclude()` take
an axe selector string, not a Playwright locator. Use the selector the
live page shows for that widget. Do not invent one.

## Keyboard

Axe does not prove the primary control is reachable or that Enter opens
the dialog. On the programs page, tab to `programs.newProgramButton`,
assert `toBeFocused()`, press Enter, and assert
`programs.newProgramModal.dialog` is visible.

Press `Tab`. Do not call `.focus()` or `.click()` in place of Tab. Repeat
Tab until the page-object control is focused, then assert. The button and
the dialog are the existing role locators. Do not query them again in the
spec.

```ts
test(
  'Enter on New Program opens the dialog',
  { tag: '@regression' },
  async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.heading).toBeVisible();

    for (let step = 0; step < 25; step += 1) {
      if (await programs.newProgramButton.evaluate((el) => el === document.activeElement)) {
        break;
      }
      await page.keyboard.press('Tab');
    }
    await expect(programs.newProgramButton).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(programs.newProgramModal.dialog).toBeVisible();
  },
);
```

The loop only moves focus. `toBeFocused()` is the assertion. If the
control is never reached, that assertion fails.

## Violations

If the scan's `violations` array is not empty, report every hit: rule id,
impact, help text, and target nodes. Then stop. Leave the test failing.

Do not call `disableRules()`. Do not filter `results.violations`. Do not
weaken `toEqual([])`. Do not add `.include()` or `.exclude()` to make the
run green. A real violation stays failing. Filing a Jira bug waits until
a human confirms it.
