---
name: pom-conventions
description: >-
  Builds Playwright Page Objects for Didaxis UI tests. Use when creating or
  editing page objects, LoginPage, ProgramsPage, NewProgramModal, or when a
  spec should stop using inline locators and follow the Page Object Model.
---

# Page Object conventions

Didaxis UI tests talk to the app through classes in `pages/`. The spec
asserts. The page object acts.

## Layout

```
pages/
├── LoginPage.ts
├── ProgramsPage.ts
└── NewProgramModal.ts
```

`ProgramsPage` owns a `readonly newProgramModal: NewProgramModal`. Do not
construct the modal from the spec.

Spec files stay `tests/didaxis/dsX-[ticket-title].spec.ts`.

## Locators

Assign stable locators as `readonly` properties in the constructor. Use
user-facing queries in this order:

1. `getByRole`
2. `getByLabel` or `getByPlaceholder`
3. `getByText`
4. `getByTestId` — escape hatch only, with a comment that says why role,
   label, placeholder, and text cannot identify the element

No CSS, no XPath, no `page.locator()`.

When a query matches more than one element, narrow it with
`.filter({ hasText })`. Do not use `.first()`.

A locator that needs a value from the test (a program name) is a method
on the page object, still built with those same queries:

- `programRow(name)` — row that has `Edit ${name}`
- `programTitle(name)` — exact text of that name inside the row
- `programNameCell(name)` — the cell in that row filtered by the program
  name (`.filter({ hasText: name })`, not `.first()`)
- `editButton(name)` — button `Edit ${name}`

The spec must not call `getByRole`, `getByLabel`, `getByPlaceholder`,
`getByText`, `getByTestId`, or `locator()`. It uses the page object's
properties and methods.

## Actions

Methods perform user actions: `goto`, `signIn`, `openNewProgramForm`,
`fill`, `submit`, `cancel`, `createProgram`. No `expect()` inside a page
object. Leave every assertion in the spec.

No `waitForTimeout` in a page object or a spec. Readiness is a web-first
assertion in the spec: `expect(locator).toBeVisible()`, `.toBeEnabled()`,
or `.toHaveText()`. Do not write
`expect(await locator.isVisible()).toBe(true)`. Replacing a locator or a
wait does not change what the assertion checks.

`LoginPage.signIn(email, password)` receives credentials as arguments.
Read them from `DIDAXIS_EMAIL` and `DIDAXIS_PASSWORD` in the setup test.
`LoginPage.goto()` uses `DIDAXIS_URL`. Do not hardcode the host or a
password.

`ProgramsPage.goto()` opens `/programs` through Playwright `baseURL`.
`ProgramsPage.programsNav` is the Programs button used after sign-in,
because login lands on the dashboard.

`createProgram(name, description, onCreated)` opens the form, submits,
parses the POST `/api/programs` uuid, and calls `onCreated` immediately.
Tests that create a program pass `trackProgram` as that callback. See
the api-cleanup skill. Do not assert that the dialog closed inside the
page object; the spec does.

## Spec shape

```ts
let programs: ProgramsPage;

test.beforeEach(async ({ page }) => {
  programs = new ProgramsPage(page);
  await programs.goto();
  await expect(programs.heading).toBeVisible();
});
```

Auth setup signs in with `LoginPage`, clicks `ProgramsPage.programsNav`,
waits for `**/programs`, then saves `playwright/.auth/user.json`.

`page.route` for a programs API edge case stays in the spec. The spec
still drives the screen through `ProgramsPage`, `NewProgramModal`, and
`LoginPage`. Add an error or empty-state locator only after that copy
has been read on the real page. Do not guess the string. See the
Programs API edge cases section of `.cursor/rules/playwright-conventions.mdc`.
