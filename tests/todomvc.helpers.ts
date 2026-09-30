import { Locator, Page } from '@playwright/test';

export const TODO_MVC_URL = 'https://demo.playwright.dev/todomvc/';

const NEW_TODO_LABEL = 'What needs to be done?';
const TOGGLE_TODO_NAME = 'Toggle Todo';
const DELETE_TODO_NAME = 'Delete';

export async function openTodoMVC(page: Page): Promise<void> {
  await page.goto(TODO_MVC_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expectNewTodoReady(page);
}

async function expectNewTodoReady(page: Page): Promise<void> {
  await newTodoInput(page).waitFor({ state: 'visible' });
}

export function newTodoInput(page: Page): Locator {
  return page.getByRole('textbox', { name: NEW_TODO_LABEL });
}

/** Todo rows only (excludes filter links in the footer). */
export function todoList(page: Page): Locator {
  return page.locator('section.main').getByRole('list').first();
}

export function todoItems(page: Page): Locator {
  return todoList(page).getByRole('listitem');
}

export function todoItem(page: Page, text: string): Locator {
  return todoItems(page).filter({ hasText: text });
}

export function todoItemLabel(page: Page, text: string): Locator {
  return todoItem(page, text).locator('label');
}

export function todoItemToggle(page: Page, text: string, index = 0): Locator {
  return todoItem(page, text)
    .nth(index)
    .getByRole('checkbox', { name: TOGGLE_TODO_NAME });
}

export function todoItemDelete(page: Page, text: string, index = 0): Locator {
  return todoItem(page, text).nth(index).getByRole('button', { name: DELETE_TODO_NAME });
}

export async function addTodo(page: Page, text: string): Promise<void> {
  const input = newTodoInput(page);
  await input.fill(text);
  await input.press('Enter');
}

export async function toggleTodo(page: Page, text: string, index = 0): Promise<void> {
  await todoItemToggle(page, text, index).click();
}

export async function deleteTodo(page: Page, text: string, index = 0): Promise<void> {
  const item = todoItem(page, text).nth(index);
  await item.hover();
  await item.getByRole('button', { name: DELETE_TODO_NAME }).click();
}

export function repeatText(fragment: string, targetLength: number): string {
  let result = '';
  while (result.length < targetLength) {
    result += fragment;
  }
  return result.slice(0, targetLength);
}
