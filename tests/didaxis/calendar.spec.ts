import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { CalendarPage } from '../../pages/CalendarPage';

test.describe('Calendar', () => {
  let calendar: CalendarPage;

  test.beforeEach(async ({ page }) => {
    calendar = new CalendarPage(page);
    await calendar.goto();
  });

  test('Calendar heading is visible', { tag: '@regression' }, async ({ page }) => {
    await expect(calendar.heading).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    await expect(results.violations).toEqual([]);
  });
});
