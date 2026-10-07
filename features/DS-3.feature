Feature: Program name validation and duplicate prevention
  DS-3 — As an admin user, I want the system to prevent invalid or duplicate program names so that data integrity is maintained.

  # Happy paths

  @TC-001 @AC-AcceptSpecialCharacters
  Scenario: Program list shows Informatique & IA - Niveau 2 after create
    Given I am logged in as admin
    And I am on the New Program form
    And no program named "Informatique & IA - Niveau 2" exists
    When I fill Program Name with "Informatique & IA - Niveau 2"
    And I fill Description with "Programme d'informatique et d'intelligence artificielle"
    And I click Create
    Then the program is created successfully
    And the program list shows "Informatique & IA - Niveau 2"

  @TC-006
  Scenario: Single-character Program Name is accepted
    Given I am on the New Program form
    When I fill Program Name with "A"
    And I fill Description with "Single-character program name"
    And I click Create
    Then the program list shows "A"

  @TC-007
  Scenario: 255-character Program Name is accepted
    Given I am on the New Program form
    When I fill Program Name with a 255-character name
    And I fill Description with "Boundary length program name"
    And I click Create
    Then the program list shows the full 255-character Program Name

  # Negative

  @TC-002 @AC-RejectWhitespaceOnlyName
  Scenario: Whitespace-only Program Name is not submitted
    Given I am on the New Program form
    When I fill Program Name with "   "
    And I fill Description with "Whitespace name"
    And I attempt to click Create
    Then the form is not submitted
    And Program Name is trimmed and treated as empty
    And no new program appears in the list

  @TC-003 @AC-RejectDuplicateProgramName
  Scenario: Duplicate name Web Development 2026 shows an already-exists error
    Given a program "Web Development 2026" exists with Description "Full-stack web development program"
    And I am on the New Program form
    When I fill Program Name with "Web Development 2026"
    And I fill Description with "Another full-stack cohort"
    And I click Create
    Then I see an error indicating the name already exists
    And exactly one program named "Web Development 2026" remains in the list

  @TC-004
  Scenario: Trailing space on Program Name is treated as duplicate
    Given a program "Web Development 2026" already exists
    And I am on the New Program form
    When I fill Program Name with "Web Development 2026 "
    And I fill Description with "Padded duplicate name"
    And I click Create
    Then Program Name is trimmed
    And I see an error indicating the name already exists

  @TC-005
  Scenario: Case-variant duplicate web development 2026 is rejected
    Given a program "Web Development 2026" already exists
    And I am on the New Program form
    When I fill Program Name with "web development 2026"
    And I fill Description with "Case variant duplicate"
    And I click Create
    Then I see an error indicating the name already exists

  @TC-009
  Scenario: 256-character Program Name is not saved
    Given I am on the New Program form
    When I fill Program Name with 256 characters
    And I fill Description with "Over max length"
    And I attempt to click Create
    Then the program is not saved with 256 characters in the list

  # Edge cases

  @TC-008
  Scenario: Program Name with quotes and brackets is stored as text
    Given I am on the New Program form
    When I fill Program Name with "Program \"Alpha\" [2026]"
    And I fill Description with "Quoted and bracketed name"
    And I click Create
    Then the program list shows Program Name exactly "Program \"Alpha\" [2026]"

  # Ambiguities and gaps
  # - Duplicate and case-insensitive rules may not be enforced on shared test.didaxis.studio (DS-12, DS-13, DS-32).
  # - Max length for Description on create is not in DS-3 AC.
  # - Whitespace trim behavior vs disabled Create button should match DS-1 empty-name rule.
