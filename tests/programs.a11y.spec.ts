import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ProgramsPage } from '../pages/ProgramsPage';

test.describe('Programs accessibility', () => {
  test(
    'programs page has no detectable accessibility violations',
    { tag: '@regression' },
    async ({ page }) => {
      const programs = new ProgramsPage(page);
      await programs.goto();
      await expect(programs.heading).toBeVisible();

      const results = await new AxeBuilder({ page }).analyze();
      await expect(results.violations).toEqual([]);
    },
  );

  test('new program modal has no detectable accessibility violations', async ({ page }) => {
    const programs = new ProgramsPage(page);
    await programs.goto();
    await programs.openNewProgramForm();
    await expect(programs.newProgramModal.dialog).toBeVisible();

    // axe include() runs in the page and accepts a selector, not a Playwright locator.
    // The modal is already open through ProgramsPage, so the only dialog is New Program.
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
    await expect(results.violations).toEqual([]);
  });
});
