import { useEffect, useState, type ReactNode } from "react";
import {
  Trash2,
  Copy,
  Plus,
  X,
  CalendarDays,
  Flag,
  Tag as TagIcon,
  CheckSquare,
  Archive,
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { AssigneePicker } from "@/components/tasks/AssigneePicker";
import { CommentsSection } from "@/components/tasks/CommentsSection";
import { taskService } from "@/services/task.service";
import { cn } from "@/utils/cn";
import type { Project } from "@/types/project";
import type { Priority, Task } from "@/types/task";

const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

interface Props {
  open: boolean;
  onClose: () => void;
  project: Project;
  task: Task | null;
  defaultStatus?: string;
  onCreated: (task: Task) => void;
  onUpdated: (id: string, data: Partial<Task>) => void;
  onDeleted: (id: string) => void;
}

export function TaskDetailDrawer({ open, onClose, project, task, defaultStatus, onCreated, onUpdated, onDeleted }: Props) {
  const isCreate = !task;
  const [draft, setDraft] = useState<Partial<Task>>({});
  const [labelInput, setLabelInput] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setDraft(task);
    } else {
      setDraft({ status: defaultStatus ?? project.columns[0]?.id, priority: "medium", labels: [], assignees: [], checklist: [] });
    }
  }, [task, defaultStatus, project.columns]);

  if (!open) return null;

  const patch = (fields: Partial<Task>) => {
    setDraft((prev) => ({ ...prev, ...fields }));
    if (task) onUpdated(task._id, fields);
  };

  const handleCreate = async () => {
    if (!draft.title?.trim()) return;
    setSaving(true);
    try {
      const created = await taskService.create(project._id, draft);
      onCreated(created);
    } finally {
      setSaving(false);
    }
  };

  const addLabel = () => {
    if (!labelInput.trim()) return;
    const next = [...(draft.labels ?? []), labelInput.trim()];
    patch({ labels: next });
    setLabelInput("");
  };

  const removeLabel = (label: string) => patch({ labels: (draft.labels ?? []).filter((l) => l !== label) });

  const addChecklistItem = async () => {
    if (!checklistInput.trim() || !task) return;
    const updated = await taskService.addChecklistItem(task._id, checklistInput.trim());
    onUpdated(task._id, { checklist: updated.checklist });
    setDraft((prev) => ({ ...prev, checklist: updated.checklist }));
    setChecklistInput("");
  };

  const toggleChecklistItem = async (itemId: string, done: boolean) => {
    if (!task) return;
    const updated = await taskService.updateChecklistItem(task._id, itemId, { done });
    onUpdated(task._id, { checklist: updated.checklist });
    setDraft((prev) => ({ ...prev, checklist: updated.checklist }));
  };

  const removeChecklistItem = async (itemId: string) => {
    if (!task) return;
    const updated = await taskService.deleteChecklistItem(task._id, itemId);
    onUpdated(task._id, { checklist: updated.checklist });
    setDraft((prev) => ({ ...prev, checklist: updated.checklist }));
  };

  return (
    <Drawer open={open} onClose={onClose}>
      <div className="flex flex-col gap-6 pt-2">
        <input
          value={draft.title ?? ""}
          onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
          onBlur={() => task && draft.title !== task.title && onUpdated(task._id, { title: draft.title })}
          placeholder="Task title"
          className="w-full bg-transparent pr-8 font-[var(--font-display)] text-xl font-semibold text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
        />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <Field label="Status" icon={<Flag className="h-3.5 w-3.5" />}>
            <select
              value={draft.status}
              onChange={(e) => patch({ status: e.target.value })}
              className="surface-neu-inset rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm text-[var(--color-text)] outline-none"
            >
              {project.columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Priority" icon={<Flag className="h-3.5 w-3.5" />}>
            <select
              value={draft.priority}
              onChange={(e) => patch({ priority: e.target.value as Priority })}
              className="surface-neu-inset rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm capitalize text-[var(--color-text)] outline-none"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Due date" icon={<CalendarDays className="h-3.5 w-3.5" />}>
            <input
              type="date"
              value={draft.dueDate ? draft.dueDate.slice(0, 10) : ""}
              onChange={(e) => patch({ dueDate: e.target.value || undefined })}
              className="surface-neu-inset rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm text-[var(--color-text)] outline-none"
            />
          </Field>
        </div>

        <Field label="Assignees">
          <AssigneePicker projectId={project._id} selected={draft.assignees ?? []} onChange={(users) => patch({ assignees: users })} />
        </Field>

        <Field label="Labels" icon={<TagIcon className="h-3.5 w-3.5" />}>
          <div className="flex flex-wrap items-center gap-1.5">
            {(draft.labels ?? []).map((l) => (
              <span key={l} className="flex items-center gap-1 rounded-full bg-[var(--color-surface-soft)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]">
                {l}
                <button onClick={() => removeLabel(l)} aria-label={`Remove ${l}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLabel())}
              placeholder="Add label…"
              className="w-24 bg-transparent text-xs text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
            />
          </div>
        </Field>

        <Field label="Description">
          <textarea
            value={draft.description ?? ""}
            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
            onBlur={() => task && draft.description !== task.description && onUpdated(task._id, { description: draft.description })}
            rows={4}
            placeholder="Add more detail…"
            className="surface-neu-inset w-full resize-none px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
          />
        </Field>

        {!isCreate && (
          <Field label="Checklist" icon={<CheckSquare className="h-3.5 w-3.5" />}>
            <div className="flex flex-col gap-1.5">
              {(draft.checklist ?? []).map((item) => (
                <label key={item._id} className="flex items-center gap-2 rounded-[var(--radius-sm)] px-1.5 py-1 hover:bg-[var(--color-surface-hover)]">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={(e) => toggleChecklistItem(item._id, e.target.checked)}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />
                  <span className={cn("flex-1 text-sm text-[var(--color-text)]", item.done && "text-[var(--color-text-muted)] line-through")}>
                    {item.text}
                  </span>
                  <button onClick={() => removeChecklistItem(item._id)} aria-label="Remove checklist item">
                    <X className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                  </button>
                </label>
              ))}
              <div className="flex items-center gap-2">
                <input
                  value={checklistInput}
                  onChange={(e) => setChecklistInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addChecklistItem())}
                  placeholder="Add checklist item…"
                  className="surface-neu-inset flex-1 px-3 py-1.5 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)]"
                />
                <button onClick={addChecklistItem} className="text-[var(--color-primary)]" aria-label="Add item">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Field>
        )}

        {isCreate ? (
          <Button onClick={handleCreate} isLoading={saving} disabled={!draft.title?.trim()}>
            Create task
          </Button>
        ) : (
          <>
            <div>
              <p className="mb-2 text-sm font-medium text-[var(--color-text)]">Comments</p>
              <CommentsSection taskId={task!._id} projectId={project._id} />
            </div>

            <div className="mt-2 flex items-center gap-2 border-t border-[var(--color-border)] pt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  const copy = await taskService.duplicate(task!._id);
                  onCreated(copy);
                  onClose();
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  await taskService.setArchived(task!._id, true);
                  onDeleted(task!._id);
                  onClose();
                }}
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  if (!confirm("Delete this task permanently?")) return;
                  await taskService.remove(task!._id);
                  onDeleted(task!._id);
                  onClose();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}

function Field({ label, icon, children }: { label: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)]">
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}
