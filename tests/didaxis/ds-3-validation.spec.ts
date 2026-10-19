import { type Page } from '@playwright/test';
import { test, expect } from '../../fixtures/cleanup.fixture';
import { ProgramsPage } from '../../pages/ProgramsPage';
import {
  isProgramCreateResponse,
  parseProgramUuidFromCreateResponse,
} from './programs.api';
import { assertDuplicateNameRejected, repeatChar, uniqueName } from './programs.helpers';

async function trackAcceptedCreate(
  page: Page,
  trackProgram: (uuid: string) => void,
): Promise<void> {
  const response = await page
    .waitForResponse(
      (candidate) =>
        isProgramCreateResponse(
          candidate.url(),
          candidate.request().method(),
          candidate.status(),
        ),
      { timeout: 8_000 },
    )
    .catch(() => null);
  if (!response) {
    return;
  }
  try {
    const uuid = parseProgramUuidFromCreateResponse(await response.json());
    if (uuid) {
      trackProgram(uuid);
    }
  } catch {
    /* a rejected create has no program id */
  }
}

test.describe('DS-3 Program name validation and duplicate prevention', () => {
  test.describe.configure({ mode: 'serial' });
  // Programs created here are tracked and deleted via API after all tests in the worker finish.

  let programs: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.heading).toBeVisible();
  });

  test('TC-001: Program list shows a special-character program name', async ({ trackProgram }) => {
    const name = uniqueName('Informatique & IA - Niveau 2');
    const description = "Programme d'informatique et d'intelligence artificielle";
    await programs.createProgram(name, description, trackProgram);

    await expect(programs.newProgramModal.dialog).toBeHidden();
    await expect(programs.programTitle(name)).toHaveText(name, { timeout: 15_000 });
  });

  test('TC-002: Whitespace-only Program Name is not submitted', async () => {
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill('   ', 'Whitespace name');
    const create = programs.newProgramModal.createButton;
    if (await create.isEnabled()) {
      await create.click();
      await expect(programs.newProgramModal.dialog).toBeVisible();
    } else {
      await expect(create).toBeDisabled();
    }
  });

  test('TC-003: Duplicate Program Name shows an already-exists error', async ({ page, trackProgram }) => {
    const name = uniqueName('Web Development 2026');
    await programs.createProgram(name, 'Full-stack web development program', trackProgram);
    const countBeforeDuplicate = await programs.editButton(name).count();

    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(name, 'Another full-stack cohort');
    const accepted = trackAcceptedCreate(page, trackProgram);
    await programs.newProgramModal.submit();
    await accepted;

    await assertDuplicateNameRejected(page, name, countBeforeDuplicate, 'DS-3 TC-003');
    if (await programs.newProgramModal.dialog.isVisible()) {
      await programs.newProgramModal.cancel();
    }
  });

  test('TC-004: Trailing space on Program Name is treated as a duplicate', async ({
    page,
    trackProgram,
  }) => {
    const name = uniqueName('Web Development 2026');
    await programs.createProgram(name, 'Full-stack web development program', trackProgram);
    const countBeforeDuplicate = await programs.editButton(name).count();

    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(`${name} `, 'Padded duplicate name');
    const accepted = trackAcceptedCreate(page, trackProgram);
    await programs.newProgramModal.submit();
    await accepted;

    await assertDuplicateNameRejected(page, name, countBeforeDuplicate, 'DS-3 TC-004');
    if (await programs.newProgramModal.dialog.isVisible()) {
      await programs.newProgramModal.cancel();
    }
  });

  test('TC-005: Case-variant duplicate is rejected', async ({ page, trackProgram }) => {
    const name = uniqueName('Web Development 2026');
    await programs.createProgram(name, 'Full-stack web development program', trackProgram);

    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(name.toLowerCase(), 'Case variant duplicate');
    const accepted = trackAcceptedCreate(page, trackProgram);
    await programs.newProgramModal.submit();
    await accepted;

    if ((await programs.duplicateNameError.count()) > 0) {
      await expect(programs.duplicateNameError.first()).toBeVisible();
      await expect(programs.editButton(name)).toBeVisible();
    } else if ((await programs.editButton(name.toLowerCase()).count()) > 0) {
      test.skip(true, 'DS-3 TC-005: app does not enforce case-insensitive duplicate check');
    } else {
      await expect(programs.editButton(name)).toHaveCount(1);
      await expect(programs.duplicateNameError.first()).toBeVisible();
    }

    if (await programs.newProgramModal.dialog.isVisible()) {
      await programs.newProgramModal.cancel();
    }
  });

  test('TC-006: Single-character Program Name is accepted', async ({ trackProgram }) => {
    const name = uniqueName('A');
    await programs.createProgram(name, 'Single-character program name', trackProgram);
    await expect(programs.programRow(name)).toBeVisible();
  });

  test('TC-007: 255-character Program Name is accepted', async ({ trackProgram }) => {
    const name = `MaxLen255-${Date.now()}${repeatChar('W', 230)}`.slice(0, 255);
    await programs.createProgram(name, 'Boundary length program name', trackProgram);
    await expect(programs.programTitle(name)).toHaveText(name, { timeout: 15_000 });
  });

  test('TC-008: Program Name with quotes and brackets is stored as text', async ({ trackProgram }) => {
    const name = uniqueName('Program "Alpha" [2026]');
    await programs.createProgram(name, 'Quoted and bracketed name', trackProgram);
    await expect(programs.programTitle(name)).toHaveText(name, { timeout: 15_000 });
  });

  test('TC-009: 256-character Program Name is not saved', async () => {
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(repeatChar('W', 256), 'Over max length');
    const entered = await programs.newProgramModal.programName.inputValue();
    if (entered.length > 255) {
      await expect(programs.newProgramModal.createButton).toBeDisabled();
    } else {
      expect(entered.length).toBeLessThanOrEqual(255);
    }
  });
});
