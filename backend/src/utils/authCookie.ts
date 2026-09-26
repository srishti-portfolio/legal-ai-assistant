import type { Response } from "express";
import { env } from "../config/env.js";

export const AUTH_COOKIE_NAME = "token";

/**
 * The session token lives only in an httpOnly cookie — never in a JSON response body or
 * localStorage — so injected script on the page (XSS) cannot read or exfiltrate it.
 *
 * sameSite differs by environment because "site" for cookie purposes ignores port: in local
 * dev, localhost:5173 and localhost:4000 are the same site, so "lax" is sent on fetch calls
 * fine. In production the frontend (Vercel) and backend (Render) are on different domains —
 * genuinely cross-site — so a "lax" cookie would silently NOT be sent on API fetch calls,
 * making every request look logged-out right after a successful login. "none" (which
 * requires secure:true, already true in production) fixes that; a strict, non-wildcard CORS
 * origin is what covers CSRF here instead of sameSite.
 */
export function setAuthCookie(res: Response, token: string): void {
  const isProduction = env.nodeEnv === "production";
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: env.jwt.cookieMaxAgeMs,
    path: "/",
  });
}

export function clearAuthCookie(res: Response): void {
  const isProduction = env.nodeEnv === "production";
  // Browsers match a clear on the cookie's original attributes — mismatched
  // secure/sameSite here would silently leave the real cookie in place.
  res.clearCookie(AUTH_COOKIE_NAME, {
    path: "/",
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
}