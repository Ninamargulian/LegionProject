import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ProgramsPage } from '../../pages/ProgramsPage';
import { uniqueName } from './programs.helpers';

test.describe('Programs page', () => {
  test(
    'a 503 on save leaves the New Program dialog open and does not add the program',
    { tag: '@edge' },
    async ({ page }) => {
      const name = uniqueName('Test Program');
      const description = 'Server unavailable save check';

      await page.route('**/api/programs', async (route) => {
        if (route.request().method() !== 'POST') {
          await route.continue();
          return;
        }
        await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
      });

      const programs = new ProgramsPage(page);
      await programs.goto();
      await expect(programs.heading).toBeVisible();
      await programs.openNewProgramForm();
      await programs.newProgramModal.fill(name, description);

      const saveSettled = page.waitForResponse((response) => {
        if (response.request().method() !== 'POST') {
          return false;
        }
        try {
          const pathname = new URL(response.url()).pathname.replace(/\/$/, '');
          return pathname === '/api/programs';
        } catch {
          return false;
        }
      });
      await programs.newProgramModal.submit();
      await saveSettled;

      // Live Programs page shows no error text when POST /api/programs returns 503.
      // The dialog stays open, and the new name is not in the list.
      await expect(programs.newProgramModal.dialog).toBeVisible();
      await expect(programs.programRow(name)).toHaveCount(0);
      await expect(programs.programTitle(name)).toHaveCount(0);
    },
  );

  test(
    'Programs page passes an accessibility scan',
    { tag: '@regression' },
    async ({ page }) => {
      const programs = new ProgramsPage(page);
      await programs.goto();
      await expect(programs.heading).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      await expect(results.violations).toEqual([]);
    },
  );

  test(
    'Enter on New Program opens the dialog',
    { tag: '@regression' },
    async ({ page }) => {
      const programs = new ProgramsPage(page);
      await programs.goto();
      await expect(programs.heading).toBeVisible();

      for (let step = 0; step < 25; step += 1) {
        if (await programs.newProgramButton.evaluate((el) => el === document.activeElement)) {
          break;
        }
        await page.keyboard.press('Tab');
      }
      await expect(programs.newProgramButton).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(programs.newProgramModal.dialog).toBeVisible();
    },
  );
});
