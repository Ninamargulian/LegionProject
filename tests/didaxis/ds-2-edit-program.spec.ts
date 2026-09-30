import { test, expect } from '@playwright/test';
import {
  cancelDialog,
  createProgram,
  editProgramButton,
  editProgramDialog,
  loginAsAdmin,
  openEditProgram,
  programDescriptionField,
  programDescriptionInRow,
  programNameField,
  programRow,
  programTitleInRow,
  saveEditProgram,
  uniqueName,
} from './programs.helpers';

test.describe('DS-2 Edit existing program details', () => {
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await loginAsAdmin(page);
  });

  test('TC-001: Edit form shows the current Program Name and Description', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';
    await createProgram(page, name, description);

    await openEditProgram(page, name);
    const dialog = editProgramDialog(page);
    await expect(programNameField(dialog)).toHaveValue(name);
    await expect(programDescriptionField(dialog)).toHaveValue(description);
  });

  test('TC-002: Program list shows updated name immediately after Save', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    const updated = `${name} - Updated`;
    await createProgram(page, name, 'Full-stack web development program');

    const dialog = await openEditProgram(page, name);
    await programNameField(dialog).fill(updated);
    await saveEditProgram(page);

    await expect(editProgramButton(page, updated)).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: updated }).first()).toBeVisible();
  });

  test('TC-003: Program Name stays unchanged when only Description changes', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    const newDescription = 'Evening cohort for full-stack web development';
    await createProgram(page, name, 'Full-stack web development program');

    const dialog = await openEditProgram(page, name);
    await programDescriptionField(dialog).fill(newDescription);
    await saveEditProgram(page);

    const row = programRow(page, name);
    await expect(programTitleInRow(row)).toHaveText(name);
    await expect(programDescriptionInRow(row)).toHaveText(newDescription);
  });

  test('TC-004: Program details stay unchanged when edit is cancelled', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';
    await createProgram(page, name, description);

    const dialog = await openEditProgram(page, name);
    await programNameField(dialog).fill(`${name} - Updated`);
    await programDescriptionField(dialog).fill('Evening cohort for full-stack web development');
    await cancelDialog(page);

    const row = programRow(page, name);
    await expect(programTitleInRow(row)).toHaveText(name);
    await expect(programDescriptionInRow(row)).toHaveText(description);
  });

  test('TC-005: An empty Program Name is not saved', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';
    await createProgram(page, name, description);

    const dialog = await openEditProgram(page, name);
    await programNameField(dialog).fill('');
    const save = dialog.getByRole('button', { name: 'Save' });
    if (await save.isEnabled()) {
      await save.click();
      await expect(editProgramDialog(page)).toBeVisible();
    } else {
      await expect(save).toBeDisabled();
    }

    const row = programRow(page, name);
    await expect(programTitleInRow(row)).toHaveText(name);
    await expect(programDescriptionInRow(row)).toHaveText(description);
  });

  test('TC-006: Program Name is not changed to a name that already exists', async ({ page }) => {
    const existing = uniqueName('Web Development 2026');
    const other = uniqueName('Data Science 2026');
    await createProgram(page, existing, 'Full-stack web development program');
    await createProgram(page, other, 'Applied data science program');

    const dialog = await openEditProgram(page, other);
    await programNameField(dialog).fill(existing);
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText(/already exists|duplicate/i)).toBeVisible();
    await expect(programRow(page, existing)).toBeVisible();
    await expect(programRow(page, other)).toBeVisible();
  });

  test('TC-007: Description can be cleared while Program Name stays the same', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    await createProgram(page, name, 'Full-stack web development program');

    const dialog = await openEditProgram(page, name);
    await programDescriptionField(dialog).fill('');
    await saveEditProgram(page);

    const row = programRow(page, name);
    await expect(programTitleInRow(row)).toHaveText(name);
    await expect(programDescriptionInRow(row)).toHaveText('');
  });

  test('TC-008: Program list shows the special-character name entered on edit', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    const special = uniqueName('Informatique & IA - Niveau 2');
    await createProgram(page, name, 'Full-stack web development program');

    const dialog = await openEditProgram(page, name);
    await programNameField(dialog).fill(special);
    await saveEditProgram(page);

    await expect(programRow(page, special)).toBeVisible();
    await expect(programDescriptionInRow(programRow(page, special))).toHaveText(
      'Full-stack web development program',
    );
  });

  test('TC-009: Program list shows a one-character Program Name after edit', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    const oneChar = uniqueName('A');
    await createProgram(page, name, 'Full-stack web development program');

    const dialog = await openEditProgram(page, name);
    await programNameField(dialog).fill(oneChar);
    await saveEditProgram(page);

    await expect(programRow(page, oneChar)).toBeVisible();
  });

  test('TC-010: Program list shows a 255-character Program Name after edit', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    const longName = `MaxLen255Edit-${Date.now()}${'x'.repeat(230)}`.slice(0, 255);
    await createProgram(page, name, 'Full-stack web development program');

    const dialog = await openEditProgram(page, name);
    await programNameField(dialog).fill(longName);
    await saveEditProgram(page);

    await expect(programTitleInRow(programRow(page, longName))).toHaveText(longName);
  });
});
