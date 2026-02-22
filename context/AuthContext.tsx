"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getStoredRole, setStoredRole, type AuthRole } from "@/lib/auth";

interface AuthContextValue {
  role: AuthRole;
  setRole: (role: AuthRole) => void;
  isGuest: boolean;
  isCitizen: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<AuthRole>("GUEST");

  useEffect(() => {
    setRoleState(getStoredRole());
  }, []);

  const setRole = useCallback((newRole: AuthRole) => {
    setStoredRole(newRole);
    setRoleState(newRole);
  }, []);

  const value: AuthContextValue = {
    role,
    setRole,
    isGuest: role === "GUEST",
    isCitizen: role === "CITIZEN",
    isAdmin: role === "ADMIN",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
