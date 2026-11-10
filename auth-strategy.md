# Auth Strategy for Didaxis Tests

This file captures which authentication approach to use for which kind of
test. It is a building block — combined with other decision files in a
later block, it becomes part of a Playwright Skill the agent applies
automatically.

## If you're testing the login page itself

Use UI login. The login flow IS what the test is verifying.

- Test starts with no session: `test.use({ storageState: { cookies: [], origins: [] } })`
- Navigate to /login, fill credentials, click Sign In, assert success.

## If you're testing any other feature

Use the stored session (Playwright's storageState).

- The `setup` project runs `auth.setup.ts` once before the suite.
- It logs in via UI and saves cookies + localStorage to `playwright/.auth/user.json`.
- All other tests start authenticated — no UI login per test.

## If you need raw speed or programmatic setup

Use API login.

- POST to the auth endpoint with credentials.
- Inject the token/cookie into the context.
- Useful for: bulk data setup, one-off scripts, when storageState is stale.

## Default

Stored session for everything except login-page tests.
