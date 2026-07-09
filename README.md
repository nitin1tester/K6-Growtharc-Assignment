# K6 Performance Testing Framework (TypeScript)

Same framework as the JS version, ported to TypeScript with full type
definitions for users, config, and k6's own APIs (via `@types/k6`).

## Running TS directly — no build step

Modern k6 (v0.52+) runs `.ts` files natively:

```bash
k6 version   # confirm you're on v0.52 or newer
k6 run tests/auth-load-test.ts -e ENV=local
```

If your `k6 version` is older than 0.52, either upgrade k6 (recommended —
`brew upgrade k6` on Mac) or fall back to compiling with `tsc`/`esbuild` to
`.js` first and running the compiled output; ask if you need that fallback
build wired up.

`tsconfig.json` and `@types/k6` are there purely for editor
intellisense/type-checking (`npm run typecheck`) — they are not required at
k6 runtime.

## Structure

Identical layout to the JS version, `.js` → `.ts`, plus `src/types/index.ts`
for shared interfaces:

```
k6-framework-ts/
├── config/
│   ├── environments/*.json
│   └── index.ts                 # typed config loader
├── data/users.json
├── src/
│   ├── types/index.ts           # User, AppConfig, EnvConfig, LoginResponseBody
│   ├── auth/tokenManager.ts     # typed login/cache/refresh
│   └── utils/
│       ├── httpClient.ts        # typed authedRequest()
│       └── metrics.ts
├── scenarios/
│   ├── auth-flow.scenario.ts    # typed against k6's Options['scenarios']
│   └── homepage-load.scenario.ts
├── tests/
│   ├── auth-load-test.ts
│   └── homepage-load-test.ts
├── sample-app/                  # unchanged — plain Node/Express, no TS needed here
├── tsconfig.json
├── package.json
└── .github/workflows/k6-performance.yml   # adds a typecheck job before the k6 runs
```

## What TypeScript buys you here

- **`User`, `AppConfig`, `LoginResponseBody` interfaces** — a typo in a
  field name (e.g. `res.json('tokn')`) is caught at edit time instead of
  showing up as a silent `undefined` in a 5-minute load test run.
- **`Options['scenarios']` / `Options['thresholds']` types** on the scenario
  files — autocomplete for valid executor names/fields, and a compile error
  if a threshold expression is malformed.
- **`RefinedResponse` typing** on `http.get`/`http.post` results in
  `httpClient.ts` — `res.status`, `res.timings.duration`, `res.body` are
  all typed instead of `any`.

## Running

```bash
# from k6-framework-ts/ root
npm install          # only needed for typecheck / editor support
npm run typecheck    # optional, catches type errors before running

k6 run tests/auth-load-test.ts -e ENV=local -e BASE_URL=http://localhost:4000
k6 run tests/homepage-load-test.ts -e ENV=prod
```
