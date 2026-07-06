import { createContext } from "react";
import type { User } from "@/types/user";

export interface AuthContextValue {
  user: User | null;
  status: "idle" | "authenticated" | "unauthenticated";
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
