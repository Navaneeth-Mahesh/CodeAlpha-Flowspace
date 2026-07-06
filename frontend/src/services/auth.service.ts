import { api } from "@/services/api";
import type { User } from "@/types/user";

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>("/auth/register", { name, email, password }).then((r) => r.data),

  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data),

  me: () => api.get<{ user: User }>("/auth/me").then((r) => r.data.user),

  updateProfile: (fields: Partial<User>) =>
    api.patch<{ user: User }>("/auth/profile", fields).then((r) => r.data.user),

  updatePassword: (currentPassword: string, newPassword: string) =>
    api.patch<{ message: string }>("/auth/password", { currentPassword, newPassword }).then((r) => r.data),

  forgotPassword: (email: string) =>
    api
      .post<{ message: string; devResetUrl?: string }>("/auth/forgot-password", { email })
      .then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>("/auth/reset-password", { token, password }).then((r) => r.data),
};
