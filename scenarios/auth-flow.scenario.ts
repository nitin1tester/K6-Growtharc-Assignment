/**
 * scenarios/auth-flow.scenario.ts
 *
 * Executor: ramping-vus
 * The requirement is concurrency-driven ("10 -> 100 users", "steady",
 * "ramp-down"), and each iteration is stateful (one logged-in session per
 * VU). ramping-vus models exactly that: explicit VU-count stages. A
 * throughput-driven executor like ramping-arrival-rate would let k6 add/
 * remove VUs on its own to hit a target request rate, which breaks the
 * "one VU = one logged-in user" model this test relies on.
 */

import type { Options } from 'k6/options';

export const authFlowScenario: NonNullable<Options['scenarios']>[string] = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '2m', target: 10 }, // ramp-up: 0 -> 10
    { duration: '3m', target: 100 }, // ramp-up: 10 -> 100
    { duration: '5m', target: 100 }, // steady state
    { duration: '2m', target: 0 }, // ramp-down
  ],
  gracefulRampDown: '30s',
};

export const authFlowThresholds: NonNullable<Options['thresholds']> = {
  http_req_duration: ['p(95)<500'],
  errors: ['rate<0.01'],
  http_req_failed: ['rate<0.01'],
  'http_req_duration{endpoint:login}': ['p(95)<800'],
};
