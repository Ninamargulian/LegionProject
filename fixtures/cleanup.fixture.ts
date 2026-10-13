import { test as base, expect } from '@playwright/test';
import {
  apiTokenFromEnv,
  deleteProgramByUuid,
  getProgramStatus,
  resolveDidaxisApiToken,
} from '../tests/didaxis/programs.api';

type CleanupFixtures = {
  trackProgram: (uuid: string) => void;
};

type CleanupWorkerFixtures = {
  programCleanup: {
    track: (uuid: string) => void;
    rememberToken: (token: string) => void;
  };
};

export const test = base.extend<CleanupFixtures, CleanupWorkerFixtures>({
  programCleanup: [
    async ({}, use) => {
      const tracked = new Set<string>();
      let token = apiTokenFromEnv() ?? '';

      await use({
        track: (uuid: string) => {
          if (!uuid?.trim()) {
            throw new Error('trackProgram(uuid): uuid is required');
          }
          tracked.add(uuid.trim());
        },
        rememberToken: (value: string) => {
          if (value.trim()) {
            token = value.trim();
          }
        },
      });

      if (tracked.size === 0) {
        return;
      }

      console.log(
        `[api-cleanup] After all tests: deleting ${tracked.size} tracked program(s)`,
      );

      if (!token) {
        console.warn(
          `[api-cleanup] After all tests: skipped deleting ${tracked.size} program(s) — no API token.`,
        );
        return;
      }

      let deleted = 0;
      for (const uuid of tracked) {
        const { ok, status } = await deleteProgramByUuid(uuid, token);
        if (ok) {
          deleted += 1;
          const after = await getProgramStatus(uuid, token);
          console.log(
            `[api-cleanup] Deleted program ${uuid} (DELETE HTTP ${status}, GET after ${after})`,
          );
        } else {
          console.warn(`[api-cleanup] Failed to delete program ${uuid} (HTTP ${status})`);
        }
      }

      console.log(
        `[api-cleanup] After all tests: cleaned up ${deleted}/${tracked.size} tracked program(s)`,
      );
    },
    { scope: 'worker' },
  ],

  trackProgram: async ({ page, programCleanup }, use) => {
    const rememberFromRequest = (request: { headers: () => { [key: string]: string } }) => {
      const auth = request.headers().authorization ?? request.headers().Authorization;
      if (auth?.startsWith('Bearer ')) {
        programCleanup.rememberToken(auth.slice('Bearer '.length));
      }
    };
    page.on('request', rememberFromRequest);
    try {
      programCleanup.rememberToken(await resolveDidaxisApiToken(page));
    } catch {
      /* live Bearer from page requests is preferred when the .env token is expired */
    }
    await use(programCleanup.track);
    page.off('request', rememberFromRequest);
  },
});

export { expect };
