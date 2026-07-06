import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  KanbanSquare,
  GanttChartSquare,
  Table2,
  Calendar,
  MessagesSquare,
  Users,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BoardPreview } from "@/components/common/BoardPreview";
import { ROUTES } from "@/constants/routes";

const FEATURES = [
  {
    icon: KanbanSquare,
    title: "Boards that don't lose state",
    desc: "Drag a card between columns and its status, assignee, and history update everywhere at once — list, calendar, and table included.",
  },
  {
    icon: GanttChartSquare,
    title: "Timeline for dependencies",
    desc: "See what's blocking what before it becomes a standup surprise. Reschedule by dragging, and dependents shift with it.",
  },
  {
    icon: MessagesSquare,
    title: "Comments where the work is",
    desc: "Threaded replies, mentions, and reactions live on the task itself — no separate chat thread to lose track of.",
  },
  {
    icon: Users,
    title: "Roles that actually restrict",
    desc: "Owner, Admin, Manager, Member, and Guest each see a different app — not just a different label.",
  },
  {
    icon: Calendar,
    title: "One calendar, every deadline",
    desc: "Every due date across every project you're in, in a single monthly, weekly, or agenda view.",
  },
  {
    icon: Table2,
    title: "Spreadsheet power, board simplicity",
    desc: "Sort, group, and bulk-edit hundreds of tasks in table view, then flip back to the board without losing your filters.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 md:pt-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="inline-flex items-center rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
              Now with real-time timeline sync
            </span>
            <h1 className="mt-5 font-[var(--font-display)] text-4xl font-semibold leading-[1.1] text-[var(--color-text)] md:text-5xl">
              Plan the work. Watch it move. Never chase a status update.
            </h1>
            <p className="mt-5 text-base text-[var(--color-text-secondary)] md:text-lg">
              Flowspace gives your team one shared model of the work — board, timeline, calendar, and
              table are just different angles on the same tasks, always in sync.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to={ROUTES.register}>
                <Button size="lg">
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={ROUTES.login}>
                <Button size="lg" variant="secondary">
                  Sign in
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-[var(--color-text-muted)]">
              No credit card required. Free for teams up to 10.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            <BoardPreview />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-xl">
          <h2 className="font-[var(--font-display)] text-3xl font-semibold text-[var(--color-text)]">
            Built for how teams actually track work
          </h2>
          <p className="mt-3 text-[var(--color-text-secondary)]">
            Not a checklist app pretending to be a project tool. Every view below reads from the same
            source of truth.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08, ease: "easeOut" }}
            >
              <Card className="h-full">
                <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-soft)]">
                  <feature.icon className="h-5 w-5 text-[var(--color-primary)]" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-[var(--color-text)]">{feature.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{feature.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Card variant="glass" className="flex flex-col items-center gap-5 py-14 text-center">
          <h2 className="font-[var(--font-display)] text-3xl font-semibold text-[var(--color-text)]">
            Give your team one place to plan
          </h2>
          <p className="max-w-md text-[var(--color-text-secondary)]">
            Set up your first project in the time it takes to make coffee.
          </p>
          <Link to={ROUTES.register}>
            <Button size="lg">
              Create your workspace
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </section>

      <SiteFooter />
    </div>
  );
}
