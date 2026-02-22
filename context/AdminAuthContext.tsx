"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AppUser } from "@/lib/admin-auth";
import {
  getStoredSession,
  setStoredSession,
  clearStoredSession,
  validateCredentials,
} from "@/lib/admin-auth";

export type LoginResult =
  | { success: true; user: AppUser }
  | { success: false; error: string };

interface AdminAuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getStoredSession();
    setUser(session?.user ?? null);
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string): LoginResult => {
    const appUser = validateCredentials(email, password);
    if (!appUser) {
      return { success: false, error: "Email ose fjalëkalimi i gabuar." };
    }
    setStoredSession(appUser);
    setUser(appUser);
    return { success: true, user: appUser };
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setUser(null);
  }, []);

  const value: AdminAuthContextValue = {
    user,
    isLoading,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
