---
name: api-cleanup
description: Ensures Playwright tests clean up the data they create.
  Use whenever generating or reviewing tests that create programs (or
  any persistent records) in Didaxis, so test data does not accumulate.
  Apply this to every test that creates data — even if cleanup isn't
  explicitly requested.
---
# API Cleanup for Test Data
Tests that create data must remove it. Leftover data slows the app and
makes test runs unreliable. Every test that creates a program must track
its UUID and delete it via the API afterwards.

## Steps
1. Use the shared cleanup fixture in `fixtures/cleanup.fixture.ts`.
   Import `test` from there, not from `@playwright/test`.
2. When a test creates a program, pass `trackProgram` as the fourth
   argument of `createProgram` so the UUID is tracked as soon as the
   POST `/api/programs` response is parsed:
   `await createProgram(page, name, description, trackProgram)`
3. Do not write manual `afterAll` blocks for cleanup. The fixture
   uses worker scope (`scope: 'worker'`): it collects UUIDs during the
   run and deletes them once, after all tests in that worker finish.
4. Cleanup uses the DELETE API, not the UI:
   `DELETE ${DIDAXIS_URL}/api/programs/<uuid>` with a Bearer token.
   The token comes from `.env` (`DIDAXIS_API_TOKEN` or `DIDAXIS_API_KEY`)
   or is captured from page requests after login when that token is
   expired. See `captureBearerTokenFromPage` in
   `tests/didaxis/programs.api.ts`. Never hardcode the token.
5. Never delete data the test did not create. The manual bulk-delete
   spec (`tests/manual/bulk-delete-programs.spec.ts`) may only target
   programs whose name contains a 13-digit timestamp (`/\d{13}/`),
   which `uniqueName()` adds via `Date.now()`.

## Reference

- Base URL: `process.env.DIDAXIS_URL` (do not hardcode the host)
- Endpoint: `DELETE ${DIDAXIS_URL}/api/programs/<uuid>`
- Auth: `Authorization: Bearer <token from .env or a live page request>`

Store a token in `.env` as `DIDAXIS_API_TOKEN` if you have one (do not
commit `.env`). If it expires, the fixture remembers a Bearer from UI
network traffic after login.
