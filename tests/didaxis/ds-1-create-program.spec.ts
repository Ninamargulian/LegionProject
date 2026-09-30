import { test, expect } from '@playwright/test';
import {
  assertDuplicateNameRejected,
  cancelDialog,
  createProgram,
  editProgramButton,
  loginAsAdmin,
  newProgramDialog,
  openNewProgramDialog,
  programDescriptionField,
  programNameField,
  programRow,
  programTitleInRow,
  repeatChar,
  uniqueName,
} from './programs.helpers';

test.describe('DS-1 Create new academic program', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await loginAsAdmin(page);
  });

  test('TC-001: Program creation form shows Program Name and Description', async ({ page }) => {
    const dialog = await openNewProgramDialog(page);
    await expect(programNameField(dialog)).toBeVisible();
    await expect(programDescriptionField(dialog)).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Create' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('TC-002: Program list shows new program after successful create', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';
    await createProgram(page, name, description);

    await expect(newProgramDialog(page)).toBeHidden();
    await expect(programTitleInRow(programRow(page, name))).toHaveText(name);
    await expect(programRow(page, name)).toBeVisible();
  });

  test('TC-003: Create stays disabled while Program Name is empty', async ({ page }) => {
    const dialog = await openNewProgramDialog(page);
    await programNameField(dialog).fill('');
    await expect(dialog.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  test('TC-004: Program list stays unchanged when the form is closed without Create', async ({
    page,
  }) => {
    const name = uniqueName('Web Development 2026');
    const dialog = await openNewProgramDialog(page);
    await programNameField(dialog).fill(name);
    await programDescriptionField(dialog).fill('Full-stack web development program');
    await cancelDialog(page);

    await expect(editProgramButton(page, name)).toHaveCount(0);
  });

  test('TC-005: Create stays disabled when only Description is filled', async ({ page }) => {
    const dialog = await openNewProgramDialog(page);
    await programNameField(dialog).fill('');
    await programDescriptionField(dialog).fill('Full-stack web development program');
    await expect(dialog.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  test('TC-006: Duplicate Program Name is not added on create', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    await createProgram(page, name, 'Full-stack web development program');
    const countBeforeDuplicate = await editProgramButton(page, name).count();

    const dialog = await openNewProgramDialog(page);
    await programNameField(dialog).fill(name);
    await programDescriptionField(dialog).fill('Another full-stack cohort');
    await dialog.getByRole('button', { name: 'Create' }).click();

    await assertDuplicateNameRejected(page, name, countBeforeDuplicate, 'DS-1 TC-006');
  });

  test('TC-007: Program list shows a one-character Program Name', async ({ page }) => {
    const name = uniqueName('A');
    await createProgram(page, name, 'Single-character program name');
    await expect(programRow(page, name)).toBeVisible();
  });

  test('TC-008: Program list shows a 255-character Program Name in full', async ({ page }) => {
    const name = `MaxLen255Create-${Date.now()}${repeatChar('W', 220)}`.slice(0, 255);
    await createProgram(page, name, 'Boundary length program name');
    await expect(programTitleInRow(programRow(page, name))).toHaveText(name);
  });

  test('TC-009: Program list shows special-character program name exactly', async ({ page }) => {
    const name = uniqueName('Informatique & IA - Niveau 2');
    const description = "Programme d'informatique et d'intelligence artificielle";
    await createProgram(page, name, description);
    await expect(programTitleInRow(programRow(page, name))).toHaveText(name);
  });

  test('TC-010: Program list shows program when Description is empty', async ({ page }) => {
    const name = uniqueName('Data Science 2026');
    await createProgram(page, name, '');
    await expect(programTitleInRow(programRow(page, name))).toHaveText(name);
    await expect(programRow(page, name).locator('td').first().locator('p')).toHaveCount(1);
  });

  test('TC-011: Whitespace-only Program Name does not create a program', async ({ page }) => {
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
});
