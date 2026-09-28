# Test Plan: DS-4 — Delete program with confirmation

## Positive flows

### TC-001: "Test Program" is absent from the program list after deletion is confirmed

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Test Program" and Description "Temporary program used for deletion".
  - The user is on the Programs page.

**Steps:**

1. Given a program "Test Program" exists
2. When I click the delete icon for "Test Program"
3. Then I see a confirmation dialog
4. When I confirm deletion

**Expected result:**

- Then "Test Program" is removed from the program list.
- And the confirmation dialog closes.

### TC-002: "Test Program" remains in the program list after Cancel

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Test Program" and Description "Temporary program used for deletion".
  - The user is on the Programs page.

**Steps:**

1. Given I click the delete icon for "Test Program"
2. When I see the confirmation dialog
3. And I click Cancel

**Expected result:**

- Then the confirmation dialog closes.
- And "Test Program" still exists in the list.
- And the Description remains "Temporary program used for deletion".

## Negative flows

### TC-003: "Test Program" remains visible while the confirmation dialog is open

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Test Program" and Description "Temporary program used for deletion".
  - The user is on the Programs page.

**Steps:**

1. Given a program "Test Program" exists
2. When I click the delete icon for "Test Program"

**Expected result:**

- Then I see a confirmation dialog.
- And "Test Program" still exists in the list.

### TC-004: "Web Development 2026" remains after "Test Program" is deleted

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Test Program" and Description "Temporary program used for deletion".
  - A program exists with Program Name "Web Development 2026" and Description "Full-stack web development program".
  - The user is on the Programs page.

**Steps:**

1. Given a program "Test Program" exists
2. And a program "Web Development 2026" exists
3. When I click the delete icon for "Test Program"
4. And I confirm deletion

**Expected result:**

- Then "Test Program" is removed from the program list.
- And the program list shows "Web Development 2026".
- And the Description of "Web Development 2026" remains "Full-stack web development program".

### TC-005: The empty state appears after the only program is deleted

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The only program is Program Name "Test Program" and Description "Temporary program used for deletion".
  - The user is on the Programs page.

**Steps:**

1. Given a program "Test Program" exists
2. And no other programs exist
3. When I click the delete icon for "Test Program"
4. And I confirm deletion

**Expected result:**

- Then "Test Program" is removed from the program list.
- And I see a message indicating no programs have been created.
- And I see a prompt to create the first program.

## Edge cases

### TC-006: "Informatique & IA - Niveau 2" is removed after its deletion is confirmed

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Informatique & IA - Niveau 2" and Description "Programme d'informatique et d'intelligence artificielle".
  - The user is on the Programs page.

**Steps:**

1. Given a program "Informatique & IA - Niveau 2" exists
2. When I click the delete icon for "Informatique & IA - Niveau 2"
3. And I confirm deletion

**Expected result:**

- Then "Informatique & IA - Niveau 2" is removed from the program list.

### TC-007: A program with a 255-character Program Name remains after Cancel

- **Priority:** Low
- **Preconditions:**
  - An admin user is logged in.
  - A program exists whose Program Name is the character "W" repeated 255 times and whose Description is "Boundary length program name".
  - The user is on the Programs page.

**Steps:**

1. Given I click the delete icon for the program named with 255 "W" characters
2. When I see the confirmation dialog
3. And I click Cancel

**Expected result:**

- Then the confirmation dialog closes.
- And the program list still shows the 255-character Program Name in full.
- And the Description remains "Boundary length program name".

### TC-008: Confirming deletion once removes "Test Program" a single time

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Test Program" and Description "Temporary program used for deletion".
  - A program exists with Program Name "Web Development 2026" and Description "Full-stack web development program".
  - The confirmation dialog for "Test Program" is open.

**Steps:**

1. Given the confirmation dialog for "Test Program" is open
2. When I confirm deletion once

**Expected result:**

- Then "Test Program" is removed from the program list.
- And "Web Development 2026" remains in the program list.
- And the confirmation dialog closes.

## Ambiguities and gaps

- The confirm control's label is not specified. These cases use the acceptance criteria wording "confirm deletion". Cancel is named.
- The confirmation dialog text is not specified, including whether it shows the Program Name "Test Program".
- It is not stated whether Escape, the dialog close icon, or clicking outside the dialog cancels deletion.
- It is not stated whether a program that already has curriculum can be deleted, or whether deletion is blocked.
- It is not stated whether a non-admin user can see the delete icon.
- TC-005 uses the empty-state wording from the program list story. That wording is not in this ticket.
- It is not stated whether a deleted Program Name can be used again for a new program.
- The maximum Program Name length is not defined. TC-007 reuses the 255-character assumption from the validation story.
