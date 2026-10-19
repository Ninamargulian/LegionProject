import { test as setup } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { ProgramsPage } from '../pages/ProgramsPage';
import { requireEnv } from './didaxis/programs.helpers';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.signIn(requireEnv('DIDAXIS_EMAIL'), requireEnv('DIDAXIS_PASSWORD'));
  await new ProgramsPage(page).programsNav.click();
  await page.waitForURL('**/programs');
  await page.context().storageState({ path: authFile });
});
