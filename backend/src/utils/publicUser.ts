import type { User } from "../types/models.js";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  language: string;
}

/** Strips internal fields (password_hash, created_at) before a user ever reaches the client. */
export function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, language: user.language };
}