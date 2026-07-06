import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FolderKanban, CheckSquare, X } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { taskService } from "@/services/task.service";
import { ROUTES } from "@/constants/routes";
import type { Task } from "@/types/task";

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [taskResults, setTaskResults] = useState<Task[]>([]);
  const [searching, setSearching] = useState(false);
  const { projects } = useProjects();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTaskResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setTaskResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      taskService
        .search(query)
        .then(setTaskResults)
        .finally(() => setSearching(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const matchingProjects = projects.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 pt-24" onClick={onClose}>
      <div
        className="surface-glass w-full max-w-lg rounded-[var(--radius-lg)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <Search className="h-4 w-4 text-[var(--color-text-muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects and tasks…"
            className="flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
          />
          <button onClick={onClose} aria-label="Close search">
            <X className="h-4 w-4 text-[var(--color-text-muted)]" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {query.trim() === "" ? (
            <p className="px-3 py-8 text-center text-sm text-[var(--color-text-muted)]">
              Start typing to search your projects and assigned tasks.
            </p>
          ) : (
            <>
              {matchingProjects.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1 text-xs font-semibold uppercase text-[var(--color-text-muted)]">
                    Projects
                  </p>
                  {matchingProjects.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => {
                        onClose();
                        navigate(ROUTES.project(p._id));
                      }}
                      className="flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm hover:bg-[var(--color-surface-hover)]"
                    >
                      <FolderKanban className="h-4 w-4 text-[var(--color-text-muted)]" />
                      <span className="text-[var(--color-text)]">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}

              <div>
                <p className="px-3 py-1 text-xs font-semibold uppercase text-[var(--color-text-muted)]">
                  Tasks
                </p>
                {searching && (
                  <p className="px-3 py-3 text-sm text-[var(--color-text-muted)]">Searching…</p>
                )}
                {!searching && taskResults.length === 0 && (
                  <p className="px-3 py-3 text-sm text-[var(--color-text-muted)]">No matching tasks.</p>
                )}
                {taskResults.map((t) => {
                  const project = typeof t.project === "object" ? t.project : null;
                  return (
                    <button
                      key={t._id}
                      onClick={() => {
                        onClose();
                        if (project) navigate(`${ROUTES.project(project._id)}?task=${t._id}`);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm hover:bg-[var(--color-surface-hover)]"
                    >
                      <CheckSquare className="h-4 w-4 text-[var(--color-text-muted)]" />
                      <span className="flex-1 truncate text-[var(--color-text)]">{t.title}</span>
                      {project && (
                        <span className="shrink-0 text-xs text-[var(--color-text-muted)]">{project.name}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
