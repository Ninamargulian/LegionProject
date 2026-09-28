import { Locator, Page } from '@playwright/test';

export const TODO_MVC_URL = 'https://demo.playwright.dev/todomvc/';

export async function openTodoMVC(page: Page): Promise<void> {
  await page.goto(TODO_MVC_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

export function newTodoInput(page: Page): Locator {
  return page.getByPlaceholder('What needs to be done?');
}

export async function addTodo(page: Page, text: string): Promise<void> {
  const input = newTodoInput(page);
  await input.click();
  await input.fill(text);
  await input.press('Enter');
}

export function todoItems(page: Page): Locator {
  return page.locator('.todo-list li');
}

export function todoItem(page: Page, text: string): Locator {
  return page.locator('.todo-list li').filter({ hasText: text });
}

export async function toggleTodo(page: Page, text: string, index = 0): Promise<void> {
  await todoItem(page, text).nth(index).getByRole('checkbox').click();
}

export async function deleteTodo(page: Page, text: string, index = 0): Promise<void> {
  const item = todoItem(page, text).nth(index);
  await item.hover();
  await item.locator('.destroy').click();
}

export function repeatText(fragment: string, targetLength: number): string {
  let result = '';
  while (result.length < targetLength) {
    result += fragment;
  }
  return result.slice(0, targetLength);
}
