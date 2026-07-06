import { api } from "@/services/api";
import type { User } from "@/types/user";

export const userService = {
  lookupByEmail: (email: string) =>
    api.get<{ user: User | null }>("/users/lookup", { params: { email } }).then((r) => r.data.user),

  searchCollaborators: (params: { projectId?: string; q?: string }) =>
    api.get<{ users: User[] }>("/users/collaborators", { params }).then((r) => r.data.users),
};
