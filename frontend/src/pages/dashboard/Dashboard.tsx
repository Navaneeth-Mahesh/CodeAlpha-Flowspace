import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, FolderKanban, ListChecks, AlertCircle, CalendarClock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AssigneeStack } from "@/components/tasks/AssigneeStack";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { taskService } from "@/services/task.service";
import { formatDueDate, isOverdue } from "@/utils/date";
import { ROUTES } from "@/constants/routes";
import type { Task } from "@/types/task";

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    taskService
      .mine()
      .then(setMyTasks)
      .finally(() => setTasksLoading(false));
  }, []);

  const today = myTasks.filter((t) => t.dueDate && formatDueDate(t.dueDate) === "Today" && t.status !== "done");
  const overdue = myTasks.filter((t) => isOverdue(t.dueDate) && t.status !== "done");
  const upcoming = myTasks
    .filter((t) => t.dueDate && !isOverdue(t.dueDate) && formatDueDate(t.dueDate) !== "Today" && t.status !== "done")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const recentProjects = projects.slice(0, 4);
  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter((t) => t.status === "done").length;

  const isEmpty = !projectsLoading && !tasksLoading && projects.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">
            Welcome back, {user?.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Here's what's happening across your work.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      {isEmpty ? (
        <Card className="mt-10 flex flex-col items-center gap-4 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
            <FolderKanban className="h-7 w-7 text-[var(--color-primary)]" />
          </span>
          <div>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-[var(--color-text)]">
              Nothing here yet
            </h2>
            <p className="mt-1 max-w-sm text-sm text-[var(--color-text-secondary)]">
              Create your first project to start tracking tasks. Invite teammates once you have
              something worth sharing.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create a project
          </Button>
        </Card>
      ) : (
        <>
          {/* Stat cards */}
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-soft)]">
                <FolderKanban className="h-5 w-5 text-[var(--color-primary)]" />
              </span>
              <div>
                <p className="font-[var(--font-mono)] text-xl text-[var(--color-text)]">{projects.length}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Active projects</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-success-soft)]">
                <ListChecks className="h-5 w-5 text-[var(--color-success)]" />
              </span>
              <div>
                <p className="font-[var(--font-mono)] text-xl text-[var(--color-text)]">
                  {completedTasks}/{totalTasks}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">Tasks completed</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-warning-soft)]">
                <CalendarClock className="h-5 w-5 text-[var(--color-warning)]" />
              </span>
              <div>
                <p className="font-[var(--font-mono)] text-xl text-[var(--color-text)]">{today.length}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Due today</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-danger-soft)]">
                <AlertCircle className="h-5 w-5 text-[var(--color-danger)]" />
              </span>
              <div>
                <p className="font-[var(--font-mono)] text-xl text-[var(--color-text)]">{overdue.length}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Overdue</p>
              </div>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Recent projects */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Recent projects
                </h2>
                <Link to={ROUTES.projects} className="text-xs font-medium text-[var(--color-primary)] hover:underline">
                  View all
                </Link>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {recentProjects.map((p) => (
                  <Card
                    key={p._id}
                    className="cursor-pointer transition-transform hover:-translate-y-0.5"
                    onClick={() => navigate(ROUTES.project(p._id))}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-base"
                        style={{ backgroundColor: `${p.color}22` }}
                      >
                        {p.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--color-text)]">{p.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {p.doneCount ?? 0}/{p.taskCount ?? 0} tasks done
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Upcoming deadlines */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                Upcoming deadlines
              </h2>
              <Card className="mt-3 flex flex-col gap-3 p-4">
                {overdue.slice(0, 2).map((t) => (
                  <TaskRow key={t._id} task={t} overdue />
                ))}
                {upcoming.length === 0 && overdue.length === 0 ? (
                  <p className="py-6 text-center text-sm text-[var(--color-text-muted)]">
                    Nothing on the calendar. You're clear.
                  </p>
                ) : (
                  upcoming.map((t) => <TaskRow key={t._id} task={t} />)
                )}
              </Card>
            </div>
          </div>
        </>
      )}

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function TaskRow({ task, overdue = false }: { task: Task; overdue?: boolean }) {
  const project = typeof task.project === "object" ? task.project : null;
  return (
    <Link
      to={project ? `${ROUTES.project(project._id)}?task=${task._id}` : "#"}
      className="flex items-center gap-3 rounded-[var(--radius-md)] p-2 hover:bg-[var(--color-surface-hover)]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[var(--color-text)]">{task.title}</p>
        <div className="mt-1 flex items-center gap-1.5">
          {overdue ? (
            <Badge tone="danger">Overdue</Badge>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)]">{formatDueDate(task.dueDate)}</span>
          )}
          <PriorityBadge priority={task.priority} />
        </div>
      </div>
      <AssigneeStack users={task.assignees} max={1} />
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" />
    </Link>
  );
}
