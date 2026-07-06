import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Bell,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Star,
  Plus,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useProjects } from "@/hooks/useProjects";
import { useNotifications } from "@/hooks/useNotifications";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { to: ROUTES.dashboard, icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: ROUTES.projects, icon: FolderKanban, label: "Projects" },
  { to: ROUTES.team, icon: Users, label: "Team" },
];

export function Sidebar({ onCreateProject }: { onCreateProject: () => void }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("flowspace-sidebar") === "collapsed");
  const { projects } = useProjects();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("flowspace-sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  };

  const favorites = projects.filter((p) => p.isFavorite);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <Logo withWordmark={!collapsed} />
      </div>

      <div className="px-3">
        <button
          onClick={onCreateProject}
          className={cn(
            "flex w-full items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-2.5 text-sm font-medium text-white transition-transform active:scale-[0.98]",
            collapsed && "justify-center px-0"
          )}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && "New project"}
        </button>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto px-3" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]"
              )
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && item.label}
          </NavLink>
        ))}

        <NavLink
          to={ROUTES.notifications}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]"
            )
          }
        >
          <span className="relative">
            <Bell className="h-[18px] w-[18px] shrink-0" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--color-danger)] text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </span>
          {!collapsed && "Notifications"}
        </NavLink>

        {!collapsed && favorites.length > 0 && (
          <div className="mt-6">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Favorites
            </p>
            <div className="mt-1 flex flex-col gap-0.5">
              {favorites.map((p) => (
                <button
                  key={p._id}
                  onClick={() => navigate(ROUTES.project(p._id))}
                  className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]"
                >
                  <span className="text-sm">{p.icon}</span>
                  <span className="truncate">{p.name}</span>
                  <Star className="ml-auto h-3 w-3 shrink-0 fill-[var(--color-accent)] text-[var(--color-accent)]" />
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="flex flex-col gap-1 border-t border-[var(--color-border)] px-3 py-3">
        <NavLink
          to={ROUTES.settings}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]"
            )
          }
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && "Settings"}
        </NavLink>
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]"
        >
          {collapsed ? <ChevronsRight className="h-[18px] w-[18px]" /> : <ChevronsLeft className="h-[18px] w-[18px]" />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}
