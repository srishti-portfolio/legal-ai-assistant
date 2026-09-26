import type { LanguageCode } from "../i18n/translations.js";
import type { PublicUser } from "../types.js";
import { apiRequest } from "./client.js";

export function register(input: {
  name: string;
  email: string;
  password: string;
  language: LanguageCode;
}): Promise<{ user: PublicUser }> {
  return apiRequest("/auth/register", { method: "POST", body: input });
}

export function login(input: { email: string; password: string }): Promise<{ user: PublicUser }> {
  return apiRequest("/auth/login", { method: "POST", body: input });
}

export function logout(): Promise<void> {
  return apiRequest("/auth/logout", { method: "POST" });
}

export function fetchCurrentUser(): Promise<{ user: PublicUser }> {
  return apiRequest("/auth/me");
}