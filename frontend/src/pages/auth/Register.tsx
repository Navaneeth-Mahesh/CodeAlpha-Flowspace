import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, getPasswordStrength, type RegisterFormValues } from "@/utils/validation";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";

const STRENGTH_COLORS = [
  "var(--color-danger)",
  "var(--color-danger)",
  "var(--color-warning)",
  "var(--color-primary)",
  "var(--color-success)",
];

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const password = watch("password") ?? "";
  const strength = getPasswordStrength(password);

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    const result = await registerUser(values.name, values.email, values.password);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    navigate(ROUTES.profileSetup, { replace: true });
  };

  return (
    <AuthLayout title="Create your account" subtitle="Set up your workspace in under a minute.">
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
          label="Full name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          icon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <Input
            label="Password"
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
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="h-1 flex-1 rounded-full bg-[var(--color-border)] transition-colors"
                    style={{
                      backgroundColor: i < strength.score ? STRENGTH_COLORS[strength.score] : undefined,
                    }}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">{strength.label}</p>
            </div>
          )}
        </div>

        <Input
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          icon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Checkbox
          label={
            <span>
              I agree to the{" "}
              <a href="#" className="text-[var(--color-primary)] hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-[var(--color-primary)] hover:underline">
                Privacy Policy
              </a>
            </span>
          }
          {...register("agree")}
        />
        {errors.agree?.message && (
          <p className={cn("-mt-3 text-xs text-[var(--color-danger)]")}>{errors.agree.message}</p>
        )}

        <Button type="submit" isLoading={isSubmitting} fullWidth className="mt-2">
          Create account
          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
        Already have an account?{" "}
        <Link to={ROUTES.login} className="font-medium text-[var(--color-primary)] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
