import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Check, Github, Mic, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { Logo } from "@/components/ui/Logo";
import { buttonVariants } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { interviewers } from "@/lib/interviewers";

const REPO_URL = "https://github.com/colombefioren/AI-ASSISTANT";
const START_HREF = "/login?mode=register";

export default function LandingPage() {
  return (
    <>
      <ScrollReveal />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DemoPreviewSection />
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/[0.06] bg-canvas/90 backdrop-blur-md">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-8 text-sm text-ink-muted md:flex">
          <a href="#features" className="transition-colors hover:text-ink">
            Features
          </a>
          <a href="#demo" className="transition-colors hover:text-ink">
            Demo
          </a>
          <a href="#pricing" className="transition-colors hover:text-ink">
            Pricing
          </a>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Sign in
          </Link>
          <Link href={START_HREF} className={buttonVariants({ size: "sm", className: "group" })}>
            Get Started
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </nav>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 md:pt-36">
      <div data-reveal="stagger" className="mx-auto max-w-4xl text-center">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-ink-muted">
          <Sparkles className="size-3.5 text-accent" aria-hidden />
          Voice interviews with 3D interviewers
        </p>
        <h1 className="mt-7 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl md:text-6xl lg:text-7xl">
          Ace your next interview with{" "}
          <span className="bg-accent-gradient bg-clip-text text-transparent">AI coaching</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl">
          Practice with realistic AI interviewers, receive instant feedback, and gain the confidence to land your dream
          job.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={START_HREF} className={buttonVariants({ size: "lg", className: "group" })}>
            Start Practicing
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <a href="#features" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            Learn More
          </a>
        </div>
      </div>

      <div data-reveal="fade" className="relative mx-auto mt-16 max-w-5xl md:mt-20">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-b from-surface-raised to-surface">
          <div className="grid grid-cols-2 items-end px-4 pt-14 sm:px-16 sm:pt-20">
            {(["coco", "mimi"] as const).map((id) => (
              <figure key={id} className="relative flex flex-col items-center">
                <Image
                  src={`/images/portrait-${id}.webp`}
                  alt={`${interviewers[id].displayName}, a 3D AI interviewer`}
                  width={880}
                  height={id === "coco" ? 1416 : 1202}
                  priority
                  sizes="(min-width: 1024px) 380px, 45vw"
                  className={id === "coco" ? "h-auto w-[78%]" : "h-auto w-[86%]"}
                />
                <figcaption className="absolute bottom-4 rounded-full border border-white/10 bg-canvas/80 px-3.5 py-1.5 text-sm font-medium backdrop-blur">
                  {interviewers[id].displayName}
                </figcaption>
                {id === "coco" && (
                  // Anchored to the figure so it stays beside her head at every width.
                  <div className="absolute left-[64%] top-[6%] hidden w-max max-w-[15rem] rounded-2xl rounded-bl-none bg-slate-50 px-4 py-2.5 text-sm leading-snug text-slate-900 sm:block lg:max-w-none">
                    Hi there! Let&apos;s start your interview.
                  </div>
                )}
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-16 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
        <div data-reveal="slide-up" className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Key Features</h2>
          <p className="mt-4 text-lg text-ink-muted">
            Everything you need to master your interview skills and land your dream job
          </p>
        </div>

        <div data-reveal="stagger" className="mt-16 grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon={Mic}
            title="Real-time Voice Interaction"
            body="Practice with AI interviewers that respond naturally to your voice, creating a realistic interview experience."
          >
            <div className="flex h-full items-center justify-center gap-1.5" aria-hidden>
              {[10, 22, 34, 18, 40, 28, 14, 32, 20, 9].map((height, index) => (
                <span
                  key={index}
                  className="voice-bar w-1.5 rounded-full bg-accent-gradient"
                  style={{ height, animationDelay: `${index * 0.09}s` }}
                />
              ))}
            </div>
          </FeatureCard>
          <FeatureCard
            icon={BarChart3}
            title="Performance Analytics"
            body="Every session measures answer length, filler words and concrete outcomes, and keeps a history so you can track progress."
          >
            <div className="flex h-full items-end justify-center gap-3 pb-1" aria-hidden>
              {[38, 52, 46, 64, 72].map((height, index) => (
                <span
                  key={index}
                  className="w-6 rounded-md bg-gradient-to-t from-accent-deep/40 to-accent/80"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </FeatureCard>
          <FeatureCard
            icon={Sparkles}
            title="Instant Feedback"
            body="Receive personalized feedback on your answers the moment you finish, with clear next steps to improve."
          >
            <div className="grid h-full content-center gap-2 px-2" aria-hidden>
              <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
                <Check className="size-3.5 text-emerald-400" /> Clear result in most answers
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
                <ArrowRight className="size-3.5 text-accent" /> Fewer &ldquo;um&rdquo; and &ldquo;like&rdquo;
              </div>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <article className="group flex flex-col rounded-2xl border border-white/[0.08] bg-surface p-6 transition-colors hover:border-accent/30 sm:p-7">
      <div className="h-28 rounded-xl border border-white/[0.06] bg-canvas/60 p-3">{children}</div>
      <div className="mt-6 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
          <Icon className="size-5" />
        </span>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      </div>
      <p className="mt-3 leading-relaxed text-ink-muted">{body}</p>
    </article>
  );
}

function DemoPreviewSection() {
  const points = [
    "Practice common interview questions",
    "Receive instant feedback on your responses",
    "Track your progress over time",
    "Customize interviews for specific roles",
  ];
  return (
    <section id="demo" className="scroll-mt-16 border-y border-white/[0.06] bg-surface/50">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-24 sm:px-6 md:py-32 lg:grid-cols-2 lg:gap-16">
        <div data-reveal="slide-up">
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Try our AI interview <span className="bg-accent-gradient bg-clip-text text-transparent">simulator</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
            Experience realistic interview scenarios with our AI-powered coach. Get instant feedback on your responses
            and improve your interview skills in real time.
          </p>
          <ul className="mt-8 grid gap-4">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent/15">
                  <Check className="size-3.5 text-accent" aria-hidden />
                </span>
                <span className="text-slate-200">{point}</span>
              </li>
            ))}
          </ul>
          <Link href={START_HREF} className={buttonVariants({ size: "lg", className: "group mt-10" })}>
            Start Your Demo Now
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>

        <div data-reveal="fade" className="overflow-hidden rounded-2xl border border-white/10 bg-canvas">
          <div className="flex items-center gap-2 border-b border-white/[0.06] bg-surface px-4 py-3">
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 rounded-md border border-white/10 px-2 py-0.5 text-xs text-ink-muted">
              AI Interview Session
            </span>
          </div>
          <div className="grid gap-4 p-5 sm:p-7">
            <div className="rounded-xl border border-white/[0.06] bg-surface p-4">
              <div className="flex items-center gap-3">
                <span className="relative size-9 overflow-hidden rounded-full bg-surface-raised">
                  <Image
                    src="/images/portrait-coco.webp"
                    alt=""
                    width={880}
                    height={1416}
                    sizes="36px"
                    className="absolute left-1/2 top-[-2px] w-[175%] max-w-none -translate-x-1/2"
                  />
                </span>
                <span className="font-medium">Ms. Coco</span>
                <span className="text-xs text-ink-muted">Interviewer</span>
              </div>
              <p className="mt-3 leading-relaxed text-slate-200">
                Tell me about a time when you had to solve a complex problem. What was your approach?
              </p>
            </div>
            <div className="rounded-xl border border-accent/20 bg-accent/[0.06] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">You</span>
                <span className="flex items-center gap-2 text-xs text-accent">
                  <span className="size-2 animate-pulse rounded-full bg-accent" />
                  Recording response
                </span>
              </div>
              <div className="mt-4 flex h-8 items-center gap-1" aria-hidden>
                {[6, 14, 22, 12, 26, 18, 9, 24, 16, 28, 12, 20, 8, 18, 24, 10, 16, 6].map((height, index) => (
                  <span
                    key={index}
                    className="voice-bar w-1 rounded-full bg-accent/70"
                    style={{ height, animationDelay: `${index * 0.07}s` }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="grid size-12 place-items-center rounded-full bg-accent-gradient text-accent-ink">
                <Mic className="size-5" aria-hidden />
              </span>
              <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-ink-muted">
                Speak naturally, Ms. Coco is listening
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const included = [
    "Practice as often as you like with Ms. Coco and Mr. Mimi",
    "Live transcript of every interview",
    "Feedback report after each session",
    "Full session history",
  ];
  return (
    <section id="pricing" className="scroll-mt-16">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-24 sm:px-6 md:grid-cols-2 md:py-32">
        <div data-reveal="slide-up">
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Pricing</h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-muted">
            One plan, and it is free. Create an account and start practicing in under a minute.
          </p>
        </div>
        <div data-reveal="fade" className="rounded-2xl border border-white/[0.08] bg-surface p-7 sm:p-8">
          <p className="text-sm font-medium text-accent">Free</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight">$0</span>
            <span className="text-ink-muted">forever</span>
          </p>
          <ul className="mt-6 grid gap-3 border-t border-white/[0.06] pt-6">
            {included.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-200">
                <Check className="size-4 shrink-0 text-accent" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <Link href={START_HREF} className={buttonVariants({ size: "lg", className: "mt-8 w-full" })}>
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="grid content-start gap-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-ink-muted">
            Empowering job seekers with AI-powered interview practice.
          </p>
        </div>
        <FooterColumn
          title="Product"
          links={[
            { label: "Features", href: "#features" },
            { label: "Demo", href: "#demo" },
            { label: "Pricing", href: "#pricing" },
          ]}
        />
        <FooterColumn
          title="Account"
          links={[
            { label: "Get Started", href: START_HREF },
            { label: "Sign in", href: "/login" },
          ]}
        />
        <div>
          <h3 className="text-sm font-semibold">Connect</h3>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <Github className="size-4" aria-hidden />
            GitHub
          </a>
        </div>
      </div>
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-ink-muted sm:flex-row sm:justify-between sm:px-6">
          <p>
            &copy; {new Date().getFullYear()} {brand.fullName}. All rights reserved.
          </p>
          <p>Voices by ElevenLabs. Avatars from the TalkingHead examples, for non-commercial use.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-4 grid gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-ink">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
