"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fieldErrors, registerSchema, signInSchema } from "@/lib/validation";

type Mode = "signin" | "register";
type Errors = Partial<Record<"name" | "email" | "password" | "form", string>>;

export function AuthForm({ initialMode, callbackUrl }: { initialMode: Mode; callbackUrl: string }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);

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
      return false;
    }
    router.replace(callbackUrl);
    router.refresh();
    return true;
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
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">
        {isRegister ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        {isRegister ? "Free to use. Your sessions stay private to you." : "Sign in to continue practicing."}
      </p>

      <div role="tablist" aria-label="Authentication mode" className="mt-8 grid grid-cols-2 rounded-full border bg-surface p-1">
        {(["signin", "register"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={mode === item}
            onClick={() => switchMode(item)}
            className={cn(
              "h-9 rounded-full text-sm font-medium transition-colors",
              mode === item ? "bg-surface-raised text-ink" : "text-ink-muted hover:text-ink"
            )}
          >
            {item === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-5">
        <AnimatePresence initial={false}>
          {isRegister && (
            <motion.div
              key="name"
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <Field
                label="Full name"
                autoComplete="name"
                value={values.name}
                onChange={update("name")}
                error={errors.name}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={values.email}
          onChange={update("email")}
          error={errors.email}
        />
        <Field
          label="Password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          value={values.password}
          onChange={update("password")}
          error={errors.password}
          hint={isRegister ? "At least 8 characters." : undefined}
        />

        {errors.form && (
          <p role="alert" className="rounded-field border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {errors.form}
          </p>
        )}

        <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          {isRegister ? "Create account" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

function Field({ label, error, hint, className, ...props }: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          "h-11 rounded-field border bg-surface px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent focus-visible:outline-none focus:ring-2 focus:ring-accent/25",
          error && "border-danger focus:border-danger focus:ring-danger/25",
          className
        )}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
