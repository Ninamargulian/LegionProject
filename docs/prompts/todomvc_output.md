# Test Plan: TodoMVC (https://demo.playwright.dev/todomvc/)

**Application under test:** React TodoMVC demo  
**Primary input:** New todo field (placeholder: `What needs to be done?`)  
**List:** Todo items with completion checkbox and delete control

---

## Positive flows

### TC-001: New todo appears in the list after Enter

- **Priority:** High
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/
  - The todo list is empty or does not yet contain "Buy milk"

**Steps:**

1. Click the New todo field (`What needs to be done?`).
2. Type `Buy milk`.
3. Press Enter.

**Expected result:**

- The list contains one item with visible text `Buy milk`.
- The New todo field is empty and ready for another entry.

### TC-002: Completed todo shows as completed in the list

- **Priority:** High
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/
  - A todo `Walk the dog` exists in the list and is not completed.

**Steps:**

1. Locate the list item with text `Walk the dog`.
2. Click the completion checkbox for that item.

**Expected result:**

- The item `Walk the dog` is marked completed (completed styling applied, e.g. strikethrough).
- The item remains in the list until filtered or deleted.

### TC-003: Todo is removed from the list after delete

- **Priority:** High
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/
  - A todo `Pay electricity bill` exists in the list.

**Steps:**

1. Locate the list item with text `Pay electricity bill`.
2. Hover or focus the item so the delete control is available (destroy / × control).
3. Click the delete control for `Pay electricity bill`.

**Expected result:**

- `Pay electricity bill` is no longer visible in the todo list.
- No other todos are removed unless explicitly deleted.

### TC-004: Multiple todos can be added in sequence

- **Priority:** Medium
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/
  - The list does not contain `Buy milk`, `Walk the dog`, or `Read Playwright docs`.

**Steps:**

1. Add `Buy milk` via the New todo field and Enter.
2. Add `Walk the dog` via the New todo field and Enter.
3. Add `Read Playwright docs` via the New todo field and Enter.

**Expected result:**

- The list shows all three items in add order (top to bottom): `Buy milk`, then `Walk the dog`, then `Read Playwright docs` (or the app’s documented order if different).
- Each item has its own completion checkbox and delete control.

### TC-005: Completed todo can be marked active again

- **Priority:** Medium
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/
  - A todo `Walk the dog` exists and is completed.

**Steps:**

1. Click the completion checkbox for `Walk the dog` again.

**Expected result:**

- `Walk the dog` is no longer marked completed (active styling restored).
- The item text remains `Walk the dog`.

---

## Negative flows

### TC-006: Empty submit does not add a list item

- **Priority:** High
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/
  - The New todo field is empty.
  - The current todo count is noted.

**Steps:**

1. Click the New todo field.
2. Press Enter without typing any text.

**Expected result:**

- No new todo row appears.
  - The todo count is unchanged.

### TC-007: Whitespace-only input does not add a meaningful todo

- **Priority:** High
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/
  - The list is empty or the count is known.

**Steps:**

1. In the New todo field, type three spaces: `   `.
2. Press Enter.

**Expected result:**

- No new todo with visible text appears, or the app rejects whitespace-only input (no net increase in active todos).
- The list does not show a blank or whitespace-only item as a valid todo.

### TC-008: Completing a todo does not remove it from All view

- **Priority:** Medium
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/
  - A todo `Buy milk` exists and is active.
  - The All filter is selected (if filters are visible).

**Steps:**

1. Mark `Buy milk` as completed.
2. Observe the main todo list in the default / All view.

**Expected result:**

- `Buy milk` is still present in the list (completed state only).
- `Buy milk` is not deleted solely because it was completed.

### TC-009: Delete removes only the targeted todo

- **Priority:** High
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/
  - Todos `Buy milk` and `Walk the dog` exist.

**Steps:**

1. Delete `Buy milk` using its delete control.

**Expected result:**

- `Buy milk` is absent from the list.
- `Walk the dog` remains in the list unchanged.

### TC-010: Adding a todo does not auto-complete it

- **Priority:** Medium
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/

**Steps:**

1. Add `Schedule dentist appointment` via New todo and Enter.

**Expected result:**

- `Schedule dentist appointment` appears as an active (not completed) item.
- The completion checkbox is unchecked.

---

## Edge cases

### TC-011: Todo text with special characters is stored and displayed correctly

- **Priority:** Medium
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/

**Steps:**

1. Add `Buy 2× "organic" eggs & bread (50% off!)` via New todo and Enter.

**Expected result:**

- The list shows the exact text: `Buy 2× "organic" eggs & bread (50% off!)`.
- Characters `×`, quotes, `&`, parentheses, and `%` render correctly and are not stripped or HTML-escaped in a broken way.

### TC-012: Duplicate todo titles are allowed as separate items

- **Priority:** Medium
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/
  - No item named `Buy milk` exists, or count of `Buy milk` is zero.

**Steps:**

1. Add `Buy milk` and press Enter.
2. Add `Buy milk` again and press Enter.

**Expected result:**

- Two separate list items both display `Buy milk`.
- Each has its own checkbox and delete control.
- Completing or deleting one does not automatically complete or delete the other.

### TC-013: Long todo text is accepted and visible

- **Priority:** Medium
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/
  - Long text: repeat `Long task description. ` until the string length is 500 characters.

**Steps:**

1. Paste or type the 500-character string into the New todo field.
2. Press Enter.

**Expected result:**

- One new todo appears containing the full 500-character text (or the app’s documented maximum if shorter).
- The item can be completed and deleted like any other todo.

### TC-014: Single-character todo is valid

- **Priority:** Low
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/

**Steps:**

1. Type `A` in the New todo field.
2. Press Enter.

**Expected result:**

- The list contains an item showing `A`.
- The item can be completed and deleted.

### TC-015: Unicode and emoji in todo text display correctly

- **Priority:** Medium
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/

**Steps:**

1. Add `Réunion équipe — préparer café ☕` via New todo and Enter.

**Expected result:**

- The list shows the full string including accented characters and ☕.
- Complete and delete work on this item.

### TC-016: Leading and trailing spaces in todo text are handled consistently

- **Priority:** Medium
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/

**Steps:**

1. Add `  Trim me  ` (spaces before and after) via New todo and Enter.

**Expected result:**

- Behavior matches app rules: either the stored label is trimmed to `Trim me`, or the full padded string is shown consistently in the list and after reload (if persistence exists).
- The item is still completable and deletable.

### TC-017: Very long input at input boundary (if limited)

- **Priority:** Low
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/
  - A string of 10,000 characters is prepared.

**Steps:**

1. Attempt to enter the 10,000-character string in the New todo field and press Enter.

**Expected result:**

- Either the full text is saved as one todo, or the app truncates/rejects with clear behavior (no silent corruption, no broken UI).
- The list state remains consistent (no partial duplicate rows).

### TC-018: Complete all items then delete one leaves others intact

- **Priority:** Medium
- **Preconditions:**
  - Browser is open at https://demo.playwright.dev/todomvc/
  - Todos `Task one`, `Task two`, and `Task three` exist.

**Steps:**

1. Mark all three items completed.
2. Delete `Task two` only.

**Expected result:**

- `Task two` is removed.
- `Task one` and `Task three` remain, still completed unless the app defines otherwise.

---

## Ambiguities and gaps

- **Persistence:** Acceptance criteria do not state whether todos survive a full page refresh or new session. Tests assume in-session behavior unless storage is confirmed.
- **Delete interaction:** Standard TodoMVC hides delete until hover; criteria say “delete” but not hover, keyboard (Backspace while editing), or “Clear completed.” TC-003 assumes the per-item destroy control.
- **Empty / whitespace:** Criteria do not define whether whitespace-only Enter creates an item. TC-006 and TC-007 expect no valid new todo.
- **Duplicate policy:** No rule on duplicate titles. TC-012 assumes duplicates are allowed (typical TodoMVC).
- **Max length:** No maximum todo length in ACs. TC-013 and TC-017 probe long input without a fixed limit.
- **Filters and footer:** Completing items may affect Active/Completed counts and filters; ACs only mention complete and delete, not filter behavior (TC-008 touches All view only).
- **Edit flow:** Double-click to edit is shown on the demo page but is out of scope for the three ACs; not covered here.
- **Accessibility / keyboard-only:** ACs do not require keyboard paths for add, complete, or delete; steps use click/Enter for add only.
