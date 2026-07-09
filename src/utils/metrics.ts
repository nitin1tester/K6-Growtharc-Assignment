/**
 * src/utils/metrics.ts
 * Custom metrics shared across scenarios/tests.
 */

import { Rate, Trend, Counter } from 'k6/metrics';

export const errorRate: Rate = new Rate('errors');
export const loginDuration: Trend = new Trend('login_duration');
export const authedReqDuration: Trend = new Trend('authed_request_duration');
export const homepageDuration: Trend = new Trend('homepage_duration');
export const homepageRequests: Counter = new Counter('homepage_requests');
