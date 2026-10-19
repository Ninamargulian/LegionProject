import { type Locator, type Page } from '@playwright/test';

export class NewProgramModal {
  readonly dialog: Locator;
  readonly programName: Locator;
  readonly description: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'New Program' });
    this.programName = this.dialog.getByRole('textbox', { name: 'Program Name' });
    this.description = this.dialog.getByRole('textbox', { name: 'Description' });
    this.createButton = this.dialog.getByRole('button', { name: 'Create' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
  }

  async fill(name: string, description: string): Promise<void> {
    await this.programName.fill(name);
    await this.description.fill(description);
  }

  async submit(): Promise<void> {
    await this.createButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
    if (await this.dialog.isVisible()) {
      await this.page.keyboard.press('Escape');
    }
  }
}
