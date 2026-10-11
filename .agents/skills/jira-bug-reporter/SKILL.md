---
name: jira-bug-reporter
description: Analyzes Playwright test failures, identifies root cause, and creates detailed Jira bug tickets. Use when a test fails and needs investigation and bug reporting.
---

# Jira Bug Reporter (Playwright failures)

Turn a failed Playwright test into a **Bug** in Jira, **linked to the story** under test (e.g. DS-2), with reproduction steps, expected vs actual, code paths, and screenshot evidence.

## When to use

- A Playwright test failed (local run, CI, or user pasted failure output).
- User asks to file a bug, report a failure, or investigate a red test.
- Multiple failures: one bug per **distinct root cause**; reference other tests in the same bug only if they share one defect.

## Investigation checklist

1. **Failure artifact** (read before guessing):
   - `test-results/**/error-context.md`
   - `test-results/**/test-failed-*.png` (or trace screenshot)
   - Playwright HTML report if present: `playwright-report/index.html`
2. **Test source**: the spec file and test title (e.g. `tests/ds2-edit-program.spec.ts` — TC-002).
3. **Story mapping**: infer Jira key from spec/describe name or `@TC` / feature file (DS-1 → `DS-1`). Confirm with `getJiraIssue` if unclear.
4. **Root cause**: product defect vs test/locator/env (shared tenant, flaky create modal). State which in the bug; do not file product bugs for pure test strict-mode issues without noting "test data / locator".

## Bug title

Format (concise, searchable):

`[<StoryKey>] <area> — <observable failure>`

Example: `[DS-2] Programs edit — old program name still in list after rename`

Include reporter name in title when the user asks (e.g. `[Nina]`).

## Bug description (markdown)

Use this structure in `createJiraIssue` → `description`:

```markdown
## Summary
One sentence: what broke and where.

## Environment
- Site: (e.g. test.didaxis.studio)
- Browser/project: (e.g. chromium)
- Date/run: (if known)

## Failing test
- **Spec:** `path/to/spec.ts`
- **Test:** `<full test title>`
- **TC / trace:** `@TC-NNN` or Gherkin scenario if applicable

## Steps to reproduce
1. …
2. …
(Use real program names/values from the test when possible.)

## Expected result
What the test (or AC) asserts should happen.

## Actual result
What happened instead (assertion message, timeout, count mismatch).

## Evidence
- Screenshot: `<filename>` (attached)
- Error context: `test-results/.../error-context.md` (summarize key lines)

## Related story
Parent/feature ticket: **DS-N** — link and brief AC reference.

## Notes
Root-cause hypothesis, known duplicate defects (DS-9, DS-131, …), flakiness.
```

## Create and link in Jira (Atlassian MCP)

1. `getAccessibleAtlassianResources` → `cloudId` (reuse for all calls).
2. `getJiraIssue` on the **story** key for summary/context.
3. `createJiraIssue`:
   - `projectKey`: same as story (e.g. `DS`)
   - `issueType`: `Bug`
   - `summary`: title above
   - `description`: markdown body
   - `priority`: match story or `High` for AC/regression breaks
   - `labels`: e.g. `playwright`, `didaxis`, story key lowercased
4. **Link bug to story** with `createJiraIssueLink`:
   - Prefer **Relates** or team-standard type from `listJiraIssueLinkTypes` if unsure.
   - Example: `inwardIssue` = new bug key, `outwardIssue` = `DS-2` (read link type direction from tool docs).
5. Optional: `addOrEditJiraIssueComment` on the **story** with bug key and one-line summary.

## Attach screenshots

Playwright failure PNGs live under `test-results/`. Attach each relevant image to the **bug** (not the story):

1. `executeWrite` → `uploadAttachmentToJiraIssue` with `filePath` only → run returned `uploadCommand` in shell from repo root.
2. Call again with `fileId` + `issueIdOrKey` = new bug key to complete attach.

Prefer: failure screenshot, optional full-page if helpful. Do not attach `.env` or secrets.

## Output to the user

After filing, reply with:

- Bug URL (`https://<site>.atlassian.net/browse/DS-XXX`)
- Link type to story
- List of attachments added
- One-line root-cause summary

## Do not

- Create duplicate bugs without searching Jira (`searchJiraIssuesUsingJql` on summary keywords + story).
- Put credentials in the description.
- Auto-fix tests or product code unless the user asks separately.

## Additional resources

- Bug body example: [examples.md](examples.md)
