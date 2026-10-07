Feature: Edit existing program details
  DS-2 — As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.

  # Happy paths

  @TC-001 @AC-OpenProgramForEditing
  Scenario: Edit form shows current Program Name and Description
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Web Development 2026" exists with Description "Full-stack web development program"
    When I click the Edit control "Edit Web Development 2026"
    Then the Edit Program modal opens
    And Program Name is "Web Development 2026"
    And Description is "Full-stack web development program"

  @TC-002 @AC-SuccessfullyEditProgramName
  Scenario: Program list shows Web Development 2026 - Updated immediately after Save
    Given I am editing "Web Development 2026" on the Edit Program modal
    When I change Program Name to "Web Development 2026 - Updated"
    And I click Save
    Then the Edit Program modal closes
    And the program list shows "Web Development 2026 - Updated"
    And the program list does not show "Web Development 2026" as the active name for that program

  @TC-003 @AC-EditPreservesUnchangedFields
  Scenario: Program Name stays unchanged when only Description changes
    Given I am editing "Web Development 2026" on the Edit Program modal
    When I change Description to "Evening cohort for full-stack web development"
    And I click Save
    Then the Edit Program modal closes
    And Program Name remains "Web Development 2026"
    And Description is "Evening cohort for full-stack web development"

  @TC-007
  Scenario: Description can be cleared while Program Name stays the same
    Given I am editing "Web Development 2026" on the Edit Program modal
    When I clear Description only
    And I click Save
    Then Program Name remains "Web Development 2026"
    And the list row shows the name only without a description line

  # Negative

  @TC-004
  Scenario: Program details stay unchanged when edit is cancelled
    Given I am editing "Web Development 2026" on the Edit Program modal
    When I change Program Name to "Web Development 2026 - Updated"
    And I change Description to "Evening cohort for full-stack web development"
    And I click Cancel on the Edit Program modal
    Then the modal closes
    And the program list shows Program Name "Web Development 2026"
    And Description remains "Full-stack web development program"

  @TC-005
  Scenario: An empty Program Name is not saved
    Given I am editing "Web Development 2026" on the Edit Program modal
    When I clear Program Name
    And I attempt to click Save
    Then Save is disabled or changes are not persisted
    And the program list still shows Program Name "Web Development 2026"

  @TC-006
  Scenario: Program Name is not changed to a name that already exists
    Given a program "Web Development 2026" exists
    And a program "Data Science 2026" exists
    And I am editing "Data Science 2026" on the Edit Program modal
    When I change Program Name to "Web Development 2026"
    And I click Save
    Then I see an error that the name already exists
    And the list still shows both "Data Science 2026" and "Web Development 2026"

  @TC-011
  Scenario: Case-only duplicate name on edit is rejected
    Given a program "Web Development 2026" exists
    And I am editing a different program on the Edit Program modal
    When I change Program Name to "web development 2026"
    And I click Save
    Then save is rejected with a duplicate-name indication
    And the edited program keeps its original name

  # Edge cases

  @TC-008
  Scenario: Program list shows special-character name entered on edit
    Given I am editing "Web Development 2026" on the Edit Program modal
    When I change Program Name to "Informatique & IA - Niveau 2"
    And I click Save
    Then the Edit Program modal closes
    And the list shows Program Name exactly "Informatique & IA - Niveau 2"

  @TC-009
  Scenario: Program list shows a one-character Program Name after edit
    Given I am editing "Web Development 2026" on the Edit Program modal
    When I change Program Name to "A"
    And I click Save
    Then the list shows Program Name "A"

  @TC-010
  Scenario: Program list shows a 255-character Program Name after edit
    Given I am editing "Web Development 2026" on the Edit Program modal
    When I change Program Name to 255 "W" characters
    And I click Save
    Then the Edit Program modal closes
    And the list shows the full 255-character Program Name

  @TC-012
  Scenario: List reflects the new name without manual refresh
    Given I am on the Programs page
    And I am editing a program on the Edit Program modal
    When I rename the program and click Save
    Then the new Program Name appears in the edited row without reloading the page
    And the previous name is not shown for that program

  @TC-013
  Scenario: Double-click Save does not submit duplicate updates
    Given I am on the Edit Program modal with valid changes
    When I double-click Save quickly
    Then only one successful update occurs
    And the modal closes once

  @TC-014
  Scenario: Edit remains usable when the program list is large
    Given I am on the Programs page with many programs
    When I scroll to a program and open Edit Program
    Then + New Program and Edit {Program Name} remain reachable

  # Ambiguities and gaps
  # - Jira AC says "edit icon"; UI uses button aria-label "Edit {Program Name}".
  # - Duplicate rename on edit may not be enforced on test.didaxis.studio (DS-131, DS-129).
  # - Stale list after rename possible (DS-9, DS-108). Double Save may emit duplicate PATCH (DS-130).
  # - Description max length on edit not specified in DS-2 AC.
