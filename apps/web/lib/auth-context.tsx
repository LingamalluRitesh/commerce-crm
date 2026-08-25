"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organizationName: string;
  role: string;
  permissions: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  hasPermission: (perm: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted mock session or local storage credentials
    const savedToken = localStorage.getItem("ccrm_token");
    const savedUser = localStorage.getItem("ccrm_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("ccrm_token");
        localStorage.removeItem("ccrm_user");
      }
    } else {
      // Default demo enterprise user
      const demoUser: UserProfile = {
        id: "usr_demo_1",
        email: "sarah.connor@acme-enterprise.com",
        firstName: "Sarah",
        lastName: "Connor",
        organizationId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        organizationName: "Acme Enterprise Global",
        role: "admin",
        permissions: ["user:read", "user:write", "order:read", "order:write", "customer:read", "customer:write"],
      };
      setUser(demoUser);
      setToken("mock_jwt_enterprise_token");
    }
    setIsLoading(false);
  }, []);

  const login = (jwtToken: string, profile: UserProfile) => {
    setToken(jwtToken);
    setUser(profile);
    localStorage.setItem("ccrm_token", jwtToken);
    localStorage.setItem("ccrm_user", JSON.stringify(profile));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("ccrm_token");
    localStorage.removeItem("ccrm_user");
  };

  const hasPermission = (perm: string): boolean => {
    if (!user) return false;
    if (user.role === "admin" || user.permissions.includes("*")) return true;
    return user.permissions.includes(perm);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
