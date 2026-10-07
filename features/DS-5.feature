Feature: Program list filtering and display
  DS-5 — As an admin user, I want to see all programs in a clear list so that I can quickly find and manage them.

  # Happy paths

  @TC-001 @AC-DisplayProgramListWithKeyDetails
  Scenario: Programs page shows name and description for each program
    Given I am logged in as admin
    And a program "Web Development 2026" exists with Description "Full-stack web development program"
    And a program "Informatique & IA - Niveau 2" exists with Description "Programme d'informatique et d'intelligence artificielle"
    When I navigate to the Programs page
    Then I see "Web Development 2026" with Description "Full-stack web development program"
    And I see "Informatique & IA - Niveau 2" with Description "Programme d'informatique et d'intelligence artificielle"

  @TC-002 @AC-EmptyStateWhenNoPrograms
  Scenario: Empty Programs page shows no-programs message and first-program prompt
    Given no programs exist
    When I navigate to the Programs page
    Then I see a message indicating no programs have been created
    And I see a prompt to create the first program
    And the program list has no program rows

  @TC-004
  Scenario: Programs page shows the list when one program exists
    Given the only program is "Web Development 2026" with Description "Full-stack web development program"
    When I navigate to the Programs page
    Then I see "Web Development 2026" and its description
    And I do not see the empty-state no-programs message

  # Negative

  @TC-003
  Scenario: A removed program is absent from the list
    Given "Web Development 2026" exists
    And "Test Program" does not exist
    When I navigate to the Programs page
    Then the list shows "Web Development 2026"
    And the list does not show "Test Program"

  # Edge cases

  @TC-005
  Scenario: Special-character program name is displayed exactly
    Given a program "Informatique & IA - Niveau 2" exists with Description "Programme d'informatique et d'intelligence artificielle"
    When I navigate to the Programs page
    Then the list shows Program Name exactly "Informatique & IA - Niveau 2"

  @TC-006
  Scenario: Program with empty Description still shows Program Name
    Given a program "Data Science 2026" exists with an empty Description
    When I navigate to the Programs page
    Then the list shows Program Name "Data Science 2026"
    And the row does not show a description line

  @TC-007
  Scenario: 255-character Program Name is displayed in full
    Given a program with a 255-character Program Name exists
    When I navigate to the Programs page
    Then the list shows the full 255-character Program Name

  @TC-008
  Scenario: 500-character Description is displayed in full
    Given a program exists with a 500-character Description
    When I navigate to the Programs page
    Then the list shows the full Description text

  @TC-009
  Scenario: Similar program names are both listed
    Given a program "Web Development 2026" exists
    And a program "Web Development 2026 - Updated" exists
    When I navigate to the Programs page
    Then the list shows both program names

  # Ambiguities and gaps
  # - Ticket title mentions "filtering"; DS-5 AC only covers display and empty state — no search/filter control observed on Programs page (MCP).
  # - Empty state (TC-002) may be untestable on shared tenant with thousands of programs.
  # - List uses one "Program" column: name and description share the cell (first and second paragraph).
