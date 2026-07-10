import type { Options } from 'k6/options';

export type Thresholds = NonNullable<Options['thresholds']>;

// common threshold
export const commonThresholds: Thresholds = {
  http_req_duration: ['p(95)<500', 'p(99)<1000'],
  http_req_failed: ['rate<0.01'],
  checks: ['rate>0.99'],
};

// custom thresholds for HomePage
export const homepageThresholds: Thresholds = {
  http_req_duration: ['p(95)<500', 'p(99)<1000'],
  homepage_duration: ['p(95)<500'],
  errors: ['rate<0.01'],
  http_req_failed: ['rate<0.01'],
  http_reqs: ['rate>100'],
};

// custom thresholds for Auth
export const authFlowThresholds: Thresholds = {
  http_req_duration: ['p(95)<500'],
  errors: ['rate<0.01'],
  http_req_failed: ['rate<0.01'],
  'http_req_duration{endpoint:login}': ['p(95)<800'],
};