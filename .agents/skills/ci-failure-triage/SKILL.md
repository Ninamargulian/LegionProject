---
name: ci-failure-triage
description: Diagnose a failed CI run. Use when the user says the build is red, CI failed, checks are failing, the pipeline broke, a PR is failing, or e2e.yml failed — even if they don't ask for triage. Pulls the run's logs and playwright-report (GitHub MCP or gh), reads the error and trace, cross-references the spec and POM, classifies app bug vs test issue, and reports the root cause with file:line.
---

# CI Failure Triage

## Steps
1. Pull the failed run's logs + playwright-report artifact (GitHub MCP / gh CLI).
2. Read the Playwright error: failing test, expected vs received, trace path.
3. Cross-reference: the spec, the POM, and the Didaxis source in the repo if exist.
4. Classify: real app bug (route to a Jira bug via bug-reporter) vs
   test issue (propose a patch for human review).
5. Report: post root cause, affected file, expected/actual, suggested fix,
   and evidence (trace/screenshot + run id) as a PR comment.

## Rules
- Never merge a fix automatically — propose, a human approves.
- For a real defect, reuse the bug-reporter skill and link the story.
- The diagnosis must name the source location and cause, not just the symptom.
- Check that the numbers (expected/received, call log) match your explanation before classifying.
- Do not trust "known failure" comments in the code as proof — verify against the trace and call log.
- If a new value contains the old one (e.g. "X" → "X - Updated"), check whether the locator needs `exact: true`.

## Resolve the failed run

Use `gh` for all GitHub operations. Request `network` / `all` permissions when downloading artifacts.

**PR context** — prefer the check tied to the current branch:

```bash
gh pr checks --watch=false
gh pr view --json number,headRefName,commits
```

**Run id** — from the failing check URL or:

```bash
gh run list --workflow=e2e.yml --limit 5
gh run view <run-id> --log-failed
```

Workflow artifact name: `playwright-report` (see `.github/workflows/e2e.yml`).

```bash
mkdir -p .ci-triage/<run-id>
gh run download <run-id> -n playwright-report -D .ci-triage/<run-id>/playwright-report
```

Open `playwright-report/index.html` indirectly: read embedded failure text from CI logs first, then inspect `test-results/` and trace zip paths referenced in the log. Unzip traces under `.ci-triage/<run-id>/` when you need step-level DOM/network evidence.

## Investigation checklist

Copy and track:

```
- [ ] Failing spec path and exact test title (`-g` title)
- [ ] Assertion: expected vs received (from log or report)
- [ ] Stack points to spec vs `pages/` POM
- [ ] POM locators/actions match current UI (apply pom-conventions)
- [ ] Ticket key from `test.describe`, title, or `features/<KEY>.feature`
- [ ] Didaxis app source in repo (if any) vs test-only repo
- [ ] Env/secrets/credentials called out in log (not a product bug)
- [ ] Classification: product defect | test issue | env/flake
```

## Classification

| Outcome | Action |
|---------|--------|
| **Product defect** | Follow [jira-bug-reporter](../jira-bug-reporter/SKILL.md). Include CI run id and artifact paths in the Bug description. |
| **Test issue** | Draft a minimal patch (spec and/or POM). Do not merge; leave for review. |
| **Env / credentials / flake** | Explain in the PR comment. Do not file a product Bug. |

## PR comment template

Post with `gh pr comment <number> --body-file ...` (never auto-merge fixes):

```markdown
## CI failure triage

**Run:** [<run-id>](https://github.com/<owner>/<repo>/actions/runs/<run-id>)
**Workflow:** E2E Tests (`e2e.yml`)

### Summary
<one sentence root cause, not symptom>

### Classification
Product defect | Test issue | Environment

### Failing test
- Spec: `tests/...`
- Title: `<exact title>`

### Expected vs actual
- **Expected:** ...
- **Actual:** ...

### Source location
- **File:** `path:line` — <why this line causes the failure>

### Suggested fix
<concrete next step or patch summary; link Jira DS-xxx if filed>

### Evidence
- Log excerpt or assertion message
- Trace/screenshot path from `playwright-report` or `test-results/`
```

If triage runs on a push to `main` with no open PR, post the same structure as a commit comment or summarize in chat with the run URL.

## Related skills

- [jira-bug-reporter](../jira-bug-reporter/SKILL.md) — Jira Bug when classification is product defect
- [pom-conventions](../pom-conventions/SKILL.md) — locator and POM structure when the failure is test-side
- [api-cleanup](../api-cleanup/SKILL.md) — if the failure involves leftover test data