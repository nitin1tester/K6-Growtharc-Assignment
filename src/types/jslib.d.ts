/**
 * src/types/jslib.d.ts
 *
 * k6-reporter and k6-summary are plain JS libraries loaded directly from a
 * URL (k6 supports remote imports natively) — they ship no TypeScript
 * types of their own. These ambient declarations tell the compiler what
 * shape to expect so tests/*.ts can import and use them without a
 * "cannot find module" error.
 */

declare module 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js' {
  export function htmlReport(data: unknown): string;
}

declare module 'https://jslib.k6.io/k6-summary/0.1.0/index.js' {
  export function textSummary(
    data: unknown,
    options?: { indent?: string; enableColors?: boolean }
  ): string;
}