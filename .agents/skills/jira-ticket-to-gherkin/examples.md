# Example: DS-1 → Gherkin

Illustrates output shape after reading Jira **DS-1** (Create new academic program). Values match the ticket, not placeholders.

```gherkin
Feature: Create new academic program
  DS-1 — Admin creates academic programs with name and description on the Programs page

  # Happy paths

  @TC-001 @AC-OpenCreationForm
  Scenario: Program creation form shows Program Name and Description
    Given I am logged in as admin
    And I am on the Programs page
    When I click "+ New Program"
    Then I see the New Program form with fields Program Name and Description

  @TC-002 @AC-SuccessfulCreate
  Scenario: Program list shows Web Development 2026 after Create
    Given I am on the New Program form
    And no program named "Web Development 2026" exists
    When I fill Program Name with "Web Development 2026"
    And I fill Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"

  @TC-003 @AC-EmptyNameBlocksCreate
  Scenario: Create stays disabled while Program Name is empty
    Given I am on the New Program form
    When I leave Program Name empty
    Then the Create button is disabled

  # Negative

  @TC-004
  Scenario: Unsaved changes are discarded when the form is closed without Create
    Given I am on the New Program form
    When I fill Program Name with "Web Development 2026"
    And I fill Description with "Full-stack web development program"
    And I click Cancel
    Then the modal closes
    And the program list does not show "Web Development 2026"

  @TC-005
  Scenario: An empty Program Name is not submitted when Create is forced
    Given I am on the New Program form
    When I clear Program Name
    And I attempt to create the program
    Then no new program row appears for an empty name

  # Edge cases

  @TC-006
  Scenario: Program list shows a special-character program name
    Given I am on the New Program form
    When I fill Program Name with "Informatique & IA - Niveau 2"
    And I fill Description with "Programme d'informatique et d'intelligence artificielle"
    And I click Create
    Then the program list shows "Informatique & IA - Niveau 2"

  @TC-007
  Scenario: Duplicate program name is rejected on create
    Given a program "Web Development 2026" already exists
    And I am on the New Program form
    When I fill Program Name with "Web Development 2026"
    And I click Create
    Then I see an error that the name already exists
    And only one program named "Web Development 2026" remains in the list

  # Ambiguities and gaps
  # - Ticket says "icon" for some actions; live UI may use aria-label buttons (verify on test.didaxis.studio).
  # - Max length for Program Name and Description not stated in DS-1 AC.
  # - Duplicate-name behavior may differ on shared test tenants; confirm with product owner.
```

After QA approves this file, Playwright specs can trace back to `@TC-NNN` tags.
