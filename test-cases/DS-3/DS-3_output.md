# Test Plan: DS-3 — Program name validation and duplicate prevention

## Positive flows

### TC-001: Program list shows "Informatique & IA - Niveau 2"

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - No program named "Informatique & IA - Niveau 2" exists.

**Steps:**

1. Given I am on the program creation form
2. When I enter "Informatique & IA - Niveau 2" as the program name
3. And I fill in Description with "Programme d'informatique et d'intelligence artificielle"
4. And I click Create

**Expected result:**

- Then the program is created successfully.
- And the program list shows "Informatique & IA - Niveau 2".

## Negative flows

### TC-002: A whitespace-only Program Name is not submitted

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - The current program count is known.

**Steps:**

1. Given I am on the program creation form
2. When I enter "   " as the program name
3. And I fill in Description with "Whitespace name"
4. And I click Create

**Expected result:**

- Then the form is not submitted.
- And the Program Name is trimmed and treated as empty.
- And no new program appears in the program list.

### TC-003: Duplicate name "Web Development 2026" shows an already-exists error

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Web Development 2026" and Description "Full-stack web development program".
  - The program creation form is open.

**Steps:**

1. Given a program "Web Development 2026" already exists
2. When I enter "Web Development 2026" as the program name
3. And I fill in Description with "Another full-stack cohort"
4. And I click Create

**Expected result:**

- Then I see an error indicating the name already exists.
- And the program list still contains one program named "Web Development 2026".
- And the existing Description remains "Full-stack web development program".

### TC-004: Program Name "Web Development 2026 " is treated as the existing name

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Web Development 2026" and Description "Full-stack web development program".
  - The program creation form is open.

**Steps:**

1. Given a program "Web Development 2026" already exists
2. When I enter "Web Development 2026 " as the program name
3. And I fill in Description with "Padded duplicate name"
4. And I click Create

**Expected result:**

- Then the Program Name is trimmed.
- And I see an error indicating the name already exists.
- And no second program is added to the program list.

### TC-005: Program Name "web development 2026" is rejected as a duplicate

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Web Development 2026" and Description "Full-stack web development program".
  - The program creation form is open.

**Steps:**

1. Given a program "Web Development 2026" already exists
2. When I enter "web development 2026" as the program name
3. And I fill in Description with "Case-variant duplicate"
4. And I click Create

**Expected result:**

- Then I see an error indicating the name already exists.
- And the program list still contains one program named "Web Development 2026".

## Edge cases

### TC-006: Program list shows a one-character Program Name

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - No program named "A" exists.

**Steps:**

1. Given I am on the program creation form
2. When I enter "A" as the program name
3. And I fill in Description with "Single-character program name"
4. And I click Create

**Expected result:**

- Then the program is created successfully.
- And the program list shows "A".

### TC-007: Program list shows a 255-character Program Name

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - Program Name will be the character "W" repeated 255 times.
  - No program with that name exists.

**Steps:**

1. Given I am on the program creation form
2. When I enter 255 "W" characters as the program name
3. And I fill in Description with "Boundary length program name"
4. And I click Create

**Expected result:**

- Then the program is created successfully.
- And the program list shows the 255-character Program Name in full.

### TC-008: Program Name "Web \"Dev\" <2026>" is stored and shown as text

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - No program named "Web \"Dev\" <2026>" exists.

**Steps:**

1. Given I am on the program creation form
2. When I enter "Web \"Dev\" <2026>" as the program name
3. And I fill in Description with "Name with quotes and brackets"
4. And I click Create

**Expected result:**

- Then the program is created successfully.
- And the program list shows the text Web "Dev" <2026>.
- And the name is displayed as text.

### TC-009: A 256-character Program Name is not saved

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - Program Name will be the character "W" repeated 256 times.
  - The current program count is known.

**Steps:**

1. Given I am on the program creation form
2. When I enter 256 "W" characters as the program name
3. And I fill in Description with "Over max length program name"
4. And I click Create

**Expected result:**

- Then the form is not submitted.
- And I see a validation error on Program Name.
- And no new program appears in the program list.

## Ambiguities and gaps

- The create story disables Create when Program Name is empty. This story says the user clicks Create for a whitespace name. TC-002 follows this story: the form is not submitted and the trimmed name is treated as empty. If Create is disabled, the click cannot happen, and that still meets "the form is not submitted".
- "Other required fields" are not listed. These cases fill Description, because that is the other field on the creation form. It is not stated whether Description is required.
- The exact error text for a duplicate name is not specified. These cases expect a visible error indicating the name already exists.
- Trimming is specified for a whitespace-only name. It is not specified for a real name with leading or trailing spaces. TC-004 assumes the padded name is trimmed and then compared.
- Case-insensitive duplicate checks are not specified. TC-005 assumes "web development 2026" matches "Web Development 2026".
- The maximum length is not defined. TC-007 and TC-009 assume the limit is 255 characters.
- It is not stated whether duplicate checks also run when an existing program is renamed.
- It is not stated whether names are unique per admin or unique across the whole system.
