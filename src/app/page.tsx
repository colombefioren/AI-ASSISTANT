import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReportView } from "@/components/interview/ReportView";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { ThemedImage } from "@/components/landing/ThemedImage";
import { Logo } from "@/components/ui/Logo";
import { buttonVariants } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { interviewerIds, interviewers } from "@/lib/interviewers";
import { buildReport } from "@/lib/report";
import { sampleTranscript } from "@/lib/sample-session";

const START_HREF = "/login?mode=register";
const START_LABEL = "Start practicing";

const steps = [
  {
    verb: "Choose",
    body: "Pick Coco or Mimi. Both run a first-round interview that mixes behavioral and role-specific questions.",
  },
  {
    verb: "Talk",
    body: "Answer out loud through your microphone. The interviewer reacts, asks follow-ups and waits for you to finish.",
  },
  {
    verb: "Review",
    body: "End the session to get your full transcript and a report on answer length, filler words, outcomes and ownership.",
  },
];

const sampleReport = buildReport(sampleTranscript, 615);

export default function LandingPage() {
  return (
    <>
      <ScrollReveal />
      <SiteNav />
      <main>
        <Hero />
        <HowItWorks />
        <Interviewers />
        <RoomPreview />
        <ReportPreview />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}

function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-8 text-sm text-ink-muted md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-ink">
            How it works
          </a>
          <a href="#interviewers" className="transition-colors hover:text-ink">
            Interviewers
          </a>
          <a href="#report" className="transition-colors hover:text-ink">
            Report
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Sign in
          </Link>
          <Link href={START_HREF} className={buttonVariants({ size: "sm", className: "hidden sm:inline-flex" })}>
            {START_LABEL}
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:pt-16 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 lg:py-12">
      <div data-reveal="stagger" className="max-w-2xl">
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tighter md:text-5xl lg:text-[3.6rem]">
          {brand.tagline}
        </h1>
        <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-muted">
          Answer out loud to a 3D interviewer that follows up, then read a report built from your own words.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href={START_HREF} className={buttonVariants({ size: "lg" })}>
            {START_LABEL}
            <ArrowRight aria-hidden />
          </Link>
          <a href="#how-it-works" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            How it works
          </a>
        </div>
      </div>

      <div data-reveal="fade" className="relative mx-auto w-full max-w-md lg:max-w-none">
        <div className="relative aspect-[4/5] overflow-hidden rounded-panel border bg-[radial-gradient(90%_70%_at_50%_100%,rgb(var(--accent)/0.22),transparent_70%)] bg-surface-raised">
          <Image
            src="/images/portrait-coco.webp"
            alt="Ms. Coco, one of the AI Interview Coach interviewers, a 3D character with dark hair and glasses"
            width={880}
            height={1416}
            priority
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="absolute inset-x-0 bottom-0 mx-auto h-[94%] w-auto object-contain object-bottom"
          />
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 data-reveal="slide-up" className="text-3xl font-semibold tracking-tight md:text-4xl">
            How a session works
          </h2>
        </div>
        <ol data-reveal="stagger" className="grid">
          {steps.map((step) => (
            <li key={step.verb} className="grid gap-3 border-t py-8 first:border-t-0 first:pt-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8">
              <h3 className="text-2xl font-semibold tracking-tight text-accent">{step.verb}</h3>
              <p className="max-w-[52ch] text-lg leading-relaxed text-ink-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Interviewers() {
  const portraits = { coco: { width: 880, height: 1416 }, mimi: { width: 880, height: 1202 } } as const;
  return (
    <section id="interviewers" className="scroll-mt-16 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
        <h2 data-reveal="slide-up" className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          Two interviewers who look at you while you answer
        </h2>
        <p data-reveal="slide-up" className="mt-4 max-w-[60ch] text-lg leading-relaxed text-ink-muted">
          Their lips follow the actual voice audio. They blink, hold eye contact and nod while you talk.
        </p>
        <div data-reveal="stagger" className="mt-14 grid gap-6 md:grid-cols-2 md:gap-8">
          {interviewerIds.map((id, index) => (
            <figure key={id} className={index === 1 ? "md:mt-16" : undefined}>
              <div className="relative aspect-[5/4] overflow-hidden rounded-panel border bg-canvas">
                <Image
                  src={`/images/portrait-${id}.webp`}
                  alt={`${interviewers[id].name}, a 3D interviewer`}
                  width={portraits[id].width}
                  height={portraits[id].height}
                  sizes="(min-width: 768px) 45vw, 90vw"
                  className="absolute inset-x-0 top-[8%] mx-auto w-[58%]"
                />
              </div>
              <figcaption className="mt-4">
                <span className="block text-lg font-semibold">{interviewers[id].name}</span>
                <span className="block text-ink-muted">{interviewers[id].summary}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoomPreview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
      <div className="max-w-2xl">
        <h2 data-reveal="slide-up" className="text-3xl font-semibold tracking-tight md:text-4xl">
          Set up like a video call
        </h2>
        <p data-reveal="slide-up" className="mt-4 text-lg leading-relaxed text-ink-muted">
          Captions under the interviewer, a live transcript beside them, and your past sessions one click away.
        </p>
      </div>
      <div data-reveal="fade" className="mt-12 overflow-hidden rounded-panel border shadow-[0_30px_80px_-40px_rgb(var(--ink)/0.35)]">
        <ThemedImage
          light="/images/room-light.webp"
          dark="/images/room-dark.webp"
          alt="The AI Interview Coach interview room with Coco on the left and the interviewer picker, controls and past sessions on the right"
          width={1800}
          height={1125}
          sizes="(min-width: 1280px) 1232px, 100vw"
          className="h-auto w-full"
        />
      </div>
    </section>
  );
}

function ReportPreview() {
  return (
    <section id="report" className="scroll-mt-16 border-t">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        <div data-reveal="slide-up">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Feedback you can act on tomorrow</h2>
          <p className="mt-4 max-w-[48ch] text-lg leading-relaxed text-ink-muted">
            The report reads your transcript and points at specific habits, with the numbers behind each one.
          </p>
        </div>
        <div data-reveal="fade" className="rounded-panel border bg-surface p-6 sm:p-8">
          <p className="mb-6 text-sm text-ink-muted">Sample report from a three-question practice session</p>
          <ReportView report={sampleReport} />
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="border-t bg-surface">
      <div data-reveal="slide-up" className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
          Practice tonight. Walk in calmer tomorrow.
        </h2>
        <Link href={START_HREF} className={buttonVariants({ size: "lg", className: "mt-9" })}>
          {START_LABEL}
          <ArrowRight aria-hidden />
        </Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-sm text-ink-muted sm:px-6 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-3">
          <Logo />
          <p className="max-w-[60ch]">
            Voice conversations by ElevenLabs. Avatars from the TalkingHead examples, licensed for non-commercial use.
          </p>
        </div>
        <p>&copy; {new Date().getFullYear()} {brand.name}</p>
      </div>
    </footer>
  );
}
