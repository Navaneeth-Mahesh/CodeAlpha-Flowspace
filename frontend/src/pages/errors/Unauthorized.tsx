import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

export default function Unauthorized() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleSwitchAccount = () => {
    logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-bg)] px-6 text-center">
      <Logo />
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-danger-soft)]">
        <ShieldAlert className="h-8 w-8 text-[var(--color-danger)]" />
      </span>
      <div>
        <h1 className="font-[var(--font-display)] text-3xl font-semibold text-[var(--color-text)]">
          You don't have access to this
        </h1>
        <p className="mt-2 max-w-sm text-sm text-[var(--color-text-secondary)]">
          {user
            ? `${user.email} doesn't have permission to view this page. Ask a workspace admin for access, or switch accounts.`
            : "Sign in with an account that has permission to view this page."}
        </p>
      </div>
      <div className="flex gap-3">
        <Link to={ROUTES.dashboard}>
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
        {user && <Button onClick={handleSwitchAccount}>Switch account</Button>}
      </div>
    </div>
  );
}
