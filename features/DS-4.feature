Feature: Delete program with confirmation
  DS-4 — As an admin user, I want to delete a program I no longer need, with a confirmation step to prevent accidental deletion.

  # Happy paths

  @TC-001 @AC-DeleteProgramWithConfirmation
  Scenario: Confirming deletion removes Test Program from the list
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists with Description "Temporary program used for deletion checks"
    When I click the delete icon "Delete Test Program"
    Then I see one browser confirmation dialog
    And the dialog message is Delete program "Test Program"? All its semesters and courses will be removed. This cannot be undone.
    When I confirm deletion
    Then the confirmation dialog closes
    And the program list does not show "Test Program"
    And the row for "Test Program" has no Description "Temporary program used for deletion checks"

  @TC-002 @AC-CancelProgramDeletion
  Scenario: Cancelling the confirmation keeps Test Program in the list
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists with Description "Temporary program used for deletion checks"
    When I click the delete icon "Delete Test Program"
    Then I see the browser confirmation dialog
    When I click Cancel
    Then the confirmation dialog closes
    And the program list still shows "Test Program"
    And the row still shows Description "Temporary program used for deletion checks"

  # Negative

  @TC-003
  Scenario: Deleting Test Program does not remove Cloud Engineering 2026
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists with Description "Temporary program used for deletion checks"
    And a program "Cloud Engineering 2026" exists with Description "Should stay"
    When I click the delete icon "Delete Test Program"
    Then the confirmation dialog quotes "Test Program"
    And the confirmation dialog does not quote "Cloud Engineering 2026"
    When I confirm deletion
    Then the program list does not show "Test Program"
    And the program list still shows "Cloud Engineering 2026"
    And the row for "Cloud Engineering 2026" still shows Description "Should stay"

  @TC-004
  Scenario: Cancelling deletion of Test Program leaves Cloud Engineering 2026 unchanged
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists with Description "Temporary program used for deletion checks"
    And a program "Cloud Engineering 2026" exists with Description "Should stay"
    When I click the delete icon "Delete Test Program"
    And I click Cancel
    Then the program list still shows "Test Program"
    And the program list still shows "Cloud Engineering 2026"

  # Edge cases

  @TC-005
  Scenario: Special-character program name is quoted in the confirmation and removed on confirm
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Informatique & IA - Niveau 2" exists with Description "Programme d'informatique et d'intelligence artificielle"
    When I click the delete icon "Delete Informatique & IA - Niveau 2"
    Then the dialog message is Delete program "Informatique & IA - Niveau 2"? All its semesters and courses will be removed. This cannot be undone.
    When I confirm deletion
    Then the program list does not show "Informatique & IA - Niveau 2"

  @TC-006
  Scenario: Deleted Test Program stays absent after the Programs page is reloaded
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists with Description "Temporary program used for deletion checks"
    And a program "Cloud Engineering 2026" exists with Description "Should stay"
    When I click the delete icon "Delete Test Program"
    And I confirm deletion
    And I reload the Programs page
    Then the program list does not show "Test Program"
    And the program list still shows "Cloud Engineering 2026"
    And the row for "Cloud Engineering 2026" still shows Description "Should stay"

  @TC-007
  Scenario: Double-clicking the delete icon opens one confirmation and does not delete on Cancel
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists with Description "Temporary program used for deletion checks"
    When I double-click the delete icon "Delete Test Program"
    Then I see one confirmation dialog
    And I do not see a second confirmation dialog
    When I click Cancel
    Then the program list still shows "Test Program"

  # Ambiguities and gaps
  # - Live UI on test.didaxis.studio (2026-11-01 crawl): the delete control is a button whose accessible name is "Delete {program name}". The visible control is a Tabler trash SVG (tabler-icon-trash), not a text label and not an emoji. Jira says "delete icon"; the aria-label is the stable locator.
  # - Confirmation is a native browser confirm(), not an in-app dialog. There is no in-page button named Cancel for delete. "I click Cancel" means dismissing that confirm (the browser Cancel button). Confirming means accepting it (the browser OK button). Related open bug DS-172.
  # - Observed confirm message, exact: Delete program "{name}"? All its semesters and courses will be removed. This cannot be undone.
  # - Accepting the confirm sends DELETE /api/programs/{uuid} and the row disappears without a manual refresh. A later reload still omits that program. A sibling row stays.
  # - Dismissing the confirm leaves the row and its description in place.
  # - Shared tenant already has hundreds of programs (912 delete icons observed). "Test Program" is not unique. Automation must create its own rows with a unique suffix and must not delete programs it did not create. An empty list after deleting the final program is not safely verifiable here.
  # - A new row can be missing from the accessibility tree for a short time after Create or after reload. Wait until the row's Edit or Delete button is present before acting.
  # - Accessible names are prefixes of each other when one program name starts with another. Match "Delete {name}" and "Edit {name}" exactly.
  # - Double-click of the delete icon opened two identical confirm dialogs; the second appeared after the first was dismissed (probed on "Test Program 1793587152680"). Expected behavior in TC-007 is a single dialog. Already tracked by DS-30, DS-109, DS-156, and DS-218. Do not treat a second dialog as correct.
  # - The ticket does not say what the user sees if DELETE fails. Related bugs DS-116 and DS-155 report no visible error. Not covered by a scenario.
  # - The dialog says semesters and courses are removed. This crawl did not create semesters or courses, so that claim is untested.
  # - Non-admin permission to delete is not in the DS-4 acceptance criteria.
