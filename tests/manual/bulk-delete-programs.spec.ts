import { test, expect } from '@playwright/test';
import {
  captureBearerTokenFromPage,
  deleteProgramByUuid,
  listPrograms,
} from '../didaxis/programs.api';
import { loginAsAdmin } from '../didaxis/programs.helpers';

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
        'Refusing to delete ALL programs. Re-run with DIDAXIS_DELETE_COUNT=all and DIDAXIS_DELETE_CONFIRM_ALL=I_UNDERSTAND if you really mean it.',
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
    const ids: string[] = programs.map((program) => program.id);

    console.log(`[bulk-delete] GET /api/programs returned ${ids.length} id(s)`);
    expect(ids.length).toBeGreaterThan(0);

    const toDelete = requestedDeleteCount(ids.length);
    const batch = ids.slice(0, toDelete);
    console.log(`[bulk-delete] Will delete first ${batch.length} of ${ids.length} program(s)`);
    if (programs[0]?.name) {
      console.log(`[bulk-delete] First in batch: ${programs[0].name} (${batch[0]})`);
    }

    let deleted = 0;
    for (const id of batch) {
      const { ok, status } = await deleteProgramByUuid(id, token);
      if (ok) {
        deleted += 1;
      } else {
        console.warn(`[bulk-delete] Failed to delete ${id} (HTTP ${status})`);
      }
    }

    console.log(`[bulk-delete] Deleted ${deleted}/${batch.length} program(s)`);
    expect(deleted).toBe(batch.length);
  });
});
