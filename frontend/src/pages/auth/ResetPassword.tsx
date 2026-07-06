import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/utils/validation";
import { authService } from "@/services/auth.service";
import { ROUTES } from "@/constants/routes";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setFormError("This reset link is missing its token. Request a new one.");
      return;
    }
    setFormError(null);
    try {
      await authService.resetPassword(token, values.password);
      setDone(true);
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid reset link">
        <div className="flex flex-col items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-danger-soft)]">
            <AlertTriangle className="h-6 w-6 text-[var(--color-danger)]" />
          </span>
          <p className="text-sm text-[var(--color-text-secondary)]">
            This link is missing its reset token. Request a fresh one from the forgot password page.
          </p>
          <Button onClick={() => navigate(ROUTES.forgotPassword)}>Request new link</Button>
        </div>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout title="Password updated">
        <div className="flex flex-col items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-success-soft)]">
            <CheckCircle2 className="h-6 w-6 text-[var(--color-success)]" />
          </span>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Your password has been changed. Use it next time you sign in.
          </p>
          <Button onClick={() => navigate(ROUTES.login)}>Continue to sign in</Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle="Make it something you haven't used before.">
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
          label="New password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          {...register("password")}
        />
        <Input
          label="Confirm new password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button type="submit" isLoading={isSubmitting} fullWidth className="mt-2">
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
