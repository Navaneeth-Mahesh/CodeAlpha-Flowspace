import { Link } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          <a href="#features" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
            Features
          </a>
          <a href="#views" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
            Views
          </a>
          <a href="#pricing" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to={ROUTES.login}>
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link to={ROUTES.register}>
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
