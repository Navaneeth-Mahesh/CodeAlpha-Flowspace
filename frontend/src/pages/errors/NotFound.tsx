import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/common/Logo";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-bg)] px-6 text-center">
      <Logo />
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-soft)]">
        <Compass className="h-8 w-8 text-[var(--color-text-muted)]" />
      </span>
      <div>
        <h1 className="font-[var(--font-display)] text-3xl font-semibold text-[var(--color-text)]">
          This page wandered off the board
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Nothing lives at this URL. It may have been moved, archived, or never existed.
        </p>
      </div>
      <Link to={ROUTES.dashboard}>
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
