---
name: jira-ticket-to-gherkin
description: Turns a Jira ticket's acceptance criteria into structured, reviewable Gherkin test scenarios. Use this skill whenever the user references a Jira ticket (DS-1, DS-2, etc.) and asks for test cases, a test plan, scenarios, or wants to plan testing for a ticket — even if they don't say the word "Gherkin".
---

# Jira Ticket to Gherkin Test Cases

Generate reviewable test scenarios from a Jira ticket. The Gherkin output
is a human-readable checkpoint — the QA reviews it before any Playwright
code gets written.

## Steps

1. Read the referenced Jira ticket using the Atlassian MCP. Extract the
   title, description, and every acceptance criterion.

2. Generate test scenarios as a Gherkin `.feature` file:
   - One `Feature`, named after the ticket
   - Cover every acceptance criterion with at least one `Scenario`
   - Add negative scenarios — what should NOT happen
   - Add edge-case scenarios — boundaries, empty inputs, duplicates,
     special characters, max length

3. Write each scenario in Given / When / Then form. `Given` sets the
   starting state, `When` is the action under test, `Then` is the
   observable expected outcome.

4. Group scenarios with comments: `# Happy paths`, `# Negative`, `# Edge cases`.

5. Use real, specific values from the ticket — never placeholders.

6. End the file with a comment block listing any ambiguities or gaps
   found in the ticket's acceptance criteria, so the QA can resolve them.

## Output

Save as `features/<ticket-key>.feature`.

## Atlassian MCP

1. Use the Atlassian MCP server. Read tool schemas before calling (Cursor:
   `mcps/plugin-atlassian-atlassian/tools/`; Claude Code: available MCP tool
   descriptors for the configured Atlassian server).
2. Resolve `cloudId` via `getAccessibleAtlassianResources`, or pass the site hostname from a Jira URL (e.g. `legionqaschool.atlassian.net`).
3. Fetch the ticket with `getJiraIssue`:
   - `issueIdOrKey`: ticket key (e.g. `DS-1`)
   - `responseContentFormat`: `markdown`
4. Parse acceptance criteria from description, custom fields, or linked Confluence pages. If ACs are embedded as Gherkin, treat them as minimum coverage — still add negative and edge scenarios.

## Feature file format

```gherkin
Feature: <ticket title>
  <ticket key> — <one-line summary from Jira>

  # Happy paths

  Scenario: <expected behavior>
    Given ...
    When ...
    Then ...

  # Negative

  Scenario: <what must not happen>
    Given ...
    When ...
    Then ...

  # Edge cases

  Scenario: <boundary or unusual input>
    Given ...
    When ...
    Then ...

  # Ambiguities and gaps
  # - <gap or unclear AC>
```

Tag scenarios with `@TC-NNN` and the AC they trace to (e.g. `@AC-EmptyNameValidation`) when helpful for review.

## Additional resources

- For a full example derived from DS-1, see [examples.md](examples.md)
