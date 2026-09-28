import { test, expect } from '@playwright/test';
import {
  addTodo,
  deleteTodo,
  newTodoInput,
  openTodoMVC,
  repeatText,
  todoItem,
  todoItems,
  toggleTodo,
} from './todomvc.helpers';

test.beforeEach(async ({ page }) => {
  await openTodoMVC(page);
});

test.describe('Positive flows', () => {
  test('TC-001: New todo appears in the list after Enter', async ({ page }) => {
    const input = newTodoInput(page);
    await input.click();
    await input.fill('Buy milk');
    await input.press('Enter');

    await expect(todoItem(page, 'Buy milk')).toHaveCount(1);
    await expect(input).toHaveValue('');
  });

  test('TC-002: Completed todo shows as completed in the list', async ({ page }) => {
    await addTodo(page, 'Walk the dog');
    await toggleTodo(page, 'Walk the dog');

    const item = todoItem(page, 'Walk the dog');
    await expect(item).toHaveClass(/completed/);
    await expect(item).toBeVisible();
  });

  test('TC-003: Todo is removed from the list after delete', async ({ page }) => {
    await addTodo(page, 'Pay electricity bill');
    await deleteTodo(page, 'Pay electricity bill');

    await expect(todoItem(page, 'Pay electricity bill')).toHaveCount(0);
  });

  test('TC-004: Multiple todos can be added in sequence', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Walk the dog');
    await addTodo(page, 'Read Playwright docs');

    await expect(todoItems(page)).toHaveCount(3);
    await expect(todoItems(page)).toHaveText([
      'Buy milk',
      'Walk the dog',
      'Read Playwright docs',
    ]);
    for (const label of ['Buy milk', 'Walk the dog', 'Read Playwright docs']) {
      const item = todoItem(page, label);
      await expect(item.getByRole('checkbox')).toBeVisible();
      await expect(item.locator('.destroy')).toBeAttached();
    }
  });

  test('TC-005: Completed todo can be marked active again', async ({ page }) => {
    await addTodo(page, 'Walk the dog');
    await toggleTodo(page, 'Walk the dog');
    await toggleTodo(page, 'Walk the dog');

    const item = todoItem(page, 'Walk the dog');
    await expect(item).not.toHaveClass(/completed/);
    await expect(item).toContainText('Walk the dog');
  });
});

test.describe('Negative flows', () => {
  test('TC-006: Empty submit does not add a list item', async ({ page }) => {
    const countBefore = await todoItems(page).count();
    const input = newTodoInput(page);
    await input.click();
    await input.press('Enter');

    await expect(todoItems(page)).toHaveCount(countBefore);
  });

  test('TC-007: Whitespace-only input does not add a meaningful todo', async ({
    page,
  }) => {
    const countBefore = await todoItems(page).count();
    await addTodo(page, '   ');

    await expect(todoItems(page)).toHaveCount(countBefore);
  });

  test('TC-008: Completing a todo does not remove it from All view', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await toggleTodo(page, 'Buy milk');

    await expect(todoItem(page, 'Buy milk')).toBeVisible();
    await expect(todoItem(page, 'Buy milk')).toHaveClass(/completed/);
  });

  test('TC-009: Delete removes only the targeted todo', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Walk the dog');
    await deleteTodo(page, 'Buy milk');

    await expect(todoItem(page, 'Buy milk')).toHaveCount(0);
    await expect(todoItem(page, 'Walk the dog')).toHaveCount(1);
  });

  test('TC-010: Adding a todo does not auto-complete it', async ({ page }) => {
    await addTodo(page, 'Schedule dentist appointment');

    const checkbox = todoItem(page, 'Schedule dentist appointment').getByRole('checkbox');
    await expect(checkbox).not.toBeChecked();
    await expect(todoItem(page, 'Schedule dentist appointment')).not.toHaveClass(/completed/);
  });
});

test.describe('Edge cases', () => {
  test('TC-011: Todo text with special characters is stored and displayed correctly', async ({
    page,
  }) => {
    const text = 'Buy 2× "organic" eggs & bread (50% off!)';
    await addTodo(page, text);

    await expect(todoItem(page, text)).toHaveCount(1);
    await expect(todoItem(page, text).locator('label')).toHaveText(text);
  });

  test('TC-012: Duplicate todo titles are allowed as separate items', async ({ page }) => {
    await addTodo(page, 'Buy milk');
    await addTodo(page, 'Buy milk');

    await expect(todoItem(page, 'Buy milk')).toHaveCount(2);
    await toggleTodo(page, 'Buy milk', 0);
    await expect(todoItem(page, 'Buy milk').nth(0)).toHaveClass(/completed/);
    await expect(todoItem(page, 'Buy milk').nth(1)).not.toHaveClass(/completed/);
  });

  test('TC-013: Long todo text is accepted and visible', async ({ page }) => {
    const longText = repeatText('Long task description. ', 500);
    await addTodo(page, longText);

    await expect(todoItems(page)).toHaveCount(1);
    await expect(todoItems(page).first().locator('label')).toHaveText(longText);
    await todoItems(page).first().getByRole('checkbox').click();
    await expect(todoItems(page).first()).toHaveClass(/completed/);
    await todoItems(page).first().hover();
    await todoItems(page).first().locator('.destroy').click();
    await expect(todoItems(page)).toHaveCount(0);
  });

  test('TC-014: Single-character todo is valid', async ({ page }) => {
    await addTodo(page, 'A');

    await expect(todoItem(page, 'A')).toHaveCount(1);
    await toggleTodo(page, 'A');
    await expect(todoItem(page, 'A')).toHaveClass(/completed/);
    await deleteTodo(page, 'A');
    await expect(todoItem(page, 'A')).toHaveCount(0);
  });

  test('TC-015: Unicode and emoji in todo text display correctly', async ({ page }) => {
    const text = 'Réunion équipe — préparer café ☕';
    await addTodo(page, text);

    await expect(todoItem(page, text).locator('label')).toHaveText(text);
    await toggleTodo(page, text);
    await deleteTodo(page, text);
    await expect(todoItem(page, text)).toHaveCount(0);
  });

  test('TC-016: Leading and trailing spaces in todo text are handled consistently', async ({
    page,
  }) => {
    await addTodo(page, '  Trim me  ');

    const item = todoItems(page).first();
    const displayed = (await item.locator('label').textContent()) ?? '';
    expect(displayed === 'Trim me' || displayed === '  Trim me  ').toBeTruthy();

    await item.getByRole('checkbox').click();
    await item.hover();
    await item.locator('.destroy').click();
    await expect(todoItems(page)).toHaveCount(0);
  });

  test('TC-017: Very long input at input boundary (if limited)', async ({ page }) => {
    const longText = repeatText('X', 10_000);
    await addTodo(page, longText);

    const count = await todoItems(page).count();
    expect(count).toBeGreaterThanOrEqual(0);
    expect(count).toBeLessThanOrEqual(1);
    if (count === 1) {
      const label = await todoItems(page).first().locator('label').textContent();
      expect(label?.length).toBeGreaterThan(0);
    }
  });

  test('TC-018: Complete all items then delete one leaves others intact', async ({ page }) => {
    await addTodo(page, 'Task one');
    await addTodo(page, 'Task two');
    await addTodo(page, 'Task three');

    for (const task of ['Task one', 'Task two', 'Task three']) {
      await toggleTodo(page, task);
    }
    await deleteTodo(page, 'Task two');

    await expect(todoItem(page, 'Task two')).toHaveCount(0);
    await expect(todoItem(page, 'Task one')).toHaveClass(/completed/);
    await expect(todoItem(page, 'Task three')).toHaveClass(/completed/);
  });
});
