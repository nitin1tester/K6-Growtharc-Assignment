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
| Description | Command |
|---|---|
| Check k6 version | `k6 version` |
| Install project dependencies | `npm install` |
| Install sample app dependencies | `cd sample-app && npm install` |
| Start sample app | `node server.js` |
| Start sample app on custom port | `PORT=3001 node server.js` |
| Health check | `curl http://localhost:3001` |
| Login | `curl -X POST http://localhost:3001/api/login -H "Content-Type: application/json" -d '{"username":"user0001","password":"P@ss1001!"}'` |
| Access protected route | `curl http://localhost:3001/api/profile -H "Authorization: Bearer PASTE_YOUR_TOKEN_HERE"` |
| Invalid credentials check | `curl -i -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{"username":"user0001","password":"wrongpassword"}'` |
| Missing token check | `curl -i http://localhost:3001/api/profile` |
| Invalid token check | `curl -i http://localhost:3001/api/profile -H "Authorization: Bearer not-a-real-token"` |
| Type-check the project | `npm run typecheck` |
| Run both tests together | `npm run test:all:local` |
| Run auth flow test | `npm run test:auth:local` |
| Run homepage test | `npm run test:homepage:prod` |
| Run auth test (raw k6) | `k6 run tests/auth-load-test.ts -e ENV=local` |
| Run homepage test (raw k6) | `k6 run tests/homepage-load-test.ts -e ENV=prod` |
| Run auth test with port override | `k6 run tests/auth-load-test.ts -e ENV=local -e BASE_URL=http://localhost:3001` |
| Find process on port 3001 | `lsof -i :3001` |
| Kill process by PID | `kill -9 <PID>` |
| Git add + commit | `git add . && git commit -m "message"` |
| Git push | `git push` |
| Git pull | `git pull` |
```
