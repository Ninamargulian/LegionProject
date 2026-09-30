import { test, expect } from '@playwright/test';
import {
  createProgram,
  deleteProgram,
  gotoProgramsPage,
  loginAsAdmin,
  programDescriptionInRow,
  programRow,
  programTitleInRow,
  repeatChar,
  uniqueName,
} from './programs.helpers';

test.describe('DS-5 Program list filtering and display', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    await loginAsAdmin(page);
  });

  test('TC-001: Programs page shows name and description for each program', async ({ page }) => {
    const web = uniqueName('Web Development 2026');
    const info = uniqueName('Informatique & IA - Niveau 2');
    await createProgram(page, web, 'Full-stack web development program');
    await createProgram(page, info, "Programme d'informatique et d'intelligence artificielle");
    await gotoProgramsPage(page);

    await expect(programTitleInRow(programRow(page, web))).toHaveText(web);
    await expect(programDescriptionInRow(programRow(page, web))).toHaveText(
      'Full-stack web development program',
    );
    await expect(programTitleInRow(programRow(page, info))).toHaveText(info);
    await expect(programDescriptionInRow(programRow(page, info))).toHaveText(
      "Programme d'informatique et d'intelligence artificielle",
    );
  });

  test('TC-002: Empty Programs page shows empty-state guidance', async ({ page }) => {
    test.skip(true, 'Requires an isolated account or API to remove all programs before assertion.');
  });

  test('TC-003: Removed program is absent from the list', async ({ page }) => {
    const keep = uniqueName('Web Development 2026');
    const removed = uniqueName('Test Program');
    await createProgram(page, keep, 'Full-stack web development program');
    await createProgram(page, removed, 'Temporary');
    await deleteProgram(page, removed);
    await gotoProgramsPage(page);

    await expect(programRow(page, keep)).toBeVisible();
    await expect(programRow(page, removed)).toHaveCount(0);
  });

  test('TC-004: Programs page shows list when one program exists', async ({ page }) => {
    const name = uniqueName('Web Development 2026');
    await createProgram(page, name, 'Full-stack web development program');
    await gotoProgramsPage(page);

    await expect(programRow(page, name)).toBeVisible();
    await expect(page.getByText(/no programs|haven't created|have not created/i)).toHaveCount(0);
  });

  test('TC-005: Special-character program name is displayed exactly', async ({ page }) => {
    const name = uniqueName('Informatique & IA - Niveau 2');
    const description = "Programme d'informatique et d'intelligence artificielle";
    await createProgram(page, name, description);
    await gotoProgramsPage(page);

    await expect(programTitleInRow(programRow(page, name))).toHaveText(name);
    await expect(programDescriptionInRow(programRow(page, name))).toHaveText(description);
  });

  test('TC-006: Program with empty Description still shows Program Name', async ({ page }) => {
    const name = uniqueName('Data Science 2026');
    await createProgram(page, name, '');
    await gotoProgramsPage(page);

    await expect(programTitleInRow(programRow(page, name))).toHaveText(name);
  });

  test('TC-007: 255-character Program Name is displayed in full', async ({ page }) => {
    const name = `MaxLen255List-${Date.now()}${repeatChar('W', 220)}`.slice(0, 255);
    const description = 'Boundary length program name';
    await createProgram(page, name, description);
    await gotoProgramsPage(page);

    await expect(programTitleInRow(programRow(page, name))).toHaveText(name);
    await expect(programDescriptionInRow(programRow(page, name))).toHaveText(description);
  });

  test('TC-008: 500-character Description is displayed in full', async ({ page }) => {
    const name = uniqueName('Cybersecurity 2026');
    const description = repeatChar('D', 500);
    await createProgram(page, name, description);
    await gotoProgramsPage(page);

    await expect(programTitleInRow(programRow(page, name))).toHaveText(name);
    await expect(programDescriptionInRow(programRow(page, name))).toHaveText(description);
  });

  test('TC-009: Similar program names are both listed', async ({ page }) => {
    const base = uniqueName('Web Development 2026');
    const updated = uniqueName('Web Development 2026 - Updated');
    await createProgram(page, base, 'Full-stack web development program');
    await createProgram(page, updated, 'Renamed full-stack web development program');
    await gotoProgramsPage(page);

    await expect(programTitleInRow(programRow(page, base))).toHaveText(base);
    await expect(programDescriptionInRow(programRow(page, base))).toHaveText(
      'Full-stack web development program',
    );
    await expect(programTitleInRow(programRow(page, updated))).toHaveText(updated);
    await expect(programDescriptionInRow(programRow(page, updated))).toHaveText(
      'Renamed full-stack web development program',
    );
  });
});
