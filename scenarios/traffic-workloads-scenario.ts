import type { Options } from 'k6/options';

export type Scenario = NonNullable<Options['scenarios']>[string];

// 1. VU base test scenario

// Scenario: Smoke Test
// Purpose: Verify application availability with minimal traffic.
export const smokeScenario: Scenario = {
  executor: 'constant-vus',
  vus: 5,
  duration: '2m',
};

// Scenario: Baseline Test
// Purpose: Measure performance under normal expected user load.
export const baselineScenario: Scenario = {
  executor: 'constant-vus',
  vus: 50,
  duration: '10m',
};

// Scenario: Constant Load Test
// Purpose: Validate application stability under sustained load.
export const constantLoadScenario: Scenario = {
  executor: 'constant-vus',
  vus: 500,
  duration: '5m',
};

// Scenario: Load Test
// Purpose: Gradually increase and decrease users to simulate real-world traffic.
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

// Scenario: Standard Load Test
// Purpose: Simulate expected production traffic with ramp-up, steady-state, and ramp-down.
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

// Scenario: Stress Test
// Purpose: Push the application beyond expected capacity to identify bottlenecks and failure points.
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

// Scenario: Spike Test
// Purpose: Simulate sudden traffic spikes to evaluate application resilience.
export const spikeScenario: Scenario = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '30s', target: 1000 },
    { duration: '1m', target: 1000 },
    { duration: '30s', target: 0 },
  ],
};

// Scenario: Soak (Endurance) Test
// Purpose: Run the application for an extended period to detect memory leaks and resource exhaustion.
export const soakScenario: Scenario = {
  executor: 'constant-vus',
  vus: 300,
  duration: '8h',
};

// Scenario: Breakpoint (Capacity) Test
// Purpose: Determine the maximum load the application can handle before failure.
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

// Scenario: Step Load Test
// Purpose: Increase users in fixed increments to observe performance at each load level.
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

// Scenario: Peak Hour Simulation Test
// Purpose: Simulate daily production traffic patterns with varying load levels.
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

// Scenario: Wave Load Test
// Purpose: Simulate cyclical traffic patterns with repeated increases and decreases in load.
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

// Scenario: Burst Load Test
// Purpose: Generate repeated short bursts of high traffic to validate stability.
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

// Scenario: Recovery Test
// Purpose: Verify how quickly the application recovers after handling heavy load.
export const recoveryScenario: Scenario = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '2m', target: 1000 },
    { duration: '5m', target: 1000 },
    { duration: '5m', target: 100 },
  ],
};



// 2. Arrival rate based test scenario


// Scenario: Constant Arrival Rate Test
// Purpose: Generate a fixed number of requests per second regardless of response time.
export const constantArrivalRateScenario: Scenario = {
  executor: 'constant-arrival-rate',
  rate: 200,
  timeUnit: '1s',
  duration: '10m',
  preAllocatedVUs: 100,
  maxVUs: 500,
};


// Scenario: Ramping Arrival Rate Test
// Purpose: Gradually increase and decrease the request rate to evaluate throughput.
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


// 3. iteration based test scenario



// Scenario: Shared Iterations Test
// Purpose: Execute a fixed number of iterations shared among all virtual users.
export const sharedIterationsScenario: Scenario = {
  executor: 'shared-iterations',
  vus: 100,
  iterations: 100000,
};


// Scenario: Per VU Iterations Test
// Purpose: Ensure each virtual user executes the same number of iterations.
export const perVuIterationsScenario: Scenario = {
  executor: 'per-vu-iterations',
  vus: 100,
  iterations: 100,
};

// Scenario: Single Iteration Test
// Purpose: Execute exactly one iteration per virtual user, commonly used for concurrent operations like login or registration.
export const singleIterationScenario: Scenario = {
  executor: 'per-vu-iterations',
  vus: 500,
  iterations: 1,
};