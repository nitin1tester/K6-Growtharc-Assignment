/**
 * src/auth/tokenManager.ts
 *
 * Encapsulates the full auth lifecycle: login once per VU with that VU's
 * unique user, cache the token, refresh proactively (before expiry) and
 * reactively (on a 401 from a downstream call).
 *
 * State here is module-scoped, which in k6 means "one instance per VU" —
 * no cross-VU sharing, no locking needed.
 */

import http, { RefinedResponse, ResponseType } from 'k6/http';
import { check } from 'k6';
import { config } from '../../config/index.ts';
import { loginDuration, errorRate } from '../utils/metrics.ts';
import type { User, LoginResponseBody } from '../types/index.ts';

let cachedUser: User | null = null;
let token: string | null = null;
let tokenExpiresAt = 0;

/**
 * Deterministically assigns exactly one user to this VU for its entire
 * lifetime. __VU is unique among active VUs, so this guarantees no two
 * VUs are ever issued the same user record.
 */
export function assignUser(users: User[]): User {
  if (cachedUser) return cachedUser;
  const idx = (__VU - 1) % users.length;
  cachedUser = users[idx];
  return cachedUser;
}

function isTokenValid(): boolean {
  return token !== null && Date.now() < tokenExpiresAt;
}

function login(users: User[]): boolean {
  const user = assignUser(users);

  const res: RefinedResponse<ResponseType | undefined> = http.post(
    `${config.baseUrl}/api/login`,
    JSON.stringify({ username: user.username, password: user.password }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { endpoint: 'login' },
    }
  );
  loginDuration.add(res.timings.duration);

  const ok = check(res, {
    'login status is 200': (r) => r.status === 200,
    'login response has token': (r) => {
      try {
        return !!(r.json() as unknown as LoginResponseBody)?.token;
      } catch (e) {
        return false;
      }
    },
  });
  errorRate.add(!ok);

  if (ok) {
    const body = res.json() as unknown as LoginResponseBody;
    token = body.token;
    let ttlMs = config.tokenTtlSeconds * 1000;
    if (body.expiresIn) ttlMs = body.expiresIn * 1000;
    // Refresh a little early (90% of TTL) rather than racing the exact
    // expiry boundary.
    tokenExpiresAt = Date.now() + ttlMs * 0.9;
  } else {
    token = null;
    tokenExpiresAt = 0;
  }

  return ok;
}

/**
 * Returns a valid bearer token for the current VU, logging in or
 * refreshing as needed. Returns null if login failed (caller should
 * skip/short-circuit the iteration).
 */
export function getValidToken(users: User[]): string | null {
  if (isTokenValid()) return token;
  return login(users) ? token : null;
}

/** Call after a downstream 401 to force the next getValidToken() to re-login. */
export function invalidateToken(): void {
  token = null;
  tokenExpiresAt = 0;
}
