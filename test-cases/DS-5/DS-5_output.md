# Test Plan: DS-5 — Program list filtering and display

## Positive flows

### TC-001: Programs page shows the name and description of each existing program

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Web Development 2026" and Description "Full-stack web development program".
  - A program exists with Program Name "Informatique & IA - Niveau 2" and Description "Programme d'informatique et d'intelligence artificielle".

**Steps:**

1. Given programs exist in the system
2. When I navigate to the Programs page

**Expected result:**

- Then I see a list showing Program Name "Web Development 2026" and Description "Full-stack web development program".
- And I see a list showing Program Name "Informatique & IA - Niveau 2" and Description "Programme d'informatique et d'intelligence artificielle".

### TC-002: Empty Programs page shows a no-programs message and a prompt to create the first program

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - No programs exist.

**Steps:**

1. Given no programs exist
2. When I navigate to the Programs page

**Expected result:**

- Then I see a message indicating no programs have been created.
- And I see a prompt to create the first program.
- And the program list has no program rows.

## Negative flows

### TC-003: A removed program is absent from the list

- **Priority:** High
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Web Development 2026" and Description "Full-stack web development program".
  - "Test Program" has been deleted and no longer exists.

**Steps:**

1. Given programs exist in the system
2. And "Test Program" does not exist
3. When I navigate to the Programs page

**Expected result:**

- Then the list shows "Web Development 2026".
- And the list does not show "Test Program".

### TC-004: Programs page shows the program list when one program exists

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - The only program is Program Name "Web Development 2026" and Description "Full-stack web development program".

**Steps:**

1. Given programs exist in the system
2. When I navigate to the Programs page

**Expected result:**

- Then I see a list showing Program Name "Web Development 2026" and Description "Full-stack web development program".
- And I do not see the message indicating no programs have been created.

## Edge cases

### TC-005: Program name "Informatique & IA - Niveau 2" is displayed exactly

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Informatique & IA - Niveau 2" and Description "Programme d'informatique et d'intelligence artificielle".

**Steps:**

1. Given programs exist in the system
2. When I navigate to the Programs page

**Expected result:**

- Then the list shows the Program Name Informatique & IA - Niveau 2.
- And the list shows the Description Programme d'informatique et d'intelligence artificielle.

### TC-006: A program with an empty Description still shows its Program Name

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Data Science 2026" and an empty Description.

**Steps:**

1. Given programs exist in the system
2. When I navigate to the Programs page

**Expected result:**

- Then the list shows Program Name "Data Science 2026".
- And the Description for "Data Science 2026" is empty.

### TC-007: A 255-character Program Name is displayed in full

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - A program exists whose Program Name is the character "W" repeated 255 times and whose Description is "Boundary length program name".

**Steps:**

1. Given programs exist in the system
2. When I navigate to the Programs page

**Expected result:**

- Then the list shows the 255-character Program Name in full.
- And the list shows Description "Boundary length program name".

### TC-008: A 500-character Description is displayed in full

- **Priority:** Low
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Cybersecurity 2026" and a Description of the character "D" repeated 500 times.

**Steps:**

1. Given programs exist in the system
2. When I navigate to the Programs page

**Expected result:**

- Then the list shows Program Name "Cybersecurity 2026".
- And the list shows the 500-character Description in full.

### TC-009: Two programs whose names differ only by suffix are both listed

- **Priority:** Medium
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Web Development 2026" and Description "Full-stack web development program".
  - A program exists with Program Name "Web Development 2026 - Updated" and Description "Renamed full-stack web development program".

**Steps:**

1. Given programs exist in the system
2. When I navigate to the Programs page

**Expected result:**

- Then the list shows "Web Development 2026" with Description "Full-stack web development program".
- And the list shows "Web Development 2026 - Updated" with Description "Renamed full-stack web development program".

## Ambiguities and gaps

- The story title includes filtering. The acceptance criteria do not describe a search box, filter control, or filterable fields. No filter test is included until that behavior is specified.
- The empty-state message text is not specified. TC-002 expects the meaning given in the acceptance criteria: no programs have been created.
- The "prompt to create the first program" is not specified as a button, link, or label. It is not stated whether it is the same control as "+ New Program".
- Sort order is not specified.
- Pagination, or a maximum number of programs on one page, is not specified.
- It is not stated whether a long Program Name or Description may be visually truncated. TC-007 and TC-008 assume the full values are displayed. The maximum lengths are not defined; 255 and 500 are probe values.
- It is not stated whether an empty Description is allowed. TC-006 assumes the program still appears and the name remains visible.
- It is not stated whether the list is limited to programs created by the logged-in admin.
