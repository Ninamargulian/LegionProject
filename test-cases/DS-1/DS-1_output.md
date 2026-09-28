# Test Plan: DS-1 — Create new academic program

## Positive flows

### TC-001: Program creation form shows Program Name and Description

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - The Programs page is available.

**Steps:**

1. Given I am logged in as admin
2. When I navigate to the Programs page
3. And I click "+ New Program"

**Expected result:**

- Then I see the program creation form with the fields Program Name and Description.

### TC-002: Program list shows "Web Development 2026" after creation

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - No program named "Web Development 2026" exists.

**Steps:**

1. Given I am on the program creation form
2. When I fill in Program Name with "Web Development 2026"
3. And I fill in Description with "Full-stack web development program"
4. And I click Create

**Expected result:**

- Then the modal closes.
- And the program list shows "Web Development 2026".

## Negative flows

### TC-003: Create stays disabled while Program Name is empty

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - Program Name is empty.
  - Description is empty.

**Steps:**

1. Given I am on the program creation form
2. When I leave the Program Name field empty

**Expected result:**

- Then the Create button is disabled.
- And no program is added to the program list.

### TC-004: Program list stays unchanged when the creation form is closed without Create

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - Program Name is "Web Development 2026".
  - Description is "Full-stack web development program".
  - The program list does not contain "Web Development 2026".

**Steps:**

1. Given I am on the program creation form
2. When I fill in Program Name with "Web Development 2026"
3. And I fill in Description with "Full-stack web development program"
4. And I close the form without clicking Create

**Expected result:**

- Then the program list does not show "Web Development 2026".

### TC-005: Create stays disabled when Description is filled and Program Name is empty

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.

**Steps:**

1. Given I am on the program creation form
2. When I leave the Program Name field empty
3. And I fill in Description with "Full-stack web development program"

**Expected result:**

- Then the Create button is disabled.
- And no program is added to the program list.

## Edge cases

### TC-006: Program list shows a one-character Program Name

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - No program named "A" exists.

**Steps:**

1. Given I am on the program creation form
2. When I fill in Program Name with "A"
3. And I fill in Description with "Single-character program name"
4. And I click Create

**Expected result:**

- Then the modal closes.
- And the program list shows "A".

### TC-007: Program list shows a 255-character Program Name in full

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - Program Name will be the character "W" repeated 255 times.
  - No program with that name exists.

**Steps:**

1. Given I am on the program creation form
2. When I fill in Program Name with 255 "W" characters
3. And I fill in Description with "Boundary length program name"
4. And I click Create

**Expected result:**

- Then the modal closes.
- And the program list shows the 255-character Program Name in full.

### TC-008: Program list shows "Informatique & IA - Niveau 2" exactly

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - No program named "Informatique & IA - Niveau 2" exists.

**Steps:**

1. Given I am on the program creation form
2. When I fill in Program Name with "Informatique & IA - Niveau 2"
3. And I fill in Description with "Programme d'informatique et d'intelligence artificielle"
4. And I click Create

**Expected result:**

- Then the modal closes.
- And the program list shows "Informatique & IA - Niveau 2".

### TC-009: A duplicate Program Name is not added to the list

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - A program already exists with Program Name "Web Development 2026" and Description "Full-stack web development program".
  - The program creation form is open.

**Steps:**

1. Given a program "Web Development 2026" already exists
2. When I fill in Program Name with "Web Development 2026"
3. And I fill in Description with "Another full-stack cohort"
4. And I click Create

**Expected result:**

- Then the program list still contains one program named "Web Development 2026".
- And I see an error indicating the name already exists.

### TC-010: Program list shows "Data Science 2026" when Description is left empty

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - No program named "Data Science 2026" exists.

**Steps:**

1. Given I am on the program creation form
2. When I fill in Program Name with "Data Science 2026"
3. And I leave Description empty
4. And I click Create

**Expected result:**

- Then the modal closes.
- And the program list shows "Data Science 2026".

### TC-011: A whitespace-only Program Name does not create a program

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - The program creation form is open.
  - The current program count is known.

**Steps:**

1. Given I am on the program creation form
2. When I fill in Program Name with "   "
3. And I fill in Description with "Whitespace name"
4. And I attempt to click Create

**Expected result:**

- Then no new program is added to the program list.
- And the whitespace Program Name is treated as empty.

## Ambiguities and gaps

- The maximum length of Program Name and Description is not defined. TC-007 assumes a 255-character Program Name is valid and must be shown in full.
- Description is shown on the form, and only an empty Program Name is called out as invalid. TC-010 assumes Description is optional.
- Duplicate names are not in these acceptance criteria. TC-009 expects the error defined on the duplicate-name story, and the exact error text is not specified.
- These acceptance criteria say an empty Program Name disables Create. The whitespace story says the user clicks Create and the form is not submitted. TC-011 accepts either a disabled Create button or a rejected submit, as long as no program is created.
- The success scenario calls the form a modal. The navigation scenario calls it a form. It is not stated whether "+ New Program" opens a modal or a page.
- The close control used in TC-004 is not named in the acceptance criteria.
- It is not stated whether a non-admin user can open the program creation form.
- It is not stated whether the program list shows Description after create. The success check only requires the name "Web Development 2026".
