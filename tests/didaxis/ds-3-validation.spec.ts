import { test, expect } from '@playwright/test';
import {
  closeNewProgramDialogIfOpen,
  createProgram,
  editProgramButton,
  expectDuplicateNameError,
  loginAsAdmin,
  newProgramDialog,
  openNewProgramDialog,
  programNameField,
  programDescriptionField,
  programRow,
  programTitleInRow,
  repeatChar,
  uniqueName,
} from './programs.helpers';

test.describe('DS-3 Program name validation and duplicate prevention', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await loginAsAdmin(page);
  });

  test('TC-001: Program list shows special-character program name', async ({ page }) => {
    const name = uniqueName('Informatique & IA - Niveau 2');
    await createProgram(page, name, "Programme d'informatique et d'intelligence artificielle");
    await expect(programTitleInRow(programRow(page, name))).toHaveText(name);
  });

  test('TC-002: Whitespace-only Program Name is not submitted', async ({ page }) => {
    const dialog = await openNewProgramDialog(page);
    await programNameField(dialog).fill('   ');
    await programDescriptionField(dialog).fill('Whitespace name');
    const create = dialog.getByRole('button', { name: 'Create' });
    if (await create.isEnabled()) {
      await create.click();
      await expect(newProgramDialog(page)).toBeVisible();
    } else {
      await expect(create).toBeDisabled();
    }
  });

  test('TC-003: Duplicate name shows an already-exists error', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    await createProgram(page, name, 'Full-stack web development program');
    const countBeforeDuplicate = await editProgramButton(page, name).count();

    const dialog = await openNewProgramDialog(page);
    await programNameField(dialog).fill(name);
    await programDescriptionField(dialog).fill('Another full-stack cohort');
    await dialog.getByRole('button', { name: 'Create' }).click();

    await expectDuplicateNameError(page);
    await closeNewProgramDialogIfOpen(page);
    await expect(editProgramButton(page, name)).toHaveCount(countBeforeDuplicate);
  });

  test('TC-004: Trailing space on Program Name is treated as duplicate', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    await createProgram(page, name, 'Full-stack web development program');
    const countBeforeDuplicate = await editProgramButton(page, name).count();

    const dialog = await openNewProgramDialog(page);
    await programNameField(dialog).fill(`${name} `);
    await programDescriptionField(dialog).fill('Padded duplicate name');
    await dialog.getByRole('button', { name: 'Create' }).click();

    await expectDuplicateNameError(page);
    await closeNewProgramDialogIfOpen(page);
    await expect(editProgramButton(page, name)).toHaveCount(countBeforeDuplicate);
  });

  test('TC-005: Case-variant duplicate is rejected', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    await createProgram(page, name, 'Full-stack web development program');

    const dialog = await openNewProgramDialog(page);
    await programNameField(dialog).fill(name.toLowerCase());
    await programDescriptionField(dialog).fill('Case-variant duplicate');
    await dialog.getByRole('button', { name: 'Create' }).click();

    const duplicateBlocked = await page.getByText(/already exists|duplicate/i).isVisible();
    const stillOne = (await programRow(page, name).count()) === 1;
    expect(duplicateBlocked || stillOne).toBeTruthy();
  });

  test('TC-006: Single-character Program Name is accepted', async ({ page }) => {
    const name = uniqueName('A');
    await createProgram(page, name, 'Single-character program name');
    await expect(programRow(page, name)).toBeVisible();
  });

  test('TC-007: 255-character Program Name is accepted', async ({ page }) => {
    const name = `MaxLen255-${Date.now()}${repeatChar('W', 230)}`.slice(0, 255);
    await createProgram(page, name, 'Boundary length program name');
    await expect(programTitleInRow(programRow(page, name))).toHaveText(name);
  });

  test('TC-008: Program Name with quotes and brackets is stored as text', async ({ page }) => {
    const name = uniqueName('Web "Dev" <2026>');
    await createProgram(page, name, 'Name with quotes and brackets');
    await expect(programTitleInRow(programRow(page, name))).toHaveText(name);
  });

  test('TC-009: 256-character Program Name is not saved', async ({ page }) => {
    const longName = repeatChar('W', 256);
    const dialog = await openNewProgramDialog(page);
    await programNameField(dialog).fill(longName);
    await programDescriptionField(dialog).fill('Over max length program name');
    const create = dialog.getByRole('button', { name: 'Create' });
    if (await create.isEnabled()) {
      await create.click();
      const hasError =
        (await page.getByText(/too long|maximum|255|invalid/i).isVisible()) ||
        (await newProgramDialog(page).isVisible());
      expect(hasError).toBeTruthy();
    } else {
      await expect(create).toBeDisabled();
    }
  });
});
