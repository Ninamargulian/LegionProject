import { test, expect } from '../../fixtures/cleanup.fixture';
import { ProgramsPage } from '../../pages/ProgramsPage';
import { uniqueName } from './programs.helpers';

const temporaryDescription = 'Temporary program used for deletion checks';
const staysDescription = 'Should stay';
const specialDescription = "Programme d'informatique et d'intelligence artificielle";

function deletionConfirmMessage(name: string): string {
  return `Delete program "${name}"? All its semesters and courses will be removed. This cannot be undone.`;
}

test.describe('DS-4 Delete program with confirmation', () => {
  test.describe.configure({ mode: 'serial' });
  // Programs created here are tracked and deleted via API after all tests in the worker finish.

  let programs: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.heading).toBeVisible();
  });

  async function expectProgramPresent(name: string, description: string): Promise<void> {
    await expect(programs.programRow(name)).toBeVisible();
    await expect(programs.programTitle(name)).toHaveText(name);
    await expect(programs.programDescription(name, description)).toHaveText(description);
  }

  async function expectProgramAbsent(name: string, description: string): Promise<void> {
    await expect(programs.deleteButton(name)).toHaveCount(0, { timeout: 15_000 });
    await expect(programs.editButton(name, { exact: true })).toHaveCount(0);
    await expect(programs.programRow(name)).toHaveCount(0);
    await expect(programs.programDescription(name, description)).toHaveCount(0);
  }

  test('TC-001: Confirming deletion removes Test Program from the list', async ({ trackProgram }) => {
    const name = uniqueName('Test Program');
    await programs.createProgram(name, temporaryDescription, trackProgram);

    const message = await programs.confirmDelete(name);

    expect(message).toBe(deletionConfirmMessage(name));
    await expectProgramAbsent(name, temporaryDescription);
  });

  test('TC-002: Cancelling the confirmation keeps Test Program in the list', async ({
    trackProgram,
  }) => {
    const name = uniqueName('Test Program');
    await programs.createProgram(name, temporaryDescription, trackProgram);

    const message = await programs.cancelDelete(name);

    expect(message).toBe(deletionConfirmMessage(name));
    await expectProgramPresent(name, temporaryDescription);
  });

  test('TC-003: Deleting Test Program does not remove Cloud Engineering 2026', async ({
    trackProgram,
  }) => {
    const name = uniqueName('Test Program');
    const sibling = uniqueName('Cloud Engineering 2026');
    await programs.createProgram(name, temporaryDescription, trackProgram);
    await programs.createProgram(sibling, staysDescription, trackProgram);

    const message = await programs.confirmDelete(name);

    expect(message).toBe(deletionConfirmMessage(name));
    expect(message).toContain(`"${name}"`);
    expect(message).not.toContain('Cloud Engineering 2026');
    expect(message).not.toContain(sibling);
    await expectProgramAbsent(name, temporaryDescription);
    await expectProgramPresent(sibling, staysDescription);
  });

  test('TC-004: Cancelling deletion of Test Program leaves Cloud Engineering 2026 unchanged', async ({
    trackProgram,
  }) => {
    const name = uniqueName('Test Program');
    const sibling = uniqueName('Cloud Engineering 2026');
    await programs.createProgram(name, temporaryDescription, trackProgram);
    await programs.createProgram(sibling, staysDescription, trackProgram);

    const message = await programs.cancelDelete(name);

    expect(message).toBe(deletionConfirmMessage(name));
    await expectProgramPresent(name, temporaryDescription);
    await expectProgramPresent(sibling, staysDescription);
  });

  test('TC-005: Special-character program name is quoted in the confirmation and removed on confirm', async ({
    trackProgram,
  }) => {
    const name = uniqueName('Informatique & IA - Niveau 2');
    await programs.createProgram(name, specialDescription, trackProgram);

    const message = await programs.confirmDelete(name);

    expect(message).toBe(deletionConfirmMessage(name));
    await expectProgramAbsent(name, specialDescription);
  });

  test('TC-006: Deleted Test Program stays absent after the Programs page is reloaded', async ({
    page,
    trackProgram,
  }) => {
    const name = uniqueName('Test Program');
    const sibling = uniqueName('Cloud Engineering 2026');
    await programs.createProgram(name, temporaryDescription, trackProgram);
    await programs.createProgram(sibling, staysDescription, trackProgram);

    const message = await programs.confirmDelete(name);
    expect(message).toBe(deletionConfirmMessage(name));

    await page.reload();
    await expect(programs.heading).toBeVisible();
    // The list can lag after reload. Wait until the sibling row is back before
    // treating a missing delete button as proof the deleted program stayed gone.
    await expect(programs.deleteButton(sibling)).toBeVisible({ timeout: 15_000 });
    await expectProgramPresent(sibling, staysDescription);
    await expectProgramAbsent(name, temporaryDescription);
  });

  test('TC-007: Double-clicking the delete icon opens one confirmation and does not delete on Cancel', async ({
    trackProgram,
  }) => {
    const name = uniqueName('Test Program');
    await programs.createProgram(name, temporaryDescription, trackProgram);

    // One confirm is the requirement. A second identical confirm after dismiss
    // is a product defect (DS-30, DS-109, DS-156, DS-218), not a pass.
    const messages = await programs.doubleClickDeleteAndDismiss(name);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toBe(deletionConfirmMessage(name));
    await expectProgramPresent(name, temporaryDescription);
  });
});
