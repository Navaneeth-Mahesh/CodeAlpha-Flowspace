import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import type { User } from "@/types/user";
import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/services/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"idle" | "authenticated" | "unauthenticated">("idle");

  useEffect(() => {
    const token = tokenStorage.get();
    if (!token) {
      setStatus("unauthenticated");
      return;
    }
    authService
      .me()
      .then((u) => {
        setUser(u);
        setStatus("authenticated");
      })
      .catch(() => {
        tokenStorage.clear();
        setStatus("unauthenticated");
      });
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setStatus("unauthenticated");
    };
    window.addEventListener("flowspace:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("flowspace:unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { token, user: loggedInUser } = await authService.login(email, password);
      tokenStorage.set(token);
      setUser(loggedInUser);
      setStatus("authenticated");
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: (err as Error).message };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const { token, user: newUser } = await authService.register(name, email, password);
      tokenStorage.set(token);
      setUser(newUser);
      setStatus("authenticated");
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: (err as Error).message };
    }
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await authService.me();
    setUser(u);
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo(
    () => ({ user, status, login, register, logout, refreshUser, updateUser }),
    [user, status, login, register, logout, refreshUser, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
