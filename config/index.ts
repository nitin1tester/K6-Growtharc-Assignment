/**
 * config/index.ts
 *
 * Central, typed environment config loader.
 *
 * Usage:
 *   import { config } from '../config/index.ts';
 *   http.get(`${config.baseUrl}/api/profile`);
 *
 * Select environment:
 *   k6 run tests/auth-load-test.ts -e ENV=local
 *   k6 run tests/auth-load-test.ts -e ENV=staging
 *   k6 run tests/auth-load-test.ts -e ENV=prod
 *
 * Any value can still be overridden directly without touching JSON, e.g.:
 *   k6 run tests/auth-load-test.ts -e ENV=local -e BASE_URL=https://k6-sample-app.onrender.com
 */

import type { AppConfig, EnvConfig } from '../src/types/index.ts';

const ENVIRONMENTS: Record<string, EnvConfig> = {
  local: JSON.parse(open('./environments/local.json')),
  staging: JSON.parse(open('./environments/staging.json')),
  prod: JSON.parse(open('./environments/prod.json')),
};

const envName: string = __ENV.ENV || 'local';
const envConfig: EnvConfig | undefined = ENVIRONMENTS[envName];

if (!envConfig) {
  throw new Error(
    `Unknown ENV "${envName}". Valid options: ${Object.keys(ENVIRONMENTS).join(', ')}`
  );
}

export const config: AppConfig = {
  envName,
  baseUrl: __ENV.BASE_URL || envConfig.baseUrl,
  homepageUrl: __ENV.HOMEPAGE_URL || envConfig.homepageUrl,
  tokenTtlSeconds: Number(__ENV.TOKEN_TTL_SECONDS || envConfig.tokenTtlSeconds),
};
