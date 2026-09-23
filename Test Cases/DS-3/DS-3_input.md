# Prompt Template "Test Plan" from a Jira Ticket

## Role

You are a senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the [Program name validation and duplicate prevention] feature.

## Acceptance Criteria

Scenario: Reject program name with only whitespace
Given I am on the program creation form
When I enter "   " as the program name
And I click Create
Then the form is not submitted (name is trimmed, treated as empty)

Scenario: Accept program name with special characters
Given I am on the program creation form
When I enter "Informatique & IA - Niveau 2" as the program name
And I fill other required fields
And I click Create
Then the program is created successfully

Scenario: Reject duplicate program name
Given a program "Web Development 2026" already exists
When I try to create a new program with the same name
Then I see an error indicating the name already exists

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
