import { type Locator, type Page } from '@playwright/test';

export class CalendarPage {
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Calendar', level: 2 });
  }

  async goto(): Promise<void> {
    await this.page.goto('/calendar');
  }
}
