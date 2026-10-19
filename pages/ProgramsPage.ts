import { type Locator, type Page } from '@playwright/test';
import {
  isProgramCreateResponse,
  parseProgramUuidFromCreateResponse,
} from '../tests/didaxis/programs.api';
import { NewProgramModal } from './NewProgramModal';

export class ProgramsPage {
  readonly heading: Locator;
  readonly programsNav: Locator;
  readonly newProgramButton: Locator;
  readonly duplicateNameError: Locator;
  readonly newProgramModal: NewProgramModal;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Programs', level: 2 });
    this.programsNav = page.getByRole('button', { name: /programs/i });
    this.newProgramButton = page.getByRole('button', { name: '+ New Program' });
    this.duplicateNameError = page.getByText(/already exists|name is taken|must be unique/i);
    this.newProgramModal = new NewProgramModal(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/programs');
  }

  async openNewProgramForm(): Promise<void> {
    await this.newProgramButton.click();
  }

  programRow(name: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.editButton(name),
    });
  }

  programTitle(name: string): Locator {
    return this.programRow(name).getByText(name, { exact: true });
  }

  programNameCell(name: string): Locator {
    return this.programRow(name).getByRole('cell').first();
  }

  editButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Edit ${name}` });
  }

  async createProgram(
    name: string,
    description: string,
    onCreated?: (uuid: string) => void,
  ): Promise<string> {
    await this.openNewProgramForm();
    await this.newProgramModal.fill(name, description);

    const createResponse = this.page.waitForResponse(
      (response) =>
        isProgramCreateResponse(response.url(), response.request().method(), response.status()),
      { timeout: 30_000 },
    );
    await this.newProgramModal.submit();
    const response = await createResponse;

    let uuid: string | undefined;
    try {
      uuid = parseProgramUuidFromCreateResponse(await response.json());
    } catch {
      uuid = undefined;
    }
    if (!uuid) {
      throw new Error(
        `createProgram: could not read program uuid from POST /api/programs response for "${name}"`,
      );
    }
    onCreated?.(uuid);
    await this.newProgramModal.dialog.waitFor({ state: 'hidden', timeout: 15_000 });
    await this.editButton(name).scrollIntoViewIfNeeded({ timeout: 15_000 });
    return uuid;
  }
}
