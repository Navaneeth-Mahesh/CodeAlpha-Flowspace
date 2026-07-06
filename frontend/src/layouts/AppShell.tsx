import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";

export function AppShell({ title }: { title?: string }) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar onCreateProject={() => setCreateOpen(true)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={title} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
