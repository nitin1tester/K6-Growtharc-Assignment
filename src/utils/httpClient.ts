/**
 * src/utils/httpClient.ts
 *
 * Thin wrapper around http.get/post that injects the current VU's bearer
 * token and transparently retries once if the server rejects it with 401.
 */

import http, { RefinedResponse, ResponseType, Params } from 'k6/http';
import { config } from '../../config/index.ts';
import { getValidToken, invalidateToken } from '../auth/tokenManager.ts';
import { authedReqDuration } from './metrics.ts';
import type { User } from '../types/index.ts';

type HttpMethod = 'GET' | 'POST';
type AuthedResponse = RefinedResponse<ResponseType | undefined> | null;

function withAuthHeaders(
  token: string,
  extraHeaders?: Record<string, string>
): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
}

/**
 * Performs an authenticated GET/POST, retrying once via token refresh if
 * the first attempt is rejected with 401.
 */
export function authedRequest(
  users: User[],
  method: HttpMethod,
  path: string,
  body?: Record<string, unknown>
): AuthedResponse {
  const token = getValidToken(users);
  if (!token) return null;

  const params: Params = { headers: withAuthHeaders(token), tags: { endpoint: path } };
  let res: RefinedResponse<ResponseType | undefined> =
    method === 'GET'
      ? http.get(`${config.baseUrl}${path}`, params)
      : http.post(`${config.baseUrl}${path}`, JSON.stringify(body || {}), params);

  if (res.status === 401) {
    invalidateToken();
    const freshToken = getValidToken(users);
    if (freshToken) {
      params.headers = withAuthHeaders(freshToken);
      res =
        method === 'GET'
          ? http.get(`${config.baseUrl}${path}`, params)
          : http.post(`${config.baseUrl}${path}`, JSON.stringify(body || {}), params);
    }
  }

  authedReqDuration.add(res.timings.duration);
  return res;
}
