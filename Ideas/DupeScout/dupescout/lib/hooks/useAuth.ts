"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "@/lib/types";

const TOKEN_KEY = "ds_token";
const USER_KEY  = "ds_user";

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [token, setToken]         = useState<string | null>(null);
  const [user, setUser]           = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount — no backend call, trust stored token
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = localStorage.getItem(USER_KEY);
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch { /* ignore corrupt */ }
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return {
    user,
    token,
    isLoading,
    isLoggedIn: !!token && !!user,
    login,
    logout,
  };
}
