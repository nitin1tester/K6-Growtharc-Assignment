/**
 * tests/auth-load-test.ts
 *
 * Entry point only — executor config lives in scenarios/, auth logic lives
 * in src/auth/, metrics live in src/utils/metrics.ts. This file just wires
 * them together and defines the iteration body.
 *
 * Run:
 *   k6 run tests/auth-load-test.ts -e ENV=local
 *   k6 run tests/auth-load-test.ts -e ENV=local -e BASE_URL=http://localhost:4000
 */

import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import type { Options } from 'k6/options';
import { authFlowScenario, authFlowThresholds } from '../scenarios/auth-flow.scenario.ts';
import { authedRequest } from '../src/utils/httpClient.ts';
import { errorRate } from '../src/utils/metrics.ts';
import type { User } from '../src/types/index.ts';

// Parsed once, shared read-only across all VUs.
const users = new SharedArray<User>('users', function () {
  return JSON.parse(open('../data/users.json'));
});

export const options: Options = {
  scenarios: { auth_flow_load: authFlowScenario },
  thresholds: authFlowThresholds,
};

export default function (): void {
  const res = authedRequest(users, 'GET', '/api/profile');

  const ok = check(res, {
    'status is 200': (r) => r !== null && r.status === 200,
    'response time < 500ms': (r) => r !== null && r.timings.duration < 500,
    'body is non-empty': (r) => r !== null && typeof r.body === 'string' && r.body.length > 0,
  });
  errorRate.add(!ok);

  sleep(1);
}
