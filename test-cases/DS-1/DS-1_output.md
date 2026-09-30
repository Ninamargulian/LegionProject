# Test Plan: Test Case 1 (DS-1) — Create new academic program

## Positive flows

### TC-001: Program creation form shows Program Name and Description

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - The Programs page is available.

**Steps:**

```gherkin
Scenario: Admin opens the program creation form
  Given I am logged in as admin
  When I navigate to the Programs page
  And I click "+ New Program"
  Then I see the program creation form with fields Program Name and Description
```

**Expected result:**

- The program creation form is visible with **Program Name** and **Description** fields.

### TC-002: Program list shows "Web Development 2026" after successful create

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - No program named "Web Development 2026" exists.

**Steps:**

```gherkin
Scenario: Admin creates a new program
  Given I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"
```

**Expected result:**

- The creation modal closes.
- **Web Development 2026** appears on the program list.

### TC-003: Create stays disabled while Program Name is empty

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - Program Name is empty.

**Steps:**

```gherkin
Scenario: Empty program name blocks create
  Given I am on the program creation form
  When I leave the Program Name field empty
  Then the Create button is disabled
```

**Expected result:**

- **Create** is disabled.
- No program is added to the list.

## Negative flows

### TC-004: Program list stays unchanged when the form is closed without Create

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - The program list does not contain "Web Development 2026".

**Steps:**

```gherkin
Scenario: Closing the form without save does not create a program
  Given I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I close the form without clicking Create
  Then the program list does not show "Web Development 2026"
```

**Expected result:**

- **Web Development 2026** is not on the program list.

### TC-005: Create stays disabled when only Description is filled

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.

**Steps:**

```gherkin
Scenario: Description alone does not enable create
  Given I am on the program creation form
  When I leave the Program Name field empty
  And I fill in Description with "Full-stack web development program"
  Then the Create button is disabled
  And no program is added to the program list
```

**Expected result:**

- **Create** remains disabled.
- The program list is unchanged.

### TC-006: Duplicate Program Name is not added on create

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - A program "Web Development 2026" already exists.
  - The program creation form is open.

**Steps:**

```gherkin
Scenario: Duplicate program name is rejected
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Another full-stack cohort"
  And I click Create
  Then I see an error indicating the name already exists
  And the program list still contains only one "Web Development 2026"
```

**Expected result:**

- Duplicate create fails with a visible error.
- Only one **Web Development 2026** entry remains.

## Edge cases

### TC-007: Program list shows a one-character Program Name

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - No program named "A" exists.

**Steps:**

```gherkin
Scenario: Minimum-length program name is accepted
  Given I am on the program creation form
  When I fill in Program Name with "A"
  And I fill in Description with "Single-character program name"
  And I click Create
  Then the modal closes
  And the program list shows "A"
```

**Expected result:**

- **A** appears on the program list.

### TC-008: Program list shows a 255-character Program Name in full

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - Program Name is the character "W" repeated 255 times.
  - No program with that name exists.

**Steps:**

```gherkin
Scenario: Long program name at assumed max length is accepted
  Given I am on the program creation form
  When I fill in Program Name with a 255-character name of repeated "W"
  And I fill in Description with "Boundary length program name"
  And I click Create
  Then the modal closes
  And the program list shows the full 255-character Program Name
```

**Expected result:**

- The full 255-character name is stored and displayed.

### TC-009: Program list shows "Informatique & IA - Niveau 2" exactly

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - No program named "Informatique & IA - Niveau 2" exists.

**Steps:**

```gherkin
Scenario: Special characters in program name are accepted
  Given I am on the program creation form
  When I fill in Program Name with "Informatique & IA - Niveau 2"
  And I fill in Description with "Programme d'informatique et d'intelligence artificielle"
  And I click Create
  Then the modal closes
  And the program list shows "Informatique & IA - Niveau 2"
```

**Expected result:**

- The name is shown exactly as entered, including `&` and accents in Description.

### TC-010: Program list shows "Data Science 2026" when Description is empty

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - No program named "Data Science 2026" exists.

**Steps:**

```gherkin
Scenario: Program created with empty Description
  Given I am on the program creation form
  When I fill in Program Name with "Data Science 2026"
  And I leave Description empty
  And I click Create
  Then the modal closes
  And the program list shows "Data Science 2026"
```

**Expected result:**

- **Data Science 2026** is created with an empty Description.

### TC-011: Whitespace-only Program Name does not create a program

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - The current program count is known.

**Steps:**

```gherkin
Scenario: Whitespace-only program name is rejected
  Given I am on the program creation form
  When I fill in Program Name with "   "
  And I fill in Description with "Whitespace name"
  And I attempt to create the program
  Then no new program is added to the program list
  And the Program Name is treated as empty
```

**Expected result:**

- No new row on the program list (Create disabled or submit rejected).

## Ambiguities and gaps

- Maximum length for **Program Name** and **Description** is not specified. TC-008 assumes 255 characters is valid.
- **Description** is required on the form but not validated in ACs; TC-010 assumes it is optional.
- Duplicate-name behavior is not in DS-1 ACs; TC-006 follows the separate duplicate-prevention story.
- Whitespace-only names: DS-3 defines trim-on-submit; DS-1 only disables Create for empty name. TC-011 allows either disabled Create or rejected submit.
- Success AC calls the UI a **modal**; navigation AC says **form** — container type is unclear.
- The control to close without save (TC-004) is not named in the ACs.
- Non-admin access to **+ New Program** is not specified.
- After create, the AC only checks the list for the name, not **Description** visibility in the list.
