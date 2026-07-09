/**
 * src/types/index.ts
 * Shared type definitions used across config, auth, and test files.
 */

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface EnvConfig {
  name: string;
  baseUrl: string;
  homepageUrl: string;
  tokenTtlSeconds: number;
}

export interface AppConfig {
  envName: string;
  baseUrl: string;
  homepageUrl: string;
  tokenTtlSeconds: number;
}

export interface LoginResponseBody {
  token: string;
  expiresIn?: number;
  user: { id: number; username: string };
}
