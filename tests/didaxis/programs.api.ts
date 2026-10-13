import type { Page } from '@playwright/test';
import { requireEnv } from './programs.helpers';

export function apiBaseUrl(): string {
  return requireEnv('DIDAXIS_URL').replace(/\/$/, '');
}

export type ProgramListItem = { id: string; name?: string };

function idFromRecord(record: Record<string, unknown>): string | undefined {
  const direct = record.id ?? record.uuid ?? record.programId;
  return typeof direct === 'string' && direct.length > 0 ? direct : undefined;
}

export function parseProgramList(body: unknown): ProgramListItem[] {
  const rows = Array.isArray(body)
    ? body
    : body && typeof body === 'object'
      ? (body as Record<string, unknown>).data ??
        (body as Record<string, unknown>).programs ??
        (body as Record<string, unknown>).items ??
        (body as Record<string, unknown>).results
      : undefined;

  if (!Array.isArray(rows)) {
    return [];
  }

  const programs: ProgramListItem[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') {
      continue;
    }
    const record = row as Record<string, unknown>;
    const id = idFromRecord(record);
    if (!id) {
      continue;
    }
    programs.push({
      id,
      name: typeof record.name === 'string' ? record.name : undefined,
    });
  }
  return programs;
}

export async function listPrograms(token: string): Promise<ProgramListItem[]> {
  const url = `${apiBaseUrl()}/api/programs`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`GET /api/programs failed (HTTP ${response.status})`);
  }
  return parseProgramList(await response.json());
}

export function parseProgramUuidFromCreateResponse(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }
  const record = body as Record<string, unknown>;
  const direct = record.id ?? record.uuid ?? record.programId;
  if (typeof direct === 'string' && direct.length > 0) {
    return direct;
  }
  const nested = record.data ?? record.program;
  if (nested && typeof nested === 'object') {
    const inner = nested as Record<string, unknown>;
    const nestedId = inner.id ?? inner.uuid ?? inner.programId;
    if (typeof nestedId === 'string' && nestedId.length > 0) {
      return nestedId;
    }
  }
  return undefined;
}

export async function captureBearerTokenFromPage(
  page: Page,
  timeoutMs = 30_000,
  options?: { ignoreEnv?: boolean },
): Promise<string> {
  const existing = options?.ignoreEnv ? undefined : apiTokenFromEnv();
  if (existing) {
    return existing;
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      page.off('request', onRequest);
      reject(
        new Error(
          'Could not capture Bearer token from UI. Set DIDAXIS_API_TOKEN in .env (DevTools → Network → authorized API request → Authorization header).',
        ),
      );
    }, timeoutMs);

    const onRequest = (request: { headers: () => { [key: string]: string } }) => {
      const headers = request.headers();
      const auth = headers.authorization ?? headers.Authorization;
      if (auth?.startsWith('Bearer ')) {
        clearTimeout(timer);
        page.off('request', onRequest);
        resolve(auth.slice('Bearer '.length).trim());
      }
    };

    page.on('request', onRequest);
    void page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {
      /* login flow may still emit API calls */
    });
  });
}

export function apiTokenFromEnv(): string | undefined {
  const token =
    process.env.DIDAXIS_API_TOKEN?.trim() || process.env.DIDAXIS_API_KEY?.trim();
  return token || undefined;
}

export async function resolveDidaxisApiToken(page: Page): Promise<string> {
  const fromEnv = apiTokenFromEnv();
  if (fromEnv) {
    return fromEnv;
  }
  return captureBearerTokenFromPage(page);
}

export async function deleteProgramByUuid(
  uuid: string,
  token: string,
  page?: Page,
): Promise<{ ok: boolean; status: number }> {
  const url = `${apiBaseUrl()}/api/programs/${encodeURIComponent(uuid)}`;
  let authToken = token;

  const attempt = async (): Promise<Response> =>
    fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: 'application/json',
      },
    });

  let response = await attempt();
  if ((response.status === 401 || response.status === 403) && page) {
    authToken = await captureBearerTokenFromPage(page);
    response = await attempt();
  }

  const ok = response.status === 200 || response.status === 204 || response.status === 404;
  return { ok, status: response.status };
}

export async function getProgramStatus(
  uuid: string,
  token: string,
): Promise<number> {
  const url = `${apiBaseUrl()}/api/programs/${encodeURIComponent(uuid)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  return response.status;
}

export function isProgramCreateResponse(url: string, method: string, status: number): boolean {
  if (method !== 'POST' || status < 200 || status >= 300) {
    return false;
  }
  try {
    const pathname = new URL(url).pathname.replace(/\/$/, '');
    return pathname === '/api/programs';
  } catch {
    return false;
  }
}
