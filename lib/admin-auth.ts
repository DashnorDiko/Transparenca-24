/**
 * App authentication (client-side check for hackathon/demo).
 * Same login flow for users and admins; access is limited by role.
 * In production, replace with server-side auth (e.g. NextAuth, your API).
 */

/** Logged-in user: ADMIN = full access, CITIZEN = limited (no admin panel) */
export type AppUserRole = "ADMIN" | "CITIZEN";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: AppUserRole;
}

/** @deprecated Use AppUser */
export type AdminUser = AppUser & { role: "ADMIN" };

/** Default admin account – change password in production or use env */
const DEFAULT_ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "admin@transparenca24.al";
const DEFAULT_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "Transparenca24!";

/** Pre-defined admin accounts */
const ADMIN_ACCOUNTS: Array<{ email: string; password: string; name: string }> = [
  { email: DEFAULT_ADMIN_EMAIL, password: DEFAULT_ADMIN_PASSWORD, name: "Administrator" },
  { email: "admin@llogaria.al", password: "Llogaria2026!", name: "Admin Llogaria" },
];

/** Pre-defined user (citizen) accounts – same login, limited access */
const USER_ACCOUNTS: Array<{ email: string; password: string; name: string }> = [
  { email: "user@llogaria.al", password: "Llogaria2026!", name: "Përdorues" },
  { email: "qytetar@transparenca24.al", password: "Transparenca24!", name: "Qytetar" },
];

/**
 * Validate credentials and return the app user (admin or citizen) if valid.
 * Admins are checked first, then users. Same login flow for both.
 */
export function validateCredentials(
  email: string,
  password: string
): AppUser | null {
  const normalizedEmail = email.trim().toLowerCase();
  const admin = ADMIN_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === normalizedEmail && a.password === password
  );
  if (admin) {
    return {
      id: `admin-${admin.email.replace(/[^a-z0-9]/gi, "-")}`,
      email: admin.email,
      name: admin.name,
      role: "ADMIN",
    };
  }
  const user = USER_ACCOUNTS.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );
  if (user) {
    return {
      id: `user-${user.email.replace(/[^a-z0-9]/gi, "-")}`,
      email: user.email,
      name: user.name,
      role: "CITIZEN",
    };
  }
  return null;
}

/**
 * Validate credentials and return admin user only (for admin-only flows).
 * @deprecated Prefer validateCredentials() and check role.
 */
export function validateAdminCredentials(
  email: string,
  password: string
): AppUser | null {
  const u = validateCredentials(email, password);
  return u?.role === "ADMIN" ? u : null;
}

export const ADMIN_SESSION_KEY = "transparenca24_admin_session";
const SESSION_EXPIRY_HOURS = 24;

export interface StoredSession {
  user: AppUser;
  expiresAt: string; // ISO
}

export function getStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredSession;
    if (new Date(data.expiresAt) <= new Date()) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setStoredSession(user: AppUser): void {
  if (typeof window === "undefined") return;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);
  const session: StoredSession = { user, expiresAt: expiresAt.toISOString() };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_SESSION_KEY);
}
