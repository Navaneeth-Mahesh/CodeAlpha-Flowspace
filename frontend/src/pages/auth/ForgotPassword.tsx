import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/utils/validation";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/constants/routes";

export default function ForgotPassword() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setFormError(null);
    try {
      const result = await authService.forgotPassword(values.email);
      setSentTo(values.email);
      setDevResetUrl(result.devResetUrl ?? null);
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  if (sentTo) {
    return (
      <AuthLayout title="Check your inbox">
        <div className="flex flex-col items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success-soft)]">
            <CheckCircle2 className="h-6 w-6 text-[var(--color-success)]" />
          </span>
          <p className="text-sm text-[var(--color-text-secondary)]">
            If an account exists for <span className="text-[var(--color-text)]">{sentTo}</span>, we've
            sent a link to reset the password. It expires in 30 minutes.
          </p>
          {devResetUrl && (
            <div className="w-full rounded-[var(--radius-md)] bg-[var(--color-warning-soft)] px-3.5 py-2.5 text-xs text-[var(--color-warning)]">
              No SMTP configured on the server, so here's the link directly (dev only):{" "}
              <a href={devResetUrl} className="break-all underline">
                {devResetUrl}
              </a>
            </div>
          )}
          <Link
            to={ROUTES.login}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email tied to your account and we'll send a reset link."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {formError && (
          <div
            role="alert"
            className="rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] px-3.5 py-2.5 text-sm text-[var(--color-danger)]"
          >
            {formError}
          </div>
        )}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />
        <Button type="submit" isLoading={isSubmitting} fullWidth className="mt-2">
          Send reset link
        </Button>
      </form>

      <Link
        to={ROUTES.login}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </AuthLayout>
  );
}
