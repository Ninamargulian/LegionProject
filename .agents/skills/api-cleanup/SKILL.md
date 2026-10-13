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
2. When a test creates a program, capture the program's UUID and call
   `trackProgram(uuid)` immediately.
3. Do not write manual `afterAll` blocks for cleanup — the fixture
   collects UUIDs during the run and deletes them after all tests
   in the worker finish.
4. Cleanup uses the DELETE API, not the UI:
   `DELETE /api/programs/<uuid>` with a Bearer token from
   `process.env.DIDAXIS_API_TOKEN`.
5. Never hardcode the token. Never delete data the test did not create.

## Reference

- Endpoint: `DELETE https://test.didaxis.studio/api/programs/<uuid>`
- Auth: `Authorization: Bearer ${DIDAXIS_API_TOKEN}`

If the token expired, capture a new one after login: DevTools → Network → any authorized API call → `Authorization` header, or listen for Bearer tokens on the Playwright `page` (see `captureBearerTokenFromPage` in `tests/didaxis/programs.api.ts`). Store it in `.env` as `DIDAXIS_API_TOKEN` (do not commit).
