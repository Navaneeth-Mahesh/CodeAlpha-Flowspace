import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import type { Project } from "@/types/project";

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
  projects: Project[];
}

export default function Team() {
  const { projects } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    const map = new Map<string, Collaborator>();
    for (const project of projects) {
      const people = [project.owner, ...project.members.map((m) => m.user)];
      for (const person of people) {
        if (person.id === user?.id) continue;
        if (!map.has(person.id)) {
          map.set(person.id, {
            id: person.id,
            name: person.name,
            email: person.email,
            avatarInitials: person.avatarInitials,
            avatarColor: person.avatarColor,
            projects: [],
          });
        }
        map.get(person.id)!.projects.push(project);
      }
    }
    setCollaborators(Array.from(map.values()));
  }, [projects, user]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">Team</h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Everyone you currently share a project with. Invite people from inside each project's Members tab.
      </p>

      {collaborators.length === 0 ? (
        <Card className="mt-8 flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
            <Users className="h-6 w-6 text-[var(--color-primary)]" />
          </span>
          <p className="max-w-sm text-sm text-[var(--color-text-secondary)]">
            It's just you so far. Open a project and invite a teammate by email to see them here.
          </p>
        </Card>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {collaborators.map((c) => (
            <Card key={c.id} className="flex items-center gap-3">
              <Avatar name={c.name} initials={c.avatarInitials} color={c.avatarColor} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[var(--color-text)]">{c.name}</p>
                <p className="truncate text-xs text-[var(--color-text-muted)]">{c.email}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {c.projects.map((p) => (
                    <button key={p._id} onClick={() => navigate(ROUTES.project(p._id))}>
                      <Badge tone="neutral" className="cursor-pointer hover:bg-[var(--color-surface-hover)]">
                        {p.icon} {p.name}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
