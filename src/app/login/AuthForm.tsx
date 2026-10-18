"use client";

import { useId, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { fieldErrors, registerSchema, signInSchema } from "@/lib/validation";

type Mode = "signin" | "register";
type Errors = Partial<Record<"name" | "email" | "password" | "form", string>>;

const ease = [0.16, 1, 0.3, 1] as const;

export function AuthForm({ initialMode, callbackUrl }: { initialMode: Mode; callbackUrl: string }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isRegister = mode === "register";

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
  }

  function update(field: keyof typeof values) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  async function signInWith(email: string, password: string) {
    const result = await signIn("credentials", { email, password, redirect: false });
    if (!result || result.error) {
      setErrors({
        form:
          result?.error === "RateLimited"
            ? "Too many attempts. Wait a moment and try again."
            : "That email and password do not match an account.",
      });
      return;
    }
    router.replace(callbackUrl);
    router.refresh();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const parsed = isRegister ? registerSchema.safeParse(values) : signInSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setPending(true);
    setErrors({});
    try {
      if (isRegister) {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setErrors({ ...(data.fields ?? {}), form: data.error ?? "Could not create your account." });
          return;
        }
      }
      await signInWith(parsed.data.email, values.password);
    } catch {
      setErrors({ form: "Network error. Check your connection and try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="relative w-full max-w-md"
    >
      <div className="rounded-2xl border border-white/[0.08] bg-surface p-7 sm:p-9">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="size-12" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-ink-muted">
            Your personal AI interviewer that helps you practice, improve and{" "}
            <span className="font-medium text-accent">land your dream job</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-4">
          <AnimatePresence initial={false}>
            {isRegister && (
              <motion.div
                key="name"
                initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease }}
                className="overflow-hidden"
              >
                <Field
                  label="Full name"
                  icon={User}
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  value={values.name}
                  onChange={update("name")}
                  error={errors.name}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <Field
            label="Email"
            icon={Mail}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={update("email")}
            error={errors.email}
          />
          <Field
            label="Password"
            icon={Lock}
            type={showPassword ? "text" : "password"}
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder={isRegister ? "At least 8 characters" : "Your password"}
            value={values.password}
            onChange={update("password")}
            error={errors.password}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((show) => !show)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="grid size-8 place-items-center rounded-full text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          />

          {errors.form && (
            <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-rose-200">
              {errors.form}
            </p>
          )}

          <Button type="submit" size="lg" disabled={pending} className="group mt-2 w-full">
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {pending ? (isRegister ? "Creating account" : "Signing in") : isRegister ? "Create account" : "Sign in"}
            {!pending && <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />}
          </Button>
        </form>

        <p className="mt-7 text-center text-sm text-ink-muted">
          {isRegister ? "Already have an account?" : "New to Greenroom?"}{" "}
          <button
            type="button"
            onClick={() => switchMode(isRegister ? "signin" : "register")}
            className="font-medium text-accent underline-offset-4 transition-colors hover:text-sky-300 hover:underline"
          >
            {isRegister ? "Sign in" : "Create an account"}
          </button>
        </p>
      </div>
    </motion.div>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: ComponentType<{ className?: string }>;
  error?: string;
  trailing?: React.ReactNode;
};

function Field({ label, icon: Icon, error, trailing, className, ...props }: FieldProps) {
  const id = useId();
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-200">
        {label}
      </label>
      <div
        className={cn(
          "group flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-canvas/60 pl-4 pr-2 transition-colors focus-within:border-accent/70",
          error && "border-danger/70 focus-within:border-danger"
        )}
      >
        <Icon className={cn("size-4 shrink-0 text-ink-muted transition-colors group-focus-within:text-accent", error && "text-danger")} />
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-[#7b8aa3] focus-visible:outline-none",
            className
          )}
          {...props}
        />
        {trailing}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
