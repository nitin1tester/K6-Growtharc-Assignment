/**
 * scenarios/homepage-load.scenario.ts
 *
 * Executor: constant-vus
 * Requirement is a flat "simulate 500 concurrent users", no ramp specified.
 * constant-vus expresses that directly: 500 VUs running continuously for
 * the configured duration. ramping-vus would add unnecessary stage
 * bookkeeping for a scenario with no ramp requirement.
 */

import type { Options } from 'k6/options';

export const homepageScenario: NonNullable<Options['scenarios']>[string] = {
  executor: 'constant-vus',
  vus: 500,
  duration: '5m',
};

export const homepageThresholds: NonNullable<Options['thresholds']> = {
  http_req_duration: ['p(95)<500', 'p(99)<1000'],
  homepage_duration: ['p(95)<500'],
  errors: ['rate<0.01'],
  http_req_failed: ['rate<0.01'],
  http_reqs: ['rate>100'],
};
