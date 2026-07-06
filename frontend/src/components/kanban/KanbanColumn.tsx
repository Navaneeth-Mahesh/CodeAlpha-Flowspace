import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { TaskCard } from "@/components/kanban/TaskCard";
import type { ProjectColumn } from "@/types/project";
import type { Task } from "@/types/task";

export function KanbanColumn({
  column,
  tasks,
  onOpenTask,
  onAddTask,
}: {
  column: ProjectColumn;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onAddTask: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{column.name}</p>
          <span className="rounded-full bg-[var(--color-surface-soft)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)]">
            {tasks.length}
          </span>
        </div>
        <button onClick={onAddTask} aria-label={`Add task to ${column.name}`} className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-1 flex-col gap-2.5 rounded-[var(--radius-lg)] p-2 transition-colors ${
          isOver ? "bg-[var(--color-primary-soft)]/40" : "bg-[var(--color-surface-soft)]/40"
        }`}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onOpen={() => onOpenTask(task)} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <button
            onClick={onAddTask}
            className="flex flex-1 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] py-6 text-xs text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Add a task
          </button>
        )}
      </div>
    </div>
  );
}
