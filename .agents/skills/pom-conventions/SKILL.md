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
only `getByRole`, `getByLabel`, and `getByText`. No CSS, no XPath, no
`page.locator()`.

A locator that needs a value from the test (a program name) is a method
on the page object, still built with those same queries:

- `programRow(name)` — row that has `Edit ${name}`
- `programTitle(name)` — exact text of that name inside the row
- `programNameCell(name)` — first cell of that row
- `editButton(name)` — button `Edit ${name}`

The spec must not call `getByRole`, `getByLabel`, `getByText`, or
`locator()`. It uses the page object's properties and methods.

## Actions

Methods perform user actions: `goto`, `signIn`, `openNewProgramForm`,
`fill`, `submit`, `cancel`, `createProgram`. No `expect()` inside a page
object. Leave every assertion in the spec.

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
