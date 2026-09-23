# Prompt Template "Test Plan" from a Jira Ticket

## Role

You are a senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the [Create new academic program] feature.

## Acceptance Criteria

Scenario: Navigate to program creation form
Given I am logged in as admin
When I navigate to the Programs page
And I click "+ New Program"
Then I see the program creation form with fields: Program Name, Description

Scenario: Successfully create a program
Given I am on the program creation form
When I fill in Program Name with "Web Development 2026"
And I fill in Description with "Full-stack web development program"
And I click Create
Then the modal closes
And the program list shows "Web Development 2026"

Scenario: Validation prevents empty program name
Given I am on the program creation form
When I leave the Program Name field empty
Then the Create button is disabled

## Requirements for the test plan

- All test cases must be in Gherkin

- Cover every AC with at least one test case

- Add edge cases the ACs don't mention

  (boundary values, empty inputs, special characters, duplicates, max-length)

- Add negative test cases (what should NOT happen)

- Structure each test case as:

  - ID (TC-001, TC-002, etc.)

  - Title (expected behavior, not action)

  - Preconditions

  - Steps (numbered)

  - Expected result

  - Priority (High / Medium / Low)

- Group by: Positive flows, Negative flows, Edge cases

## Output

- Structured test plan in Markdown

- Use real field names and values, not placeholders

- At the end: list any ambiguities or gaps in the ACs -->
