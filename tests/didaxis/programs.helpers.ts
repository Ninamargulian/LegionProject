import { expect, Locator, Page } from '@playwright/test';

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set in .env for Didaxis program tests`);
  }
  return value;
}

export function uniqueName(base: string): string {
  return `${base}-${Date.now()}`;
}

export async function loginAsAdmin(page: Page): Promise<void> {
  const baseUrl = requireEnv('DIDAXIS_URL').replace(/\/$/, '');
  await page.goto(`${baseUrl}/programs`, { waitUntil: 'networkidle' });

  if (!page.url().includes('/login')) {
    return;
  }

  await page.getByRole('textbox', { name: 'Email' }).fill(requireEnv('DIDAXIS_EMAIL'));
  await page.getByRole('textbox', { name: 'Password' }).fill(requireEnv('DIDAXIS_PASSWORD'));
  const signIn = page.getByRole('button', { name: 'Sign In' });
  await expect(signIn).toBeEnabled({ timeout: 10_000 });
  await signIn.click();
  await page.waitForLoadState('networkidle');

  if (!page.url().includes('/programs')) {
    await page.getByRole('button', { name: /programs/i }).click();
    await page.waitForLoadState('networkidle');
  }
}

export async function gotoProgramsPage(page: Page): Promise<void> {
  if (!page.url().includes('/programs')) {
    await page.getByRole('button', { name: /programs/i }).click();
    await page.waitForLoadState('networkidle');
  }
  await expect(page.getByRole('heading', { name: 'Programs', level: 2 })).toBeVisible();
}

export function newProgramButton(page: Page): Locator {
  return page.getByRole('button', { name: '+ New Program' });
}

export function newProgramDialog(page: Page): Locator {
  return page.getByRole('dialog', { name: 'New Program' });
}

export function editProgramDialog(page: Page): Locator {
  return page.getByRole('dialog', { name: 'Edit Program' });
}

export function programNameField(dialog: Locator): Locator {
  return dialog.getByRole('textbox', { name: 'Program Name' });
}

export function programDescriptionField(dialog: Locator): Locator {
  return dialog.getByRole('textbox', { name: 'Description' });
}

export function programRow(page: Page, programName: string): Locator {
  return page.getByRole('row').filter({
    has: page.getByRole('button', { name: `Edit ${programName}` }),
  });
}

export function programTitleInRow(row: Locator): Locator {
  return row.locator('td p').first();
}

export function programDescriptionInRow(row: Locator): Locator {
  return row.locator('td p').nth(1);
}

export function editProgramButton(page: Page, programName: string): Locator {
  return page.getByRole('button', { name: `Edit ${programName}` });
}

export function deleteProgramButton(page: Page, programName: string): Locator {
  return page.getByRole('button', { name: `Delete ${programName}` });
}

export async function openNewProgramDialog(page: Page): Promise<Locator> {
  await newProgramButton(page).click();
  const dialog = newProgramDialog(page);
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function createProgram(
  page: Page,
  programName: string,
  description: string,
): Promise<void> {
  const dialog = await openNewProgramDialog(page);
  await programNameField(dialog).fill(programName);
  await programDescriptionField(dialog).fill(description);
  const create = dialog.getByRole('button', { name: 'Create' });
  await expect(create).toBeEnabled();
  await create.click();
  await expect(dialog).toBeHidden({ timeout: 15_000 });
  const editButton = editProgramButton(page, programName);
  await editButton.scrollIntoViewIfNeeded();
  await expect(editButton).toBeVisible({ timeout: 15_000 });
}

export async function openEditProgram(page: Page, programName: string): Promise<Locator> {
  await editProgramButton(page, programName).click();
  const dialog = editProgramDialog(page);
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function saveEditProgram(page: Page): Promise<void> {
  const dialog = editProgramDialog(page);
  const save = dialog.getByRole('button', { name: 'Save' });
  await expect(save).toBeEnabled();
  await save.click();
  await expect(dialog).toBeHidden({ timeout: 15_000 });
}

export async function cancelDialog(page: Page): Promise<void> {
  const dialog = page.getByRole('dialog').filter({ has: page.getByRole('button', { name: 'Cancel' }) });
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toBeHidden();
}

export async function clickDeleteProgram(page: Page, programName: string): Promise<void> {
  const deleteButton = deleteProgramButton(page, programName);
  await deleteButton.scrollIntoViewIfNeeded();
  await deleteButton.click({ force: true });
}

/** Didaxis uses a native confirm() dialog for program deletion (MCP probe). */
export async function acceptNativeConfirm(page: Page, action: () => Promise<void>): Promise<string> {
  const messagePromise = new Promise<string>((resolve) => {
    page.once('dialog', async (dialog) => {
      resolve(dialog.message());
      await dialog.accept();
    });
  });
  await action();
  return messagePromise;
}

export async function dismissNativeConfirm(page: Page, action: () => Promise<void>): Promise<string> {
  const messagePromise = new Promise<string>((resolve) => {
    page.once('dialog', async (dialog) => {
      resolve(dialog.message());
      await dialog.dismiss();
    });
  });
  await action();
  return messagePromise;
}

export async function deleteProgram(page: Page, programName: string): Promise<void> {
  await acceptNativeConfirm(page, async () => {
    await clickDeleteProgram(page, programName);
  });
  await expect(editProgramButton(page, programName)).toHaveCount(0, { timeout: 15_000 });
}

export async function waitForDeleteConfirmDialog(
  page: Page,
  programName: string,
): Promise<{ message: string; dismiss: () => Promise<void> }> {
  let capturedMessage = '';
  let dismissFn: (() => Promise<void>) | undefined;
  const dialogPromise = new Promise<void>((resolve) => {
    page.once('dialog', async (dialog) => {
      capturedMessage = dialog.message();
      dismissFn = async () => {
        await dialog.dismiss();
      };
      resolve();
    });
  });
  await clickDeleteProgram(page, programName);
  await dialogPromise;
  await expect(capturedMessage).toMatch(
    new RegExp(`Delete program "${programName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i'),
  );
  return {
    message: capturedMessage,
    dismiss: async () => {
      if (dismissFn) {
        await dismissFn();
      }
    },
  };
}

export async function closeNewProgramDialogIfOpen(page: Page): Promise<void> {
  const dialog = newProgramDialog(page);
  if (await dialog.isVisible()) {
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  }
}

export async function expectDuplicateNameError(page: Page): Promise<void> {
  await expect(page.getByText(/already exists|duplicate/i).first()).toBeVisible();
}

export function repeatChar(char: string, count: number): string {
  return char.repeat(count);
}
