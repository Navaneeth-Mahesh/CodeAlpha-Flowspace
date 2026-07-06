import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/ThemeToggle";

const HIGHLIGHTS = [
  { stat: "12 min", label: "average time to first project" },
  { stat: "0", label: "context-switches between chat and board" },
  { stat: "3 views", label: "board, timeline, and table — always in sync" },
];

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-[var(--color-bg)]">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 bg-[var(--color-surface)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-primary), transparent 70%)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
        />

        <Logo className="relative z-10" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 max-w-md"
        >
          <p className="font-[var(--font-display)] text-3xl font-semibold leading-tight text-[var(--color-text)]">
            The board moves at the speed of the conversation.
          </p>
          <p className="mt-3 text-[var(--color-text-secondary)]">
            Flowspace keeps kanban, timeline, and table views of the same work in lockstep, so
            planning and doing never drift apart.
          </p>
        </motion.div>

        <div className="relative z-10 grid grid-cols-3 gap-6">
          {HIGHLIGHTS.map((h) => (
            <div key={h.label}>
              <p className="font-[var(--font-mono)] text-2xl text-[var(--color-primary)]">{h.stat}</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)] leading-snug">{h.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between">
          <Logo className="lg:hidden" />
          <span className="lg:hidden" />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mx-auto w-full max-w-sm"
          >
            <h1 className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
