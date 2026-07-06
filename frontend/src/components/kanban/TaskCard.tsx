import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, CheckSquare } from "lucide-react";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { AssigneeStack } from "@/components/tasks/AssigneeStack";
import { Badge } from "@/components/ui/Badge";
import { formatDueDate, isOverdue } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { Task } from "@/types/task";

export function TaskCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const doneCount = task.checklist.filter((c) => c.done).length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      className={cn(
        "cursor-grab rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-shadow active:cursor-grabbing",
        "hover:border-[var(--color-primary)]/40 hover:shadow-md",
        isDragging && "opacity-40"
      )}
    >
      {task.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {task.labels.map((l) => (
            <Badge key={l} tone="neutral">
              {l}
            </Badge>
          ))}
        </div>
      )}
      <p className="text-sm text-[var(--color-text)]">{task.title}</p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
          {task.checklist.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
              <CheckSquare className="h-3 w-3" />
              {doneCount}/{task.checklist.length}
            </span>
          )}
          {task.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue(task.dueDate) && task.status !== "done" ? "text-[var(--color-danger)]" : "text-[var(--color-text-muted)]"
              )}
            >
              <CalendarDays className="h-3 w-3" />
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>
        <AssigneeStack users={task.assignees} max={2} />
      </div>
    </div>
  );
}
