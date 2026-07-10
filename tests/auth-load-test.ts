/**
 *
 * Entry point of execution
 * - executor config lives in scenarios/, 
 * - auth logic lives in src/auth/, 
 * - metrics live in src/utils/metrics.ts. 
 *
 * Run:
 *   k6 run tests/auth-load-test.ts -e ENV=local
 *   k6 run tests/auth-load-test.ts -e ENV=local -e BASE_URL=https://k6-sample-app.onrender.com/
 */

import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import type { Options } from 'k6/options';
import { startsLoadScenario,spikeScenario} from '../scenarios/traffic-workloads-scenario.ts';
import {authFlowThresholds} from '../scenarios/custom-threshholds.ts'
import { authedRequest } from '../src/utils/httpClient.ts';
import { errorRate} from '../src/utils/metrics.ts';
import type { User } from '../src/types/index.ts';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
// Parsed once, shared read-only across all VUs.
const users = new SharedArray<User>('users', function () {
  return JSON.parse(open('../data/users.json'));
});

export const options: Options = {
  scenarios: { auth_flow_load: startsLoadScenario},
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

export function handleSummary(data: unknown) {
  return {
    'reports/auth-summary.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}