# Example: DS-2 TC-002 failure → Jira Bug

## Inferred from Playwright

- **Story:** DS-2  
- **Spec:** `tests/ds2-edit-program.spec.ts`  
- **Test:** `TC-002: Program list shows updated name immediately after Save (Jira rename AC)`  
- **Assertion:** `Edit {original name}` count expected 0, received 1  

## Suggested bug title

`[DS-2] Programs edit — stale row shows previous name after rename`

## Description snippet

```markdown
## Summary
After saving a program rename on `/programs`, the list shows the new name but the old `Edit {original name}` control is still present.

## Environment
- Site: https://test.didaxis.studio
- Browser: chromium, workers=1

## Failing test
- **Spec:** `tests/ds2-edit-program.spec.ts`
- **Test:** TC-002: Program list shows updated name immediately after Save (Jira rename AC)

## Steps to reproduce
1. Log in as admin on test.didaxis.studio.
2. Create a program (e.g. unique "Web Development 2026-…" with description "Full-stack web development program").
3. Open **Edit Program**, change **Program Name** to "{name} - Updated", click **Save**.
4. Without refreshing, search the table for row actions.

## Expected result
- **Edit Program** modal closes.
- Only **Edit {updated name}** exists for that program; **Edit {original name}** count is 0.

## Actual result
- **Edit {updated name}** is visible.
- **Edit {original name}** still present (count 1).

## Evidence
- Screenshot: `test-failed-1.png` (attached)
- Error context: `test-results/ds2-edit-program-.../error-context.md`

## Related story
**DS-2** — Jira AC "Successfully edit a program name" (list immediately shows updated name).

## Notes
Likely related to DS-9 / DS-108 (stale list after edit). Not a Playwright locator issue — row-scoped `Edit {name}` buttons used.
```

## Link

`createJiraIssueLink`: Bug **DS-235** Relates **DS-2** (example keys from a prior run).
