# Flowspace — Frontend

React + TypeScript + Vite frontend for Flowspace. Talks to the API in `../backend`.

## Setup

```bash
cp .env.example .env   # VITE_API_URL — defaults to http://localhost:5000/api
npm install
npm run dev
```

## Where things live

```
src/
  components/
    ui/          Reusable primitives: Button, Input, Checkbox, Card, Badge, Avatar, Spinner, Modal, Drawer
    common/      Logo, ThemeToggle, LoadingScreen, ProtectedRoute, BoardPreview
    layout/      Sidebar, AppHeader, NotificationBell, ProfileMenu, CommandPalette, SiteHeader/Footer
    kanban/      KanbanBoard, KanbanColumn, TaskCard, TaskListView, TaskTableView, TaskCalendarView
    tasks/       TaskDetailDrawer, CommentsSection, AssigneePicker, PriorityBadge, AssigneeStack
    projects/    CreateProjectModal
    team/        InviteMemberModal, MembersTab
  pages/
    Landing.tsx
    auth/        Login, Register, ForgotPassword, ResetPassword, ProfileSetup
    errors/      NotFound, Unauthorized
    dashboard/   Dashboard
    projects/    ProjectsList, ProjectDetail
    team/        Team
    notifications/ Notifications
    settings/    Settings (+ tabs/ for Profile, Appearance, Security, Notifications)
  layouts/       AuthLayout (split-panel auth shell), AppShell (sidebar + header for the app)
  contexts/ + providers/   Theme, Auth, Projects, Notifications — React context/provider pairs
  hooks/         useTheme, useAuth, useProjects, useNotifications, useProjectTasks
  services/      api.ts (axios + token handling), auth/project/task/notification/user.service.ts, socket.ts
  utils/         cn, validation (zod), avatar, date, cn
  constants/     routes, priority, notifications, projectStyle
  types/         User, Project, Task, Comment, Notification
```

## Design system

"Signal & Slate" — cool charcoal base, signal-blue primary, brass-gold accent. Dark/light themes as
CSS variables in `src/index.css`, toggled via a `.dark`/`.light` class on `<html>`. Custom utility
classes: `.surface-neu` (neumorphic card), `.surface-neu-inset` (inputs/wells), `.surface-glass`
(modals/drawers/dropdowns), `.ring-glow` (animated gradient ring, used sparingly).

## Real-time

`src/services/socket.ts` opens a Socket.IO connection authenticated with the same JWT used for HTTP
calls. `useProjectTasks` joins/leaves a `project:<id>` room per open project; `NotificationsProvider`
listens globally for `notification:new`.
