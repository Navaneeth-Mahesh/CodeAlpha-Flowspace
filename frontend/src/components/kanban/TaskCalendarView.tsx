import { useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Task } from "@/types/task";

export function TaskCalendarView({ tasks, onOpenTask }: { tasks: Task[]; onOpenTask: (task: Task) => void }) {
  const [cursor, setCursor] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = format(new Date(task.dueDate), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    }
    return map;
  }, [tasks]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-text)]">{format(cursor, "MMMM yyyy")}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCursor((c) => subMonths(c, 1))} className="surface-neu flex h-8 w-8 items-center justify-center rounded-full" aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setCursor(new Date())} className="surface-neu rounded-full px-3 py-1.5 text-xs font-medium">
            Today
          </button>
          <button onClick={() => setCursor((c) => addMonths(c, 1))} className="surface-neu flex h-8 w-8 items-center justify-center rounded-full" aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-border)]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-[var(--color-surface-soft)] px-2 py-1.5 text-center text-xs font-semibold uppercase text-[var(--color-text-muted)]">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDay.get(key) ?? [];
          return (
            <div
              key={key}
              className={cn(
                "min-h-[100px] bg-[var(--color-surface)] p-1.5",
                !isSameMonth(day, cursor) && "opacity-40",
                isSameDay(day, new Date()) && "ring-1 ring-inset ring-[var(--color-primary)]"
              )}
            >
              <p className="mb-1 text-xs text-[var(--color-text-muted)]">{format(day, "d")}</p>
              <div className="flex flex-col gap-1">
                {dayTasks.slice(0, 3).map((t) => (
                  <button
                    key={t._id}
                    onClick={() => onOpenTask(t)}
                    className="flex items-center gap-1 truncate rounded-[var(--radius-sm)] bg-[var(--color-surface-soft)] px-1.5 py-1 text-left text-[11px] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                  >
                    <span className="truncate flex-1">{t.title}</span>
                  </button>
                ))}
                {dayTasks.length > 3 && <p className="text-[10px] text-[var(--color-text-muted)]">+{dayTasks.length - 3} more</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
