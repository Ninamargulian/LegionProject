import { test, expect } from '@playwright/test';
import {
  acceptNativeConfirm,
  clickDeleteProgram,
  createProgram,
  deleteProgram,
  dismissNativeConfirm,
  deleteProgramConfirmPattern,
  loginAsAdmin,
  programDescriptionInRow,
  programRow,
  programTitleInRow,
  repeatChar,
  uniqueName,
  dismissDeleteConfirmationKeepingProgram,
  expectProgramsListEmpty,
  programDataRowCount,
} from './programs.helpers';

test.describe('DS-4 Delete program with confirmation', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await loginAsAdmin(page);
  });

  test('TC-001: Program is removed from the list after deletion is confirmed', async ({ page }) => {
    const name = uniqueName('Test Program');
    await createProgram(page, name, 'Temporary program used for deletion');

    const message = await acceptNativeConfirm(page, async () => {
      await clickDeleteProgram(page, name);
    });
    expect(message).toMatch(deleteProgramConfirmPattern);

    await expect(programRow(page, name)).toHaveCount(0);
  });

  test('TC-002: Program remains in the list after Cancel', async ({ page }) => {
    const name = uniqueName('Test Program');
    const description = 'Temporary program used for deletion';
    await createProgram(page, name, description);

    await dismissNativeConfirm(page, async () => {
      await clickDeleteProgram(page, name);
    });

    const row = programRow(page, name);
    await expect(row).toBeVisible();
    await expect(programDescriptionInRow(row)).toHaveText(description);
  });

  test('TC-003: Program remains visible while confirmation dialog is open', async ({ page }) => {
    const name = uniqueName('Test Program');
    await createProgram(page, name, 'Temporary program used for deletion');

    const message = await dismissDeleteConfirmationKeepingProgram(page, name);
    expect(message).toMatch(deleteProgramConfirmPattern);
    await expect(programRow(page, name)).toBeVisible();
  });

  test('TC-004: Other programs remain after targeted deletion', async ({ page }) => {
    const testProgram = uniqueName('Test Program');
    const keepProgram = uniqueName('Web Development 2026');
    await createProgram(page, testProgram, 'Temporary program used for deletion');
    await createProgram(page, keepProgram, 'Full-stack web development program');

    await deleteProgram(page, testProgram);

    const row = programRow(page, keepProgram);
    await expect(row).toBeVisible();
    await expect(programDescriptionInRow(row)).toHaveText('Full-stack web development program');
  });

  test('TC-005: Empty state appears after the only program is deleted', async ({ page }) => {
    const rowsBefore = await programDataRowCount(page);
    if (rowsBefore > 0) {
      test.skip(
        true,
        'DS-4 TC-005: requires an empty program list before create (shared Didaxis tenant has existing programs).',
      );
    }

    const name = uniqueName('Test Program');
    await createProgram(page, name, 'Temporary program used for deletion');
    await deleteProgram(page, name);

    // MCP: empty list shows Programs heading + New Program; no table rows (no empty-state banner copy).
    await expectProgramsListEmpty(page);
  });

  test('TC-006: Special-character program is removed after confirmed deletion', async ({ page }) => {
    const name = uniqueName('Informatique & IA - Niveau 2');
    await createProgram(page, name, "Programme d'informatique et d'intelligence artificielle");
    await deleteProgram(page, name);
    await expect(programRow(page, name)).toHaveCount(0);
  });

  test('TC-007: Long-name program remains after delete is cancelled', async ({ page }) => {
    const name = `MaxLen255Del-${Date.now()}${repeatChar('W', 220)}`.slice(0, 255);
    const description = 'Boundary length program name';
    await createProgram(page, name, description);

    await dismissNativeConfirm(page, async () => {
      await clickDeleteProgram(page, name);
    });

    const row = programRow(page, name);
    await expect(programTitleInRow(row)).toHaveText(name);
    await expect(programDescriptionInRow(row)).toHaveText(description);
  });

  test('TC-008: Confirming deletion once removes only the targeted program', async ({ page }) => {
    const testProgram = uniqueName('Test Program');
    const keepProgram = uniqueName('Web Development 2026');
    await createProgram(page, testProgram, 'Temporary program used for deletion');
    await createProgram(page, keepProgram, 'Full-stack web development program');

    await deleteProgram(page, testProgram);

    await expect(programRow(page, testProgram)).toHaveCount(0);
    await expect(programRow(page, keepProgram)).toBeVisible();
  });
});
