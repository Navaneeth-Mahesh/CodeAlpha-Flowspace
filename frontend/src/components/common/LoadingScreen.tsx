import { Logo } from "@/components/common/Logo";
import { Spinner } from "@/components/ui/Spinner";

export function LoadingScreen({ label = "Loading Flowspace…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[var(--color-bg)]">
      <Logo />
      <Spinner size={22} />
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}
