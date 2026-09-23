# Test Plan: DS-2 — Edit existing program details

## Positive flows

### TC-001: Edit form shows the current Program Name and Description

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Web Development 2026" and Description "Full-stack web development program".
  - The user is on the Programs page.

**Steps:**

1. Given I am on the Programs page
2. And a program "Web Development 2026" exists
3. When I click the edit icon on "Web Development 2026"

**Expected result:**

- Then I see the edit form pre-populated with Program Name "Web Development 2026" and Description "Full-stack web development program".

### TC-002: Program list shows "Web Development 2026 - Updated" immediately after Save

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - The edit form is open for Program Name "Web Development 2026" and Description "Full-stack web development program".

**Steps:**

1. Given I am editing "Web Development 2026"
2. When I change the Name to "Web Development 2026 - Updated"
3. And I click Save

**Expected result:**

- Then the modal closes.
- And the program list immediately shows "Web Development 2026 - Updated".
- And the program list does not show "Web Development 2026".

### TC-003: Program Name stays "Web Development 2026" when only Description changes

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - The edit form is open for Program Name "Web Development 2026" and Description "Full-stack web development program".

**Steps:**

1. Given I am editing a program
2. When I only change the Description to "Evening cohort for full-stack web development"
3. And I click Save

**Expected result:**

- Then the Name remains "Web Development 2026".
- And the Description is "Evening cohort for full-stack web development".
- And the other fields remain unchanged.

## Negative flows

### TC-004: Program details stay unchanged when the edit form is closed without Save

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The edit form is open for Program Name "Web Development 2026" and Description "Full-stack web development program".

**Steps:**

1. Given I am editing "Web Development 2026"
2. When I change the Name to "Web Development 2026 - Updated"
3. And I change the Description to "Evening cohort for full-stack web development"
4. And I close the form without clicking Save

**Expected result:**

- Then the program list shows "Web Development 2026".
- And the Description remains "Full-stack web development program".

### TC-005: An empty Program Name is not saved

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - The edit form is open for Program Name "Web Development 2026" and Description "Full-stack web development program".

**Steps:**

1. Given I am editing "Web Development 2026"
2. When I clear the Name field
3. And I attempt to click Save

**Expected result:**

- Then the program list still shows "Web Development 2026".
- And the Description remains "Full-stack web development program".

### TC-006: Program Name is not changed to a name that already exists

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Web Development 2026" and Description "Full-stack web development program".
  - A second program exists with Program Name "Data Science 2026" and Description "Applied data science program".
  - The edit form is open for "Data Science 2026".

**Steps:**

1. Given I am editing "Data Science 2026"
2. When I change the Name to "Web Development 2026"
3. And I click Save

**Expected result:**

- Then I see an error indicating the name already exists.
- And the program list still shows both "Data Science 2026" and "Web Development 2026".

## Edge cases

### TC-007: Description can be cleared while Program Name stays the same

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The edit form is open for Program Name "Web Development 2026" and Description "Full-stack web development program".

**Steps:**

1. Given I am editing a program
2. When I only change the Description to an empty value
3. And I click Save

**Expected result:**

- Then the Name remains "Web Development 2026".
- And the Description is empty.

### TC-008: Program list shows the special-character name entered on edit

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The edit form is open for Program Name "Web Development 2026" and Description "Full-stack web development program".
  - No program named "Informatique & IA - Niveau 2" exists.

**Steps:**

1. Given I am editing "Web Development 2026"
2. When I change the Name to "Informatique & IA - Niveau 2"
3. And I click Save

**Expected result:**

- Then the modal closes.
- And the program list immediately shows "Informatique & IA - Niveau 2".
- And the Description remains "Full-stack web development program".

### TC-009: Program list shows a one-character Program Name after edit

- **Priority:** Low
- **Preconditions:**
  - An admin user is logged in.
  - The edit form is open for Program Name "Web Development 2026" and Description "Full-stack web development program".
  - No program named "A" exists.

**Steps:**

1. Given I am editing "Web Development 2026"
2. When I change the Name to "A"
3. And I click Save

**Expected result:**

- Then the program list immediately shows "A".
- And the Description remains "Full-stack web development program".

### TC-010: Program list shows a 255-character Program Name after edit

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The edit form is open for Program Name "Web Development 2026" and Description "Full-stack web development program".
  - The new Program Name is the character "W" repeated 255 times.
  - No program with that name exists.

**Steps:**

1. Given I am editing "Web Development 2026"
2. When I change the Name to 255 "W" characters
3. And I click Save

**Expected result:**

- Then the modal closes.
- And the program list immediately shows the 255-character Program Name in full.
- And the Description remains "Full-stack web development program".

## Ambiguities and gaps

- The acceptance criteria say "the Name and other fields remain unchanged" but do not name those other fields. Known fields are Program Name and Description.
- Empty Program Name, duplicate Program Name, special characters, and maximum length are not specified for edit. TC-005 through TC-010 apply the create-flow rules to Save.
- The exact duplicate error text is not specified.
- It is not stated whether Description may be cleared. TC-007 assumes an empty Description is valid.
- The maximum length of Program Name and Description is not defined. TC-010 assumes a 255-character Program Name is valid and must be shown in full.
- "Immediately" does not say whether a page refresh is required. These cases expect the list to update without a manual refresh.
- The close control used in TC-004 is not named.
- It is not stated whether a non-admin user can open the edit form.
- It is not stated whether editing the same program in two sessions keeps the last Save only.
