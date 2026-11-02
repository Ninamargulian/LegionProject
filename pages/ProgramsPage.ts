import { type Dialog, type Locator, type Page } from '@playwright/test';
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
      has: this.editButton(name, { exact: true }),
    });
  }

  programTitle(name: string): Locator {
    return this.programRow(name).getByText(name, { exact: true });
  }

  programDescription(name: string, description: string): Locator {
    return this.programRow(name).getByText(description, { exact: true });
  }

  programNameCell(name: string): Locator {
    return this.programRow(name).getByRole('cell').first();
  }

  editButton(name: string, options?: { exact?: boolean }): Locator {
    return this.page.getByRole('button', {
      name: `Edit ${name}`,
      exact: options?.exact ?? true,
    });
  }

  deleteButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Delete ${name}`, exact: true });
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
    await this.editButton(name, { exact: true }).scrollIntoViewIfNeeded({ timeout: 15_000 });
    return uuid;
  }

  async confirmDelete(name: string): Promise<string> {
    return this.openDeleteDialog(name, (dialog) => dialog.accept());
  }

  async cancelDelete(name: string): Promise<string> {
    return this.openDeleteDialog(name, (dialog) => dialog.dismiss());
  }

  /** Double-clicks Delete, dismisses every native confirm, and returns each message. */
  async doubleClickDeleteAndDismiss(name: string): Promise<string[]> {
    const messages: string[] = [];
    const button = this.deleteButton(name);
    await button.scrollIntoViewIfNeeded({ timeout: 15_000 });

    const onDialog = (dialog: Dialog) => {
      messages.push(dialog.message());
      void dialog.dismiss().catch(() => undefined);
    };

    this.page.on('dialog', onDialog);
    try {
      try {
        await button.dblclick();
      } catch (error) {
        if (messages.length === 0) {
          throw error;
        }
      }
      await this.waitForDialogMessages(name, messages);
    } finally {
      this.page.off('dialog', onDialog);
    }
    return [...messages];
  }

  private async openDeleteDialog(
    name: string,
    settle: (dialog: Dialog) => Promise<void>,
  ): Promise<string> {
    const button = this.deleteButton(name);
    await button.scrollIntoViewIfNeeded({ timeout: 15_000 });

    let onDialog: ((dialog: Dialog) => void) | undefined;
    const messagePromise = new Promise<string>((resolve, reject) => {
      onDialog = (dialog: Dialog) => {
        const message = dialog.message();
        settle(dialog).then(() => resolve(message), reject);
      };
      this.page.once('dialog', onDialog);
    });
    void messagePromise.catch(() => undefined);

    try {
      await button.click();
      return await messagePromise;
    } catch (error) {
      if (onDialog) {
        this.page.off('dialog', onDialog);
      }
      throw error;
    }
  }

  private async waitForDialogMessages(name: string, messages: string[]): Promise<void> {
    const started = Date.now();
    const timeoutMs = 15_000;
    const quietMs = 3_000;
    let seen = 0;
    let changedAt = started;

    while (Date.now() - started < timeoutMs) {
      if (messages.length !== seen) {
        seen = messages.length;
        changedAt = Date.now();
      } else if (seen > 0 && Date.now() - changedAt >= quietMs) {
        return;
      }
      await this.page.waitForTimeout(100);
    }

    if (messages.length === 0) {
      throw new Error(`Delete confirmation did not appear for "${name}"`);
    }
  }
}
