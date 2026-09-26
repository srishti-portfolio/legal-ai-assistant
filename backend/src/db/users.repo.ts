import type { User } from "../types/models.js";
import { pool } from "./pool.js";

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
  language = "en",
): Promise<User> {
  const { rows } = await pool.query<User>(
    `INSERT INTO users (name, email, password_hash, language) VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, passwordHash, language],
  );
  return rows[0]!;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { rows } = await pool.query<User>(`SELECT * FROM users WHERE email = $1`, [email]);
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const { rows } = await pool.query<User>(`SELECT * FROM users WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function updateUserProfile(
  id: string,
  updates: { name?: string; language?: string },
): Promise<User | null> {
  const { rows } = await pool.query<User>(
    `UPDATE users SET name = COALESCE($2, name), language = COALESCE($3, language) WHERE id = $1 RETURNING *`,
    [id, updates.name ?? null, updates.language ?? null],
  );
  return rows[0] ?? null;
}