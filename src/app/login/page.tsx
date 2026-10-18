import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { getSession } from "@/lib/auth";
import { AuthForm } from "./AuthForm";

export const metadata: Metadata = {
  title: "Sign in",
};

function safeCallbackUrl(value: string | string[] | undefined) {
  const url = Array.isArray(value) ? value[0] : value;
  // Only allow same-origin relative paths. Rejecting "//", backslashes and
  // whitespace blocks protocol-relative tricks like "/\\evil.example".
  return url && /^\/(?![\\/])[^\\\s]*$/.test(url) ? url : "/interview";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const callbackUrl = safeCallbackUrl(params.callbackUrl);
  const session = await getSession();
  if (session) redirect(callbackUrl);

  const initialMode = params.mode === "register" ? "register" : "signin";

  return (
    <main className="grid min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <section className="flex flex-col px-4 py-6 sm:px-10 lg:px-16">
        <Logo />
        <div className="flex flex-1 items-center py-12">
          <div className="w-full max-w-sm">
            <AuthForm initialMode={initialMode} callbackUrl={callbackUrl} />
          </div>
        </div>
      </section>
      <aside className="relative hidden overflow-hidden border-l bg-surface-raised lg:block">
        <div className="absolute inset-x-12 bottom-12 max-w-md">
          <p className="text-2xl font-medium leading-snug tracking-tight text-ink">
            Say your answers out loud before the real thing. You will hear what works.
          </p>
          <p className="mt-4 text-sm text-ink-muted">
            Practice with Coco or Mimi, two voice interviewers that ask follow-up questions.
          </p>
        </div>
      </aside>
    </main>
  );
}
