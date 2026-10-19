import { type Locator, type Page } from '@playwright/test';
import { requireEnv } from '../tests/didaxis/programs.helpers';

export class LoginPage {
  readonly email: Locator;
  readonly password: Locator;
  readonly signInButton: Locator;

  constructor(private readonly page: Page) {
    this.email = page.getByRole('textbox', { name: 'Email' });
    this.password = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
  }

  async goto(): Promise<void> {
    const baseUrl = requireEnv('DIDAXIS_URL').replace(/\/$/, '');
    await this.page.goto(`${baseUrl}/login`);
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.signInButton.click();
  }
}
