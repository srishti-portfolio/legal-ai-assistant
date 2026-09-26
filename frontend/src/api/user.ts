import type { PublicUser } from "../types.js";
import { apiRequest } from "./client.js";

export function updateProfile(input: { name?: string; language?: string }): Promise<PublicUser> {
  return apiRequest("/user/profile", { method: "PATCH", body: input });
}
