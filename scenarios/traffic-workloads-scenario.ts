import type { Options } from 'k6/options';

export type Scenario = NonNullable<Options['scenarios']>[string];


// VU base test scenario

export const smokeScenario: Scenario = {
  executor: 'constant-vus',
  vus: 5,
  duration: '2m',
};

export const baselineScenario: Scenario = {
  executor: 'constant-vus',
  vus: 50,
  duration: '10m',
};

export const constantLoadScenario: Scenario = {
  executor: 'constant-vus',
  vus: 500,
  duration: '5m',
};

export const loadScenario: Scenario = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 500 },
    { duration: '2m', target: 0 },
  ],
  gracefulRampDown: '30s',
};

export const startsLoadScenario: Scenario = {
  executor: 'ramping-vus',
  startVUs: 10,
  stages: [
    { duration: '3m', target: 100 }, // ramp-up: 10 -> 100
    { duration: '5m', target: 100 }, // steady state
    { duration: '2m', target: 0 }, // ramp-down
  ],
  gracefulRampDown: '30s',
};

export const stressScenario: Scenario = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '2m', target: 500 },
    { duration: '5m', target: 1000 },
    { duration: '2m', target: 1500 },
    { duration: '2m', target: 0 },
  ],
};

export const spikeScenario: Scenario = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '30s', target: 1000 },
    { duration: '1m', target: 1000 },
    { duration: '30s', target: 0 },
  ],
};

export const soakScenario: Scenario = {
  executor: 'constant-vus',
  vus: 300,
  duration: '8h',
};

export const breakpointScenario: Scenario = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '2m', target: 500 },
    { duration: '2m', target: 1000 },
    { duration: '2m', target: 2000 },
    { duration: '2m', target: 4000 },
  ],
};

export const stepLoadScenario: Scenario = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '2m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '2m', target: 300 },
    { duration: '2m', target: 400 },
    { duration: '2m', target: 500 },
    { duration: '2m', target: 0 },
  ],
};

export const peakHourScenario: Scenario = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '15m', target: 100 },
    { duration: '30m', target: 500 },
    { duration: '15m', target: 1000 },
    { duration: '30m', target: 500 },
    { duration: '15m', target: 100 },
  ],
};

export const waveScenario: Scenario = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '2m', target: 100 },
    { duration: '2m', target: 300 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 300 },
    { duration: '2m', target: 100 },
  ],
};

export const burstScenario: Scenario = {
  executor: 'ramping-vus',
  startVUs: 100,
  stages: [
    { duration: '20s', target: 800 },
    { duration: '40s', target: 100 },
    { duration: '20s', target: 800 },
    { duration: '40s', target: 100 },
  ],
};

export const recoveryScenario: Scenario = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '2m', target: 1000 },
    { duration: '5m', target: 1000 },
    { duration: '5m', target: 100 },
  ],
};

// Arrival rate based test scenario

export const constantArrivalRateScenario: Scenario = {
  executor: 'constant-arrival-rate',
  rate: 200,
  timeUnit: '1s',
  duration: '10m',
  preAllocatedVUs: 100,
  maxVUs: 500,
};

export const rampingArrivalRateScenario: Scenario = {
  executor: 'ramping-arrival-rate',
  startRate: 50,
  timeUnit: '1s',
  preAllocatedVUs: 100,
  maxVUs: 1000,
  stages: [
    { target: 100, duration: '2m' },
    { target: 300, duration: '2m' },
    { target: 500, duration: '5m' },
    { target: 100, duration: '2m' },
  ],
};

// iteration based test scenario

export const sharedIterationsScenario: Scenario = {
  executor: 'shared-iterations',
  vus: 100,
  iterations: 100000,
};

export const perVuIterationsScenario: Scenario = {
  executor: 'per-vu-iterations',
  vus: 100,
  iterations: 100,
};

export const singleIterationScenario: Scenario = {
  executor: 'per-vu-iterations',
  vus: 500,
  iterations: 1,
};