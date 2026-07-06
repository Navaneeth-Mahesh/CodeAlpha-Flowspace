import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { AssigneeStack } from "@/components/tasks/AssigneeStack";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { formatDueDate, isOverdue } from "@/utils/date";
import { PRIORITY_ORDER } from "@/constants/priority";
import { cn } from "@/utils/cn";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";

type SortKey = "title" | "status" | "priority" | "dueDate";

export function TaskTableView({ project, tasks, onOpenTask }: { project: Project; tasks: Task[]; onOpenTask: (task: Task) => void }) {
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [asc, setAsc] = useState(true);

  const columnName = (id: string) => project.columns.find((c) => c.id === id)?.name ?? id;

  const sorted = [...tasks].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "title") cmp = a.title.localeCompare(b.title);
    if (sortKey === "status") cmp = columnName(a.status).localeCompare(columnName(b.status));
    if (sortKey === "priority") cmp = PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
    if (sortKey === "dueDate") cmp = (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) - (b.dueDate ? new Date(b.dueDate).getTime() : Infinity);
    return asc ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(true);
    }
  };

  const HeaderCell = ({ label, sortableKey }: { label: string; sortableKey: SortKey }) => (
    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
      <button onClick={() => toggleSort(sortableKey)} className="flex items-center gap-1 hover:text-[var(--color-text)]">
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)]">
      <table className="w-full min-w-[720px] border-collapse bg-[var(--color-surface)]">
        <thead className="border-b border-[var(--color-border)]">
          <tr>
            <HeaderCell label="Task" sortableKey="title" />
            <HeaderCell label="Status" sortableKey="status" />
            <HeaderCell label="Priority" sortableKey="priority" />
            <HeaderCell label="Due" sortableKey="dueDate" />
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Assignees</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {sorted.map((task) => (
            <tr key={task._id} onClick={() => onOpenTask(task)} className="cursor-pointer hover:bg-[var(--color-surface-hover)]">
              <td className="px-4 py-3 text-sm text-[var(--color-text)]">{task.title}</td>
              <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{columnName(task.status)}</td>
              <td className="px-4 py-3">
                <PriorityBadge priority={task.priority} />
              </td>
              <td className={cn("px-4 py-3 text-sm", isOverdue(task.dueDate) && task.status !== "done" ? "text-[var(--color-danger)]" : "text-[var(--color-text-secondary)]")}>
                {formatDueDate(task.dueDate) || "—"}
              </td>
              <td className="px-4 py-3">
                <AssigneeStack users={task.assignees} max={3} />
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-16 text-center text-sm text-[var(--color-text-muted)]">
                No tasks yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
