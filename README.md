# AIC: AI Interview Coach

Ace your next interview with AI coaching. AI Interview Coach (AIC) is a mock-interview app
where you answer out loud to a 3D interviewer, then review a transcript-based report of
how you did.

## Features

- **Voice interviews** with two interviewers, Ms. Coco and Mr. Mimi, powered by
  [ElevenLabs Conversational AI](https://elevenlabs.io/conversational-ai).
- **Natural 3D avatars** rendered with Three.js. Lip sync is driven by the interviewer's
  real audio spectrum (formant and sibilance analysis mapped to visemes), with blinking,
  eye saccades, breathing, emphasis-driven head and brow motion, and listening nods
  while you speak.
- **Live captions and transcript** during the session.
- **Session reports** built from your transcript: answer length, filler words,
  outcome-focused answers and ownership ("I" versus "we"), with concrete suggestions.
- **Session history** per account, each session with its own report page.
- **Accounts** with email and password (NextAuth credentials, bcrypt, rate limiting).
- Dark slate and sky-blue interface, responsive layouts and reduced-motion support.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Motion and GSAP ·
Three.js with React Three Fiber · NextAuth · Prisma with PostgreSQL · Zod · Vitest

## Getting started

Requirements: Node.js 20 or newer and a PostgreSQL database.

```sh
git clone https://github.com/colombefioren/AI-ASSISTANT.git
cd AI-ASSISTANT
npm install
cp .env.example .env.local   # then fill in the values
npm run db:migrate           # creates the tables
npm run dev
```

Open http://localhost:3000, create an account and start an interview. The browser asks
for microphone access when the interview starts.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string. |
| `NEXTAUTH_URL` | yes | Public URL of the app. |
| `NEXTAUTH_SECRET` | yes | Random secret for signing sessions (`openssl rand -base64 32`). |
| `ELEVENLABS_API_KEY` | no | Enables private agents through signed URLs. |
| `ELEVENLABS_AGENT_ID_COCO`, `ELEVENLABS_AGENT_ID_MIMI` | no | Agent ids for each interviewer. Default to the project's public agents. |
| `ELEVENLABS_ALLOW_OVERRIDES` | no | `true` also sends the app's interviewer prompt and first message in the chosen language. Requires Overrides to be enabled in the agent's Security settings. |
| `TRUST_PROXY` | no | `true` when a proxy you control sets `X-Forwarded-For`. |

### Interview language

Pick **FR** or **EN** in the interview room before starting. The choice is remembered
on that browser until you change it. Each session sends the language to ElevenLabs as a
conversation override and tells the interviewer to stay in it, so the whole interview
keeps that language even if you answer in the other one. Reports use matching word lists
(for example "euh" and "du coup" as French fillers).

Each agent's opening line comes from its ElevenLabs configuration (Agent, then Languages).
Set a proper English first message there for every agent you use in English. To let the
app send its own interviewer prompt and opening line instead, enable Overrides in the
agent's Security settings and set `ELEVENLABS_ALLOW_OVERRIDES=true`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Production build, including type checks. |
| `npm start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm test` | Run unit tests for the report and lip sync logic. |
| `npm run db:migrate` | Apply Prisma migrations. |

## Project structure

```
src/
  app/                 routes: landing, login, interview room, session reports, API
  components/
    interview/         interview room, transcript, report, 3D avatar (avatar/)
    landing/           landing page client pieces
    ui/                shared primitives
  lib/                 auth, validation, rate limiting, report analysis, config
prisma/                schema and migrations
public/avatars/        avatar models and their licenses (see CREDITS.md)
```

## Production notes

- Rate limiting is kept in process memory. It works for a single server; use Redis or
  a similar shared store when running several instances.
- The avatars are licensed for non-commercial use only. See
  [`public/avatars/CREDITS.md`](public/avatars/CREDITS.md) before using AI Interview
  Coach commercially.
