Feature: Delete program with confirmation
  DS-4 — As an admin user, I want to delete a program I no longer need, with a confirmation step to prevent accidental deletion.

  # Happy paths

  @TC-001 @AC-DeleteProgramWithConfirmation
  Scenario: Test Program is removed from the list after deletion is confirmed
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists with Description "Temporary program used for deletion"
    When I click Delete for "Test Program"
    Then I see a confirmation dialog
    When I confirm deletion
    Then "Test Program" is removed from the program list
    And the confirmation dialog closes

  @TC-002 @AC-CancelProgramDeletion
  Scenario: Test Program remains in the list after Cancel
    Given a program "Test Program" exists with Description "Temporary program used for deletion"
    And I am on the Programs page
    When I click Delete for "Test Program"
    And I see the confirmation dialog
    And I dismiss the confirmation without confirming
    Then "Test Program" still exists in the list
    And Description remains "Temporary program used for deletion"

  # Negative

  @TC-003
  Scenario: Test Program remains visible while confirmation dialog is open
    Given a program "Test Program" exists
    And I am on the Programs page
    When I click Delete for "Test Program"
    Then I see a confirmation dialog
    And "Test Program" still exists in the list

  @TC-004
  Scenario: Web Development 2026 remains after Test Program is deleted
    Given a program "Test Program" exists
    And a program "Web Development 2026" exists with Description "Full-stack web development program"
    And I am on the Programs page
    When I delete "Test Program" and confirm
    Then "Test Program" is removed from the program list
    And the list still shows "Web Development 2026"

  @TC-007
  Scenario: Long-name program remains after delete is cancelled
    Given a program with a 255-character name exists
    And I am on the Programs page
    When I click Delete for that program
    And I dismiss the confirmation
    Then that program still exists in the list

  # Edge cases

  @TC-005
  Scenario: Empty state appears after the only program is deleted
    Given "Test Program" is the only program in the system
    And I am on the Programs page
    When I delete "Test Program" and confirm
    Then "Test Program" is removed from the program list
    And I see a message indicating no programs have been created
    And I see a prompt to create the first program

  @TC-006
  Scenario: Informatique & IA - Niveau 2 is removed after confirmed deletion
    Given a program "Informatique & IA - Niveau 2" exists
    And I am on the Programs page
    When I delete "Informatique & IA - Niveau 2" and confirm
    Then "Informatique & IA - Niveau 2" is absent from the program list

  @TC-008
  Scenario: Confirming deletion once removes only the targeted program
    Given two distinct programs exist on the Programs page
    When I delete one program and confirm once
    Then only that program is removed
    And the other program remains in the list

  # Ambiguities and gaps
  # - Jira AC says "confirmation dialog" with Cancel; live UI uses native browser confirm() (no in-page Cancel).
  # - Confirm message: Delete program "{name}"? All its semesters and courses will be removed. This cannot be undone.
  # - Delete control: button aria-label "Delete {Program Name}".
  # - Empty state (TC-005) requires a tenant with no other programs; shared test env may skip this case.
