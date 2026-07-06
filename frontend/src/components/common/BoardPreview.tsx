import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";

const COLUMNS = [
  {
    title: "In progress",
    tasks: [
      { title: "Redesign onboarding flow", tone: "primary" as const, tag: "Design", initials: "JL", color: "#5B8DEF" },
      { title: "Fix timeline drag snapping", tone: "danger" as const, tag: "Bug", initials: "MK", color: "#F0B84B" },
    ],
  },
  {
    title: "In review",
    tasks: [
      { title: "API rate limit handling", tone: "warning" as const, tag: "Backend", initials: "SR", color: "#3ECF8E" },
    ],
  },
  {
    title: "Done",
    tasks: [
      { title: "Migrate auth to JWT", tone: "success" as const, tag: "Backend", initials: "AT", color: "#FF6B6B" },
    ],
  },
];

export function BoardPreview() {
  return (
    <Card variant="glass" glow className="w-full overflow-x-auto p-5">
      <div className="flex gap-4 min-w-[640px]">
        {COLUMNS.map((col, colIdx) => (
          <motion.div
            key={col.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * colIdx, duration: 0.5, ease: "easeOut" }}
            className="flex-1 min-w-[200px]"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                {col.title}
              </p>
              <span className="text-xs text-[var(--color-text-muted)]">{col.tasks.length}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {col.tasks.map((task) => (
                <div
                  key={task.title}
                  className="rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] p-3"
                >
                  <p className="text-sm text-[var(--color-text)]">{task.title}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge tone={task.tone}>{task.tag}</Badge>
                    <Avatar name={task.title} initials={task.initials} color={task.color} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
