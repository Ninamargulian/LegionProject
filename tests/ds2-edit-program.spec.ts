/**
 * DS-2 — Edit existing program details (test-cases/DS-2/DS-2_output.md).
 * Credentials: DIDAXIS_* via dotenv in playwright.config.ts.
 * Locators: MCP on test.didaxis.studio (Edit Program dialog, Edit/Delete row buttons).
 *
 * Known product failures on test.didaxis.studio (tests assert intended behavior; do not skip):
 * TC-002/TC-012 — stale or duplicate rows after rename (DS-9, DS-99, DS-108)
 * TC-006/TC-011 — duplicate name validation missing (DS-131, DS-38, DS-129, …)
 * TC-013 — double Save may emit duplicate PATCH (DS-130, DS-41, DS-43)
 */
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
  duplicateNameErrorVisible,
  expectDuplicateNameError,
  newProgramButton,
  repeatChar,
} from './didaxis/programs.helpers';

test.describe('DS-2 Edit existing program details', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120_000);
    await loginAsAdmin(page);
  });

  test('TC-001: Edit form shows the current Program Name and Description', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';
    await createProgram(page, name, description);

    await page.getByRole('button', { name: `Edit ${name}` }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit Program' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('textbox', { name: 'Program Name' })).toHaveValue(name);
    await expect(dialog.getByRole('textbox', { name: 'Description' })).toHaveValue(description);
  });

  test('TC-002: Program list shows updated name immediately after Save (Jira rename AC)', async ({
    page,
  }) => {
    const name = uniqueName('Web Development 2026');
    const updated = `${name} - Updated`;
    await createProgram(page, name, 'Full-stack web development program');

    const dialog = await openEditProgram(page, name);
    await programNameField(dialog).clear();
    await programNameField(dialog).fill(updated);
    await saveEditProgram(page, updated);

    await expect(page.getByRole('dialog', { name: 'Edit Program' })).toBeHidden();
    await expect(page.getByRole('button', { name: `Edit ${updated}` })).toBeVisible();
    await expect(page.getByRole('button', { name: `Edit ${name}` })).toHaveCount(0);
    await expect(programTitleInRow(programRow(page, updated))).toHaveText(updated);
  });

  test('TC-003: Program Name stays unchanged when only Description changes', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    const newDescription = 'Evening cohort for full-stack web development';
    await createProgram(page, name, 'Full-stack web development program');

    const dialog = await openEditProgram(page, name);
    await programDescriptionField(dialog).fill(newDescription);
    await saveEditProgram(page, name);

    await expect(editProgramDialog(page)).toBeHidden();
    const row = programRow(page, name);
    await expect(programTitleInRow(row)).toHaveText(name);
    await expect(programDescriptionInRow(row)).toHaveText(newDescription);
  });

  test('TC-004: Program details stay unchanged when the edit form is closed without Save', async ({
    page,
  }) => {
    const name = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';
    await createProgram(page, name, description);

    const dialog = await openEditProgram(page, name);
    await programNameField(dialog).fill(`${name} - Updated`);
    await programDescriptionField(dialog).fill('Evening cohort for full-stack web development');
    await cancelDialog(page);
    await expect(editProgramDialog(page)).toBeHidden();

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
    await expect
      .poll(
        async () =>
          (await duplicateNameErrorVisible(page)) || (await editProgramDialog(page).isHidden()),
        { timeout: 10_000 },
      )
      .toBeTruthy();

    if (await duplicateNameErrorVisible(page)) {
      await expectDuplicateNameError(page);
      await expect(editProgramButton(page, existing)).toBeVisible();
      await expect(editProgramButton(page, other)).toBeVisible();
      return;
    }

    expect(
      await editProgramButton(page, other).count(),
      'DS-131/DS-38/DS-147: edited program must keep its original name when duplicate is rejected',
    ).toBeGreaterThan(0);
    expect(
      await editProgramButton(page, existing).count(),
      'DS-131/DS-38/DS-147: duplicate rename must not create a second row with the same name',
    ).toBe(1);
    await expectDuplicateNameError(page);
  });

  test('TC-007: Description can be cleared while Program Name stays the same', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    await createProgram(page, name, 'Full-stack web development program');

    const dialog = await openEditProgram(page, name);
    await programDescriptionField(dialog).fill('');
    await saveEditProgram(page, name);

    const row = programRow(page, name);
    await expect(programTitleInRow(row)).toHaveText(name);
    await expect(row.locator('td').first().locator('p')).toHaveCount(1);
  });

  test('TC-008: Program list shows the special-character name entered on edit', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    const special = uniqueName('Informatique & IA - Niveau 2');
    await createProgram(page, name, 'Full-stack web development program');

    const dialog = await openEditProgram(page, name);
    await programNameField(dialog).fill(special);
    await saveEditProgram(page, special);

    await expect(editProgramDialog(page)).toBeHidden();
    await expect(programRow(page, special)).toBeVisible();
    await expect(programDescriptionInRow(programRow(page, special))).toHaveText(
      'Full-stack web development program',
    );
  });

  test('TC-009: Program list shows a one-character Program Name after edit', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    // Plan uses "A"; shared tenant uses a single rotating letter to avoid name collisions.
    const oneChar = String.fromCharCode(65 + (Date.now() % 26));
    const description = 'Full-stack web development program';
    await createProgram(page, name, description);

    const dialog = await openEditProgram(page, name);
    await programNameField(dialog).fill(oneChar);
    await saveEditProgram(page, oneChar);

    await expect(editProgramDialog(page)).toBeHidden();
    const row = programRow(page, oneChar);
    await expect(programTitleInRow(row)).toHaveText(oneChar);
    await expect(programDescriptionInRow(row)).toHaveText(description);
  });

  test('TC-010: Program list shows a 255-character Program Name after edit', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';
    const suffix = String(Date.now()).slice(-4);
    const longName = (repeatChar('W', 255 - suffix.length) + suffix).slice(0, 255);
    expect(longName).toHaveLength(255);
    await createProgram(page, name, description);

    const dialog = await openEditProgram(page, name);
    await programNameField(dialog).fill(`${longName}X`);
    expect((await programNameField(dialog).inputValue()).length).toBeLessThanOrEqual(255);
    await programNameField(dialog).fill(longName);
    await saveEditProgram(page, longName);

    await expect(editProgramDialog(page)).toBeHidden();
    const row = programRow(page, longName);
    await expect(programTitleInRow(row)).toHaveText(longName);
    await expect(programDescriptionInRow(row)).toHaveText(description);
  });

  test('TC-011: Case-only duplicate name on edit is rejected', async ({ page }) => {
    const existing = uniqueName('Web Development 2026');
    const other = uniqueName('Data Science 2026');
    await createProgram(page, existing, 'Full-stack web development program');
    await createProgram(page, other, 'Applied data science program');

    const dialog = await openEditProgram(page, other);
    await programNameField(dialog).fill(existing.toLowerCase());
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect
      .poll(
        async () =>
          (await duplicateNameErrorVisible(page)) || (await editProgramDialog(page).isHidden()),
        { timeout: 10_000 },
      )
      .toBeTruthy();

    if (await duplicateNameErrorVisible(page)) {
      await expectDuplicateNameError(page);
      await expect(editProgramButton(page, other)).toBeVisible();
      return;
    }

    await expect(editProgramButton(page, other)).toBeVisible();
    expect(
      await editProgramButton(page, existing.toLowerCase()).count(),
      'DS-129/DS-148/DS-160: case-only duplicate name on edit must be rejected',
    ).toBe(0);
    await expectDuplicateNameError(page);
  });

  test('TC-012: List reflects the new name without manual refresh', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    const updated = `${name} - Updated`;
    await createProgram(page, name, 'Full-stack web development program');

    const dialog = await openEditProgram(page, name);
    await programNameField(dialog).clear();
    await programNameField(dialog).fill(updated);
    await saveEditProgram(page, updated);

    expect(page.url()).toMatch(/\/programs/);
    await expect(editProgramDialog(page)).toBeHidden();
    await expect(page.getByRole('button', { name: `Edit ${updated}` })).toBeVisible();
    await expect(page.getByRole('button', { name: `Edit ${name}` })).toHaveCount(0);
    await expect(programTitleInRow(programRow(page, updated))).toHaveText(updated);
  });

  test('TC-013: Double-click Save does not submit duplicate updates', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    const updated = `${name} - Updated`;
    await createProgram(page, name, 'Full-stack web development program');

    const dialog = await openEditProgram(page, name);
    await programNameField(dialog).fill(updated);
    const save = dialog.getByRole('button', { name: 'Save' });

    let patchCount = 0;
    const onRequest = (req: { method: () => string; url: () => string }) => {
      if (req.method() === 'PATCH' && /program/i.test(req.url())) {
        patchCount += 1;
      }
    };
    page.on('request', onRequest);
    try {
      await save.dblclick();
      await expect(editProgramDialog(page)).toBeHidden({ timeout: 15_000 });
      await page.waitForTimeout(1_000);
      expect(
        patchCount,
        'DS-130/DS-41/DS-43: double-click Save should not send duplicate PATCH requests',
      ).toBeLessThanOrEqual(1);
      await expect(editProgramButton(page, updated)).toBeVisible();
    } finally {
      page.off('request', onRequest);
    }
  });

  test('TC-014: Edit remains usable when the program list is large', async ({ page }) => {
    await expect(newProgramButton(page)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Programs', level: 2 })).toBeVisible();

    const name = uniqueName('Web Development 2026');
    await createProgram(page, name, 'Full-stack web development program');

    const edit = editProgramButton(page, name);
    await edit.scrollIntoViewIfNeeded();
    await expect(edit).toBeVisible({ timeout: 60_000 });
    await edit.click();
    await expect(editProgramDialog(page)).toBeVisible();
  });
});
