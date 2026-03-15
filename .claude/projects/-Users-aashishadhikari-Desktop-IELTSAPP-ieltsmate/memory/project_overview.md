---
name: IELTSmate project overview
description: Full-stack AI IELTS prep app — tech stack, structure, credentials, and architecture decisions
type: project
---

## Project: IELTSmate

AI-powered IELTS preparation web app for Nepali students.

**Why:** Teacher has 20 students. Wants butter-smooth, premium dark UI with AI examiner for speaking practice.

**How to apply:** Reference this when making any feature changes, adding pages, or updating UI.

### Tech Stack
- Next.js 16 + App Router + TypeScript strict
- Tailwind CSS v4 + shadcn/ui Nova preset (radix-ui v1 — unified package)
- MongoDB Atlas + Mongoose (db name: `ieltsmate`)
- NextAuth v4 (NOT v5) — credentials provider, JWT strategy
- Anthropic SDK `claude-sonnet-4-6` model
- Web Speech API (browser built-in) for speaking test
- Recharts for progress charts

### Directory Structure
```
app/
  page.tsx              — redirect: students → /dashboard, teachers → /teacher/dashboard
  auth/login            — credentials login
  auth/signup           — signup with class code
  dashboard/            — student dashboard (protected)
    layout.tsx          — sidebar + mobile nav
    page.tsx            — home: daily word card + quick actions
    speaking/           — full 3-part speaking mock test
    writing/            — Task 1 graph toolkit + Task 2 feedback
    vocabulary/         — word bank with spaced repetition
    learn/              — IELTS basics for beginners
    progress/           — recharts band history + skills radar
  teacher/dashboard/    — teacher view of all students
  api/
    auth/[...nextauth]  — NextAuth handler
    auth/register       — student signup
    speaking/chat       — streaming Claude examiner
    speaking/score      — score + save session
    writing/feedback    — streaming writing feedback
    words/daily         — today's word
    words/progress      — update/get word progress
    teacher/students    — class student list
    progress            — band history for charts
    seed                — one-time seed teacher + word bank
lib/
  mongodb.ts            — cached mongoose connection
  auth.ts               — NextAuth config
  constants.ts          — app constants, GRAPH_LANGUAGE, ESSAY_TYPES, NAV_ITEMS
  word-bank.ts          — 200 IELTS words with getDailyWord()
  models/               — User, TestSession, WordProgress, DailyWord
components/
  speaking-test.tsx     — full speaking test client component (Web Speech API)
  writing-toolkit.tsx   — graph language + feedback form
  vocabulary-page.tsx   — word bank with status tracking
  progress-content.tsx  — recharts charts
  daily-word-card.tsx   — daily word with mark/review
  sidebar-nav.tsx       — desktop sidebar
  mobile-nav.tsx        — mobile drawer nav
  session-provider.tsx  — NextAuth session wrapper
  sign-out-button.tsx   — teacher page sign out
```

### Auth
- Teacher account seeded via `POST /api/seed` with body `{ "secret": "seed-ieltsmate-2026" }`
- Default teacher: teacher@ieltsmate.app / teacher123 / code: IELTS2026
- Students sign up with class code IELTS2026

### Theme
- Force dark mode: `<html className="dark">`
- Warm amber primary: oklch(0.78 0.14 62)
- Deep charcoal bg: oklch(0.11 0.008 245)
- Custom CSS: `.recording-pulse`, `.skeleton-shimmer`, `.streaming-text`

### Key Decisions
- shadcn v4 uses `import { Slot } from "radix-ui"` (NOT `@radix-ui/react-slot`)
- NextAuth adapter: `@next-auth/mongodb-adapter` installed with `--legacy-peer-deps`
- Session has: `user.id`, `user.role`, `user.classCode`
- Streaming: `fetch` + `ReadableStream` with SSE (`data: {...}\n\n`)
