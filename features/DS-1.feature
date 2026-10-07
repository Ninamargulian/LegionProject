Feature: Create new academic program
  DS-1 — As an admin user, I want to create a new academic program so that I can begin designing its curriculum structure.

  # Happy paths

  @TC-001 @AC-NavigateToCreationForm
  Scenario: Program creation form shows Program Name and Description
    Given I am logged in as admin
    And I am on the Programs page
    When I click "+ New Program"
    Then I see the New Program form with fields Program Name and Description
    And I see the Create and Cancel buttons

  @TC-002 @AC-SuccessfullyCreateProgram
  Scenario: Program list shows Web Development 2026 after successful create
    Given I am on the New Program form
    And no program named "Web Development 2026" exists
    When I fill Program Name with "Web Development 2026"
    And I fill Description with "Full-stack web development program"
    And I click Create
    Then the New Program modal closes
    And the program list shows "Web Development 2026"
    And the list row shows Description "Full-stack web development program"

  @TC-003 @AC-ValidationPreventsEmptyProgramName
  Scenario: Create stays disabled while Program Name is empty
    Given I am on the New Program form
    When I leave Program Name empty
    Then the Create button is disabled
    And no program is added to the list

  @TC-010
  Scenario: Program list shows a program when Description is empty
    Given I am on the New Program form
    When I fill Program Name with "Data Science 2026"
    And I leave Description empty
    And I click Create
    Then the New Program modal closes
    And the program list shows "Data Science 2026"
    And the program row shows the name only without a description line

  # Negative

  @TC-004
  Scenario: Program list stays unchanged when the form is closed without Create
    Given I am on the New Program form
    When I fill Program Name with "Web Development 2026"
    And I fill Description with "Full-stack web development program"
    And I click Cancel
    Then the New Program modal closes
    And the program list does not show a new "Web Development 2026" from this attempt

  @TC-005
  Scenario: Create stays disabled when only Description is filled
    Given I am on the New Program form
    When I leave Program Name empty
    And I fill Description with "Full-stack web development program"
    Then the Create button is disabled

  @TC-006
  Scenario: Duplicate Program Name is not added on create
    Given a program "Web Development 2026" already exists with Description "Full-stack web development program"
    And I am on the New Program form
    When I fill Program Name with "Web Development 2026"
    And I fill Description with "Another full-stack cohort"
    And I click Create
    Then I see an error that the program name already exists
    And exactly one program named "Web Development 2026" remains in the list

  @TC-011
  Scenario: Whitespace-only Program Name does not create a program
    Given I am on the New Program form
    When I fill Program Name with "   "
    And I fill Description with "Whitespace name"
    And I attempt to click Create
    Then the program is not created
    And the New Program form stays open or Create remains disabled

  # Edge cases

  @TC-007
  Scenario: Program list shows a one-character Program Name
    Given I am on the New Program form
    When I fill Program Name with "A"
    And I fill Description with "Single-character program name"
    And I click Create
    Then the New Program modal closes
    And the program list shows "A"

  @TC-008
  Scenario: Program list shows a 255-character Program Name in full
    Given I am on the New Program form
    When I fill Program Name with a 255-character name consisting of "W" characters
    And I fill Description with "Boundary length program name"
    And I click Create
    Then the New Program modal closes
    And the program list shows the full 255-character Program Name

  @TC-009
  Scenario: Program list shows special-character program name exactly
    Given I am on the New Program form
    When I fill Program Name with "Informatique & IA - Niveau 2"
    And I fill Description with "Programme d'informatique et d'intelligence artificielle"
    And I click Create
    Then the New Program modal closes
    And the program list shows "Informatique & IA - Niveau 2" exactly

  # Ambiguities and gaps
  # - Jira AC says "program creation form"; live UI uses modal title "New Program" (test.didaxis.studio).
  # - Jira AC does not state whether Description is optional; TC-010 assumes empty Description is allowed.
  # - Duplicate-name rejection (TC-006) is product intent; shared test tenant may allow duplicates (DS-12, DS-13, DS-32).
  # - Max length for Program Name and Description is not in DS-1 AC; TC-008 assumes 255-character name is valid.
  # - Whitespace-only name handling (trim then empty) is not specified in Jira; confirm with product owner.
  # - Non-admin roles and permission to open "+ New Program" are not covered in DS-1.
