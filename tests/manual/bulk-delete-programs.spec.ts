import { test, expect } from '@playwright/test';
import {
  captureBearerTokenFromPage,
  deleteProgramByUuid,
  listPrograms,
} from '../didaxis/programs.api';
import { loginAsAdmin } from '../didaxis/programs.helpers';

/** uniqueName() appends Date.now() — a 13-digit millisecond timestamp. */
const testProgramNamePattern = /\d{13}/;

function requestedDeleteCount(available: number): number {
  const raw = process.env.DIDAXIS_DELETE_COUNT?.trim().toLowerCase();
  if (!raw) {
    throw new Error(
      'Set DIDAXIS_DELETE_COUNT to a number (10, 100, 300, 1000) or "all". Example: $env:DIDAXIS_DELETE_COUNT="10"; npm run delete-programs',
    );
  }

  if (raw === 'all') {
    if (process.env.DIDAXIS_DELETE_CONFIRM_ALL !== 'I_UNDERSTAND') {
      throw new Error(
        'Refusing to delete ALL matching test programs. Re-run with DIDAXIS_DELETE_COUNT=all and DIDAXIS_DELETE_CONFIRM_ALL=I_UNDERSTAND if you really mean it.',
      );
    }
    return available;
  }

  const count = Number(raw);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`DIDAXIS_DELETE_COUNT must be a positive integer or "all", got "${raw}"`);
  }
  return Math.min(count, available);
}

test.describe('Manual Didaxis bulk program delete', () => {
  test.describe.configure({ mode: 'serial' });

  test('GET /api/programs, collect ids, delete the requested count', async ({ page }) => {
    test.setTimeout(10 * 60_000);

    await loginAsAdmin(page);
    const token = await captureBearerTokenFromPage(page, 60_000, { ignoreEnv: true });

    const programs = await listPrograms(token);
    const testPrograms = programs.filter((program) =>
      testProgramNamePattern.test(program.name ?? ''),
    );

    console.log(`[bulk-delete] GET /api/programs returned ${programs.length} program(s)`);
    console.log(
      `[bulk-delete] ${testPrograms.length} matched /\\d{13}/ (Playwright uniqueName timestamps)`,
    );

    const toDelete = requestedDeleteCount(testPrograms.length);
    const batch = testPrograms.slice(0, toDelete);
    const dryRun = process.env.DIDAXIS_DELETE_DRY_RUN === '1';

    console.log(
      `[bulk-delete] ${dryRun ? 'Dry-run would delete' : 'Will delete'} first ${batch.length} of ${testPrograms.length} matching program(s)`,
    );
    for (const program of batch) {
      console.log(`[bulk-delete]   ${program.name ?? '(no name)'} (${program.id})`);
    }

    if (dryRun) {
      console.log(`[bulk-delete] Dry-run: deleted 0/${batch.length} (no API DELETE sent)`);
      return;
    }

    let deleted = 0;
    for (const program of batch) {
      const { ok, status } = await deleteProgramByUuid(program.id, token);
      if (ok) {
        deleted += 1;
      } else {
        console.warn(`[bulk-delete] Failed to delete ${program.id} (HTTP ${status})`);
      }
    }

    console.log(`[bulk-delete] Deleted ${deleted}/${batch.length} program(s)`);
    expect(deleted).toBe(batch.length);
  });
});
