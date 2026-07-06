import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  KanbanSquare,
  List,
  Calendar as CalendarIcon,
  Table2,
  Users,
  Star,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TaskListView } from "@/components/kanban/TaskListView";
import { TaskTableView } from "@/components/kanban/TaskTableView";
import { TaskCalendarView } from "@/components/kanban/TaskCalendarView";
import { MembersTab } from "@/components/team/MembersTab";
import { TaskDetailDrawer } from "@/components/tasks/TaskDetailDrawer";
import { useProjects } from "@/hooks/useProjects";
import { useProjectTasks } from "@/hooks/useProjectTasks";
import { projectService } from "@/services/project.service";
import { cn } from "@/utils/cn";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";

type ViewTab = "board" | "list" | "calendar" | "table" | "members";

const TABS: { key: ViewTab; label: string; icon: typeof KanbanSquare }[] = [
  { key: "board", label: "Board", icon: KanbanSquare },
  { key: "list", label: "List", icon: List },
  { key: "calendar", label: "Calendar", icon: CalendarIcon },
  { key: "table", label: "Table", icon: Table2 },
  { key: "members", label: "Members", icon: Users },
];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleFavorite } = useProjects();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<ViewTab>("board");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<string | undefined>();

  const { tasks, loading: tasksLoading, updateTask, setTasks } = useProjectTasks(id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    projectService
      .get(id)
      .then(setProject)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const taskId = searchParams.get("task");
    if (taskId && tasks.length) {
      const found = tasks.find((t) => t._id === taskId);
      if (found) {
        setSelectedTask(found);
        setDrawerOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, search, priorityFilter]);

  if (loading) return <LoadingScreen label="Loading project…" />;
  if (error || !project) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm text-[var(--color-danger)]">{error ?? "Project not found"}</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedTask(null);
    if (searchParams.has("task")) {
      searchParams.delete("task");
      setSearchParams(searchParams, { replace: true });
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] text-2xl" style={{ backgroundColor: `${project.color}22` }}>
            {project.icon}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">{project.name}</h1>
              <button
                onClick={async () => {
                  await toggleFavorite(project._id);
                  setProject((p) => (p ? { ...p, isFavorite: !p.isFavorite } : p));
                }}
                aria-label="Toggle favorite"
              >
                <Star className={cn("h-4 w-4", project.isFavorite ? "fill-[var(--color-accent)] text-[var(--color-accent)]" : "text-[var(--color-text-muted)]")} />
              </button>
            </div>
            {project.description && <p className="mt-1 max-w-lg text-sm text-[var(--color-text-secondary)]">{project.description}</p>}
          </div>
        </div>
        <Button
          onClick={() => {
            setSelectedTask(null);
            setCreateStatus(project.columns[0]?.id);
            setDrawerOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                tab === t.key ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-soft)]"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab !== "members" && (
          <div className="flex items-center gap-2">
            <div className="w-48">
              <Input placeholder="Search tasks…" icon={<Search className="h-3.5 w-3.5" />} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="surface-neu-inset h-11 rounded-[var(--radius-md)] pl-8 pr-3 text-sm text-[var(--color-text)] outline-none appearance-none"
              >
                <option value="">All priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-muted)]" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        {tasksLoading && tab !== "members" ? (
          <p className="py-16 text-center text-sm text-[var(--color-text-muted)]">Loading tasks…</p>
        ) : (
          <>
            {tab === "board" && (
              <KanbanBoard
                project={project}
                tasks={filteredTasks}
                onOpenTask={(task) => {
                  setSelectedTask(task);
                  setDrawerOpen(true);
                }}
                onCreateTask={(status) => {
                  setSelectedTask(null);
                  setCreateStatus(status);
                  setDrawerOpen(true);
                }}
                onUpdateTask={(taskId, data) => updateTask(taskId, data)}
              />
            )}
            {tab === "list" && (
              <TaskListView
                project={project}
                tasks={filteredTasks}
                onOpenTask={(task) => {
                  setSelectedTask(task);
                  setDrawerOpen(true);
                }}
              />
            )}
            {tab === "calendar" && (
              <TaskCalendarView
                tasks={filteredTasks}
                onOpenTask={(task) => {
                  setSelectedTask(task);
                  setDrawerOpen(true);
                }}
              />
            )}
            {tab === "table" && (
              <TaskTableView
                project={project}
                tasks={filteredTasks}
                onOpenTask={(task) => {
                  setSelectedTask(task);
                  setDrawerOpen(true);
                }}
              />
            )}
            {tab === "members" && <MembersTab project={project} onChange={setProject} />}
          </>
        )}
      </div>

      <TaskDetailDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        project={project}
        task={selectedTask}
        defaultStatus={createStatus}
        onCreated={(task) => {
          setTasks((prev) => [...prev, task]);
          setSelectedTask(task);
        }}
        onUpdated={(taskId, data) => updateTask(taskId, data).catch(() => {})}
        onDeleted={(taskId) => {
          setTasks((prev) => prev.filter((t) => t._id !== taskId));
          closeDrawer();
        }}
      />
    </div>
  );
}
