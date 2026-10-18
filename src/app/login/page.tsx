import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
    <main className="relative flex min-h-[100dvh] flex-col items-center px-4 py-6 sm:py-10">
      <div className="flex w-full max-w-md items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Home
        </Link>
      </div>

      <div className="flex w-full flex-1 flex-col items-center justify-center py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex -space-x-3">
            {(["coco", "mimi"] as const).map((id) => (
              <span key={id} className="relative size-11 overflow-hidden rounded-full bg-surface-raised ring-2 ring-canvas">
                <Image
                  src={`/images/portrait-${id}.webp`}
                  alt=""
                  width={880}
                  height={id === "coco" ? 1416 : 1202}
                  sizes="44px"
                  className="absolute left-1/2 top-[-3px] w-[175%] max-w-none -translate-x-1/2"
                />
              </span>
            ))}
          </div>
          <p className="text-sm text-ink-muted">Ms. Coco and Mr. Mimi are ready when you are.</p>
        </div>

        <AuthForm initialMode={initialMode} callbackUrl={callbackUrl} />

        <p className="mt-6 text-center text-xs text-ink-muted">
          Practice out loud with an AI interviewer and get feedback the moment you finish.
        </p>
      </div>
    </main>
  );
}
