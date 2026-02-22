/**
 * Auth simulation for feature gating and Trust criteria.
 * Roles: GUEST (anonymous), CITIZEN (identified citizen), ADMIN (institutional).
 */

export type AuthRole = "GUEST" | "CITIZEN" | "ADMIN";

export const AUTH_ROLE_KEY = "transparenca24_app_role";

export function getStoredRole(): AuthRole {
  if (typeof window === "undefined") return "GUEST";
  const raw = localStorage.getItem(AUTH_ROLE_KEY);
  if (raw === "CITIZEN" || raw === "ADMIN") return raw;
  return "GUEST";
}

export function setStoredRole(role: AuthRole): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_ROLE_KEY, role);
}

export function clearStoredRole(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_ROLE_KEY);
}

export const ROLE_LABELS: Record<AuthRole, string> = {
  GUEST: "Vizitor",
  CITIZEN: "Qytetar",
  ADMIN: "Administrator",
};
