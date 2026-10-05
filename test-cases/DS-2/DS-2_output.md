# Test Plan: DS-2 — Edit existing program details

**Jira:** [DS-2 Edit existing program details](https://legionqaschool.atlassian.net/browse/DS-2)  
**User story:** As an admin, I want to edit an existing program's details so I can correct or update program information after creation.

## Jira acceptance criteria (source)

```gherkin
Scenario: Open program for editing
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with the program's current data

Scenario: Successfully edit a program name
  Given I am editing "Web Development 2026"
  When I change the Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"

Scenario: Edit preserves unchanged fields
  Given I am editing a program
  When I only change the Description
  And I click Save
  Then the Name and other fields remain unchanged
```

## Jira AC traceability

| Jira scenario | Test cases |
| --- | --- |
| Open program for editing | **TC-001** |
| Successfully edit a program name | **TC-002** |
| Edit preserves unchanged fields | **TC-003** |

TC-004–TC-014 extend the story (validation, duplicates, boundaries, defects seen on test.didaxis.studio).

## Observed UI (Playwright MCP — test.didaxis.studio)

Exploration date: 2026-10-05. Raw notes: `.playwright-mcp/ds2-ui-findings.json`.

| Area | Actual behavior |
| --- | --- |
| Auth | Admin signs in with **Email** / **Password**, **Sign In**; lands on `/programs`. |
| Programs page | Heading **Programs** (level 2), **+ New Program**, table of programs. |
| Open edit | Per-row **button** with `aria-label` **`Edit {Program Name}`** (icon inside the button; not visible “✏️” text in the accessibility tree). |
| Edit surface | Modal **`Edit Program`** (`role=dialog`) with textboxes **Program Name**, **Description**, and **Save** / **Cancel**. |
| Empty name | **Save** is **disabled** when Program Name is cleared. |
| Empty description | **Save** stays **enabled** when Description is cleared. |
| After rename | **Edit Program** modal closes; row exposes **`Edit {new name}`**. |
| Duplicate rename | Saving a rename to an **existing** program name often **does not** show an “already exists” error; dialog closes; **multiple rows** can share the same name (two **`Edit {same name}`** buttons). |
| Max length in field | Pasting/typing **256** characters into Program Name leaves **255** characters in the control; **Save** remains enabled. |

Use the **Edit {Program Name}** / **Delete {Program Name}** buttons scoped to the target row when the list is large.

## Positive flows

### TC-001: Edit form shows the current Program Name and Description

- **Priority:** High  
- **Maps to Jira:** Open program for editing  
- **Preconditions:**
  - An admin user is logged in.
  - A program exists with Program Name "Web Development 2026" and Description "Full-stack web development program".
  - The user is on the Programs page.

**Steps:**

1. Given I am on the Programs page  
2. And a program "Web Development 2026" exists  
3. When I click the **Edit** control for "Web Development 2026" (`Edit Web Development 2026`)

**Expected result:**

- Then the **Edit Program** modal opens.  
- And **Program Name** is pre-populated with "Web Development 2026".  
- And **Description** is pre-populated with "Full-stack web development program".

### TC-002: Program list shows "Web Development 2026 - Updated" immediately after Save

- **Priority:** High  
- **Maps to Jira:** Successfully edit a program name  
- **Preconditions:**
  - An admin user is logged in.
  - The **Edit Program** modal is open for Program Name "Web Development 2026" and Description "Full-stack web development program".

**Steps:**

1. Given I am editing "Web Development 2026"  
2. When I change **Program Name** to "Web Development 2026 - Updated"  
3. And I click **Save**

**Expected result (Jira / intended product behavior):**

- Then the **Edit Program** modal closes.  
- And the program list **immediately** shows "Web Development 2026 - Updated" (no manual refresh).  
- And the program list does **not** show "Web Development 2026" as the active name for that program (single row updated in place).

**Known gaps on test.didaxis.studio (2026-10-05):** Related defects **DS-9**, **DS-99**, **DS-108** — stale list, extra row, or old name still visible after rename. Log failures against those issues; do not treat as pass without product fix.

### TC-003: Program Name stays "Web Development 2026" when only Description changes

- **Priority:** High  
- **Maps to Jira:** Edit preserves unchanged fields  
- **Preconditions:**
  - An admin user is logged in.
  - The **Edit Program** modal is open for Program Name "Web Development 2026" and Description "Full-stack web development program".

**Steps:**

1. Given I am editing a program  
2. When I only change **Description** to "Evening cohort for full-stack web development"  
3. And I click **Save**

**Expected result:**

- Then the **Edit Program** modal closes.  
- Then **Program Name** remains "Web Development 2026".  
- And **Description** is "Evening cohort for full-stack web development".

## Negative flows

### TC-004: Program details stay unchanged when the edit form is closed without Save

- **Priority:** Medium  
- **Preconditions:**
  - An admin user is logged in.
  - The **Edit Program** modal is open for Program Name "Web Development 2026" and Description "Full-stack web development program".

**Steps:**

1. Given I am editing "Web Development 2026"  
2. When I change **Program Name** to "Web Development 2026 - Updated"  
3. And I change **Description** to "Evening cohort for full-stack web development"  
4. And I click **Cancel** on the **Edit Program** modal (Escape may also dismiss)

**Expected result:**

- Then the modal closes.  
- And the program list still shows **Program Name** "Web Development 2026".  
- And **Description** remains "Full-stack web development program".

### TC-005: An empty Program Name is not saved

- **Priority:** High  
- **Preconditions:**
  - An admin user is logged in.
  - The **Edit Program** modal is open for Program Name "Web Development 2026" and Description "Full-stack web development program".

**Steps:**

1. Given I am editing "Web Development 2026"  
2. When I clear **Program Name**  
3. And I attempt to click **Save**

**Expected result:**

- Then **Save** is **disabled**, **or** Save does not persist changes.  
- And the program list still shows **Program Name** "Web Development 2026".  
- And **Description** remains "Full-stack web development program".

**Observed on test.didaxis.studio:** **Save** is disabled when the name is empty.

### TC-006: Program Name is not changed to a name that already exists

- **Priority:** High (product intent; duplicate validation may be incomplete)  
- **Preconditions:**
  - An admin user is logged in.
  - Program A: "Web Development 2026" / "Full-stack web development program".  
  - Program B: "Data Science 2026" / "Applied data science program".  
  - **Edit Program** is open for "Data Science 2026".

**Steps:**

1. Given I am editing "Data Science 2026"  
2. When I change **Program Name** to "Web Development 2026"  
3. And I click **Save**

**Expected result (product intent):**

- Then a visible error indicates the name already exists.  
- And the list still shows **both** distinct programs: "Data Science 2026" and "Web Development 2026".

**Observed on test.didaxis.studio (2026-10-05):** No validation message; modal closes; **two rows** can end up with the **same** Program Name (duplicate **`Edit {name}`** buttons). Treat as **fail** against this case until fixed (see **DS-131**, **DS-38**, **DS-147**).

## Edge cases

### TC-007: Description can be cleared while Program Name stays the same

- **Priority:** Medium  
- **Preconditions:**
  - An admin user is logged in.
  - **Edit Program** is open for Program Name "Web Development 2026" and Description "Full-stack web development program".

**Steps:**

1. Given I am editing a program  
2. When I clear **Description** only  
3. And I click **Save**

**Expected result:**

- Then **Program Name** remains "Web Development 2026".  
- And the list row shows the name only (no description line under the name).

**Observed on test.didaxis.studio:** Cleared description removes the second line in the program cell; there is no empty placeholder paragraph.

### TC-008: Program list shows the special-character name entered on edit

- **Priority:** Medium  
- **Preconditions:**
  - An admin user is logged in.
  - **Edit Program** is open for "Web Development 2026".  
  - No other program named "Informatique & IA - Niveau 2".

**Steps:**

1. When I change **Program Name** to "Informatique & IA - Niveau 2"  
2. And I click **Save**

**Expected result:**

- Then the modal closes.  
- And the list shows **Program Name** exactly "Informatique & IA - Niveau 2".  
- And **Description** remains "Full-stack web development program".

### TC-009: Program list shows a one-character Program Name after edit

- **Priority:** Low  
- **Preconditions:**
  - **Edit Program** is open for "Web Development 2026".

**Steps:**

1. When I change **Program Name** to "A"  
2. And I click **Save**

**Expected result:**

- Then the list shows **Program Name** "A".  
- And **Description** remains "Full-stack web development program".

### TC-010: Program list shows a 255-character Program Name after edit

- **Priority:** Medium  
- **Preconditions:**
  - **Edit Program** is open for "Web Development 2026".  
  - New name is the character "W" repeated **255** times (unique in the environment).

**Steps:**

1. When I change **Program Name** to 255 "W" characters  
2. And I click **Save**

**Expected result:**

- Then the modal closes.  
- And the list shows the full 255-character **Program Name**.  
- And **Description** remains "Full-stack web development program".

**Observed on test.didaxis.studio:** The **Program Name** field holds at most **255** characters; entering 256 truncates to 255 before save.

### TC-011: Case-only duplicate name on edit is rejected

- **Priority:** High (from Jira subtasks **DS-129**, **DS-148**, **DS-160**)  
- **Preconditions:**
  - Program "Web Development 2026" exists.  
  - **Edit Program** is open for a different program.

**Steps:**

1. When I change **Program Name** to "web development 2026" (case variant of the existing name)  
2. And I click **Save**

**Expected result:**

- Then save is rejected with a duplicate-name indication.  
- And the edited program keeps its original name.

**Observed on test.didaxis.studio:** Case variants are often accepted as separate names (no error). Log against duplicate-validation defects if observed.

### TC-012: List reflects the new name without manual refresh

- **Priority:** High (regression for **DS-9**, **DS-108**)  
- **Preconditions:**
  - A program exists and **Edit Program** is available.

**Steps:**

1. When I rename the program and click **Save**  
2. Without reloading the page, inspect the program table

**Expected result:**

- Then the new **Program Name** appears in the row that was edited.  
- And the previous name is not shown for that program.

### TC-013: Double-click Save does not submit duplicate updates

- **Priority:** Medium (from **DS-130**, **DS-41**, **DS-43**)  
- **Preconditions:**
  - **Edit Program** is open with valid changes.

**Steps:**

1. When I double-click **Save** quickly  
2. And I observe network or resulting list state

**Expected result:**

- Then only **one** successful update occurs.  
- And the modal closes once.

**Observed on test.didaxis.studio:** Double-click may fire duplicate PATCH requests (manual / network verification).

### TC-014: Edit remains usable when the program list is large

- **Priority:** Medium (from **DS-227**, **DS-228**)  
- **Preconditions:**
  - The tenant has a very large number of programs (thousands of rows).

**Steps:**

1. Given I am on the Programs page  
2. When I create or locate a program and open **Edit Program**

**Expected result:**

- Then **+ New Program** and **Edit {Program Name}** remain reachable within a reasonable time (scroll into view if needed).

**Observed on test.didaxis.studio:** Very large lists can slow create/edit setup; use unique names and row-scoped **Edit** / **Delete** controls in automation.

## Automation traceability

| Test case | Playwright (`tests/ds2-edit-program.spec.ts`) |
| --- | --- |
| TC-001–TC-014 | Same title prefix `TC-00N:`; row actions `Edit {Program Name}` / **Edit Program** dialog per MCP table above |
| TC-006 / TC-011 | **Fail** when duplicate validation is missing (no skip) — see DS-131, DS-129 |
| TC-009 | One-character name: plan value `A`; automation uses a single unique letter on shared test.didaxis.studio |
| TC-008 | Special-character string includes `uniqueName()` suffix for tenant uniqueness |

## Ambiguities and gaps

- Jira AC says “edit **icon**”; the live UI exposes an **Edit** action button with `aria-label` **`Edit {Program Name}`** (icon is not exposed as emoji text).  
- Jira AC fields are **Name** and **Description**; the modal labels them **Program Name** and **Description**.  
- Duplicate-name and max-length rules on **edit** are not in the DS-2 AC text but appear in linked defects and subtasks.  
- **TC-006** / **TC-011** intended behavior may **fail** on current test.didaxis.studio until validation ships.  
- **TC-002** / **TC-012** may fail if stale or duplicate rows appear after rename.  
- Non-admin access to **Edit** is not specified.  
- **Description** max length on edit (500 vs 2000) is not confirmed in DS-2; see **DS-144**, **DS-150**.
