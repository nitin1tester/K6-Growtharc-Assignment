/**
 * tests/homepage-load-test.ts
 *
 * 500 concurrent VUs against the environment's homepage URL. Config-driven
 * so it can be pointed at local/staging/prod without editing this file.
 *
 * Run:
 *   k6 run tests/homepage-load-test.ts -e ENV=prod
 *   k6 run tests/homepage-load-test.ts --summary-export=reports/homepage-summary.json -e ENV=prod
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import type { Options } from 'k6/options';
import { config } from '../config/index.ts';
import { homepageScenario, homepageThresholds } from '../scenarios/homepage-load.scenario.ts';
import { errorRate, homepageDuration, homepageRequests } from '../src/utils/metrics.ts';

export const options: Options = {
  scenarios: { homepage_500_concurrent: homepageScenario },
  thresholds: homepageThresholds,
};

export default function (): void {
  const res = http.get(config.homepageUrl, { tags: { endpoint: 'homepage' } });

  homepageRequests.add(1);
  homepageDuration.add(res.timings.duration);

  const ok = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'page has content': (r) => typeof r.body === 'string' && r.body.length > 500,
  });
  errorRate.add(!ok);

  sleep(1);
}
