import { test, expect } from '../fixtures/cleanup.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import {
  assertDuplicateNameRejected,
  repeatChar,
  uniqueName,
} from './didaxis/programs.helpers';

test.describe('Create a program', () => {
  test.describe.configure({ mode: 'serial' });

  let programs: ProgramsPage;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(90_000);
    programs = new ProgramsPage(page);
    await programs.goto();
    await expect(programs.heading).toBeVisible();
  });

  test('creation form shows Program Name and Description', async () => {
    await programs.openNewProgramForm();
    const modal = programs.newProgramModal;

    await expect(modal.programName).toBeVisible();
    await expect(modal.description).toBeVisible();
    await expect(modal.createButton).toBeVisible();
    await expect(modal.cancelButton).toBeVisible();
  });

  test('program list shows the new program after create', async ({ trackProgram }) => {
    const name = uniqueName('Web Development 2026');
    const description = 'Full-stack web development program';
    await programs.createProgram(name, description, trackProgram);

    await expect(programs.newProgramModal.dialog).toBeHidden();
    await expect(programs.programTitle(name)).toHaveText(name);
    await expect(programs.programRow(name)).toBeVisible();
  });

  test('Create stays disabled while Program Name is empty', async () => {
    await programs.openNewProgramForm();
    await programs.newProgramModal.programName.fill('');
    await expect(programs.newProgramModal.createButton).toBeDisabled();
  });

  test('program list stays unchanged when the form is closed without Create', async () => {
    const name = uniqueName('Web Development 2026');
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(name, 'Full-stack web development program');
    await programs.newProgramModal.cancel();

    await expect(programs.newProgramModal.dialog).toBeHidden();
    await expect(programs.editButton(name)).toHaveCount(0);
  });

  test('Create stays disabled when only Description is filled', async () => {
    await programs.openNewProgramForm();
    await programs.newProgramModal.fill('', 'Full-stack web development program');
    await expect(programs.newProgramModal.createButton).toBeDisabled();
  });

  test('duplicate Program Name is not added on create', async ({ page, trackProgram }) => {
    const name = uniqueName('Web Development 2026');
    await programs.createProgram(name, 'Full-stack web development program', trackProgram);
    const countBeforeDuplicate = await programs.editButton(name).count();

    await programs.openNewProgramForm();
    await programs.newProgramModal.fill(name, 'Another full-stack cohort');
    await programs.newProgramModal.submit();

    await assertDuplicateNameRejected(page, name, countBeforeDuplicate, 'programs duplicate name');
  });

  test('program list shows a one-character Program Name', async ({ trackProgram }) => {
    const name = uniqueName('A');
    await programs.createProgram(name, 'Single-character program name', trackProgram);
    await expect(programs.programRow(name)).toBeVisible();
  });

  test('program list shows a 255-character Program Name in full', async ({ trackProgram }) => {
    const name = `MaxLen255Create-${Date.now()}${repeatChar('W', 220)}`.slice(0, 255);
    await programs.createProgram(name, 'Boundary length program name', trackProgram);
    await expect(programs.programTitle(name)).toHaveText(name);
  });

  test('program list shows a special-character program name exactly', async ({ trackProgram }) => {
    const name = uniqueName('Informatique & IA - Niveau 2');
    const description = "Programme d'informatique et d'intelligence artificielle";
    await programs.createProgram(name, description, trackProgram);
    await expect(programs.programTitle(name)).toHaveText(name);
  });

  test('program list shows the program when Description is empty', async ({ trackProgram }) => {
    const name = uniqueName('Data Science 2026');
    await programs.createProgram(name, '', trackProgram);
    await expect(programs.programTitle(name)).toHaveText(name);
    await expect(programs.programNameCell(name)).toHaveText(name);
  });

  test('whitespace-only Program Name does not create a program', async () => {
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
});
