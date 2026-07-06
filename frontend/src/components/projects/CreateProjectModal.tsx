import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useProjects } from "@/hooks/useProjects";
import { PROJECT_COLORS, PROJECT_ICONS } from "@/constants/projectStyle";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

export function CreateProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createProject } = useProjects();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [icon, setIcon] = useState(PROJECT_ICONS[0]);
  const [visibility, setVisibility] = useState<"private" | "team" | "public">("private");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
    setColor(PROJECT_COLORS[0]);
    setIcon(PROJECT_ICONS[0]);
    setVisibility("private");
    setError(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Give your project a name");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const project = await createProject({ name, description, color, icon, visibility });
      reset();
      onClose();
      navigate(ROUTES.project(project._id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Create a project"
      description="Projects hold the boards, tasks, and people working on one goal."
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div role="alert" className="rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] px-3.5 py-2.5 text-sm text-[var(--color-danger)]">
            {error}
          </div>
        )}

        <Input label="Project name" placeholder="Q3 marketing launch" value={name} onChange={(e) => setName(e.target.value)} autoFocus />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What is this project about?"
            className="surface-neu-inset w-full resize-none px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--color-text)]">Icon</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PROJECT_ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-base transition-colors",
                  icon === i ? "bg-[var(--color-primary-soft)] ring-2 ring-[var(--color-primary)]" : "bg-[var(--color-surface-soft)]"
                )}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--color-text)]">Color</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
                className={cn("h-7 w-7 rounded-full transition-transform", color === c && "ring-2 ring-offset-2 ring-offset-[var(--color-surface)] ring-[var(--color-text)] scale-110")}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--color-text)]">Visibility</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(["private", "team", "public"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v)}
                className={cn(
                  "rounded-[var(--radius-md)] border px-3 py-2 text-sm capitalize transition-colors",
                  visibility === v
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-soft)]"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSubmit} isLoading={submitting} fullWidth className="mt-2">
          Create project
        </Button>
      </div>
    </Modal>
  );
}
