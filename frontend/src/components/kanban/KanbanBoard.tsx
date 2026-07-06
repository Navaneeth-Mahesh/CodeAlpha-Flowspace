import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { TaskCard } from "@/components/kanban/TaskCard";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";

export function KanbanBoard({
  project,
  tasks,
  onOpenTask,
  onCreateTask,
  onUpdateTask,
}: {
  project: Project;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onCreateTask: (status: string) => void;
  onUpdateTask: (id: string, data: Partial<Task>) => void;
}) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const columns = useMemo(() => [...project.columns].sort((a, b) => a.order - b.order), [project.columns]);

  const tasksByColumn = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const col of columns) map[col.id] = [];
    for (const task of tasks) {
      if (!map[task.status]) map[task.status] = [];
      map[task.status].push(task);
    }
    for (const key of Object.keys(map)) map[key].sort((a, b) => a.order - b.order);
    return map;
  }, [columns, tasks]);

  const findColumnOfTask = (taskId: string) => tasks.find((t) => t._id === taskId)?.status;

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceStatus = findColumnOfTask(activeId);
    const isOverColumn = columns.some((c) => c.id === overId);
    const targetStatus = isOverColumn ? overId : findColumnOfTask(overId);
    if (!sourceStatus || !targetStatus) return;

    const destinationTasks = tasksByColumn[targetStatus] ?? [];
    let newOrder = destinationTasks.length;
    if (!isOverColumn) {
      const overIndex = destinationTasks.findIndex((t) => t._id === overId);
      if (overIndex >= 0) newOrder = overIndex;
    }

    if (sourceStatus === targetStatus && newOrder === destinationTasks.findIndex((t) => t._id === activeId)) {
      return; // no real change
    }

    onUpdateTask(activeId, { status: targetStatus, order: newOrder });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={tasksByColumn[col.id] ?? []}
            onOpenTask={onOpenTask}
            onAddTask={() => onCreateTask(col.id)}
          />
        ))}
      </div>
      <DragOverlay>{activeTask && <TaskCard task={activeTask} onOpen={() => {}} />}</DragOverlay>
    </DndContext>
  );
}
