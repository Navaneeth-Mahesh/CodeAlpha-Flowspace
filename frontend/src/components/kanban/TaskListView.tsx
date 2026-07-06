import { CheckSquare } from "lucide-react";
import { AssigneeStack } from "@/components/tasks/AssigneeStack";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { formatDueDate, isOverdue } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";

export function TaskListView({ project, tasks, onOpenTask }: { project: Project; tasks: Task[]; onOpenTask: (task: Task) => void }) {
  const columns = [...project.columns].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-6">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id).sort((a, b) => a.order - b.order);
        if (colTasks.length === 0) return null;
        return (
          <div key={col.id}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {col.name} · {colTasks.length}
            </p>
            <div className="flex flex-col divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
              {colTasks.map((task) => (
                <button
                  key={task._id}
                  onClick={() => onOpenTask(task)}
                  className="flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-surface-hover)]"
                >
                  <span className="flex-1 truncate text-sm text-[var(--color-text)]">{task.title}</span>
                  {task.checklist.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                      <CheckSquare className="h-3 w-3" />
                      {task.checklist.filter((c) => c.done).length}/{task.checklist.length}
                    </span>
                  )}
                  <PriorityBadge priority={task.priority} />
                  {task.dueDate && (
                    <span className={cn("text-xs", isOverdue(task.dueDate) && task.status !== "done" ? "text-[var(--color-danger)]" : "text-[var(--color-text-muted)]")}>
                      {formatDueDate(task.dueDate)}
                    </span>
                  )}
                  <AssigneeStack users={task.assignees} max={2} />
                </button>
              ))}
            </div>
          </div>
        );
      })}
      {tasks.length === 0 && <p className="py-16 text-center text-sm text-[var(--color-text-muted)]">No tasks yet.</p>}
    </div>
  );
}
