# 11 — Day-wise Build Plan (30 working days, 6 weeks)

Assumes 1–2 full-stack developers using AI-assisted coding, plus part-time help for design, legal and health review. With one developer, expect the upper end (6 weeks). Each day ends with a commit, green CI and a short demo note.

> **Before Day 1:** complete the 🔴 items in [00-manual-setup.md](00-manual-setup.md) (Day 0). Start Apple Developer enrolment immediately because it can take 1–2 weeks.

Legend: **BE** backend · **FE** mobile · **M** manual / non-code · ✅ definition of done

---

## Day 0 — Manual preparation (not counted)
- **M** Decisions A1–A8, create accounts B1–B5 and B13, generate dev credentials (section C).
- **M** Start Apple/Google developer enrolment, engage legal + health/nutrition advisor.
- ✅ `.env.example` values available to developers; dev Supabase and Anthropic keys working.

---

## Week 1 — Foundations

### Day 1 — Repo & skeletons
- pnpm monorepo: `apps/mobile` (Expo + TS + Expo Router), `apps/api` (Express + TS), `packages/shared`.
- ESLint, Prettier, tsconfig paths, Vitest, GitHub Actions (lint, typecheck, test).
- API: `/health`, env validation with Zod, Pino logger with redaction, error middleware, request ID.
- ✅ CI green; app runs on a phone via Expo Go; `/health` returns ok locally.

### Day 2 — Database
- Prisma schema from [03-database.md](03-database.md); first migration on dev Supabase.
- Raw SQL migration: CHECK constraints, partial unique index, FKs to `auth.users`.
- RLS policies for all user tables; seed script with 2 test users.
- RLS test (user A cannot read user B with anon key).
- ✅ `prisma migrate deploy` works from CI against a test DB; RLS test green.

### Day 3 — Authentication
- **FE** Supabase Auth: sign-up, sign-in, password reset, session persistence in SecureStore, auth-gated routing.
- **BE** JWT verification middleware (JWKS), `req.userId`, `GET/PATCH /me`.
- **M** Configure Supabase Auth redirect URLs and email templates.
- ✅ Signed-in user can call `/me`; forged token → 401 (test).

### Day 4 — Onboarding backend + API conventions
- `POST /me/onboarding`, `/me/onboarding/complete`, `GET/PUT /preferences`, consents endpoints.
- Default reminder preferences on onboarding.
- Rate-limit middleware, idempotency middleware + `idempotency_records`, standard error envelope.
- Shared Zod schemas in `packages/shared`.
- ✅ Integration tests for onboarding, under-18 block, ownership.

### Day 5 — Onboarding UI + app shell
- **FE** Onboarding flow (age/tz, consents, goals, schedule, diet, reminders, notification permission), skip support.
- Tab navigator with placeholder screens; settings route; typed API client with TanStack Query.
- **M** Wireframes review; consent copy draft from legal.
- ✅ New user completes onboarding in < 3 min and lands on Today (placeholder plan). Week-1 demo.

---

## Week 2 — Manual tracking & Today

### Day 6 — Habit-log APIs
- Water, sleep, activity: create / list by date / patch / delete, with validation, idempotency, overlap check for sleep.
- `lib/time.ts`: local day/week bounds, tests incl. DST zone.
- ✅ All log routes covered by integration tests.

### Day 7 — Activity tab UI
- Water quick-add (150/250/500 + custom), sleep entry (start/end or duration, crosses midnight), activity form.
- Day list with edit/delete; optimistic updates; offline queue with idempotency keys.
- ✅ Log/edit/delete works on device, survives offline → online.

### Day 8 — Daily metrics
- `GET /metrics/daily` aggregation (null for unlogged), goal progress.
- Unit tests with fixtures.
- ✅ Metrics match fixtures exactly.

### Day 9 — Today dashboard
- Metrics cards, quick actions, "Not logged" and "≈" states, plan card wired to a **template plan** service (deterministic, from goals).
- `GET /plans/today`, `PATCH /tasks/:id`, task checkboxes.
- ✅ Completing a task updates progress instantly and persists.

### Day 10 — Buffer & hardening
- Fix bugs, accessibility labels, loading/error/empty states, pull-to-refresh.
- **M** Health advisor delivers red-flag list + safe limits (E1, E4); nutritionist starts seed dish list (F2).
- ✅ Week-2 demo: fully usable manual tracker with template plan.

---

## Week 3 — AI core (plans + safety)

### Day 11 — LLM provider layer
- `LlmProvider` interface + Claude adapter (`@anthropic-ai/sdk`), structured output helper with Zod, timeouts, retries, `stop_reason` handling, refusal handling.
- `ai_operations` logging (hash, tokens, latency, status); per-user budget counter; `AI_ENABLED` flag.
- Mock provider for tests.
- ✅ Contract tests: timeout, 5xx, invalid JSON, refusal all mapped correctly.

### Day 12 — Safety layer
- Rule pre-check (red flags, self-harm, medication, minors, ED signals), classifier call, templated urgent/referral responses, output filter.
- First 60 safety-eval prompts + runner script.
- ✅ Rule tests green; eval runner produces a report.

### Day 13 — Plan generation
- Context builder (consent-aware, minimal), plan prompt v1, `PlanOut` schema, post-validation (times, categories, content filter), repair retry, template fallback.
- `POST /plans/generate`; one ACTIVE plan per day (supersede on regenerate).
- ✅ 20 synthetic profiles produce valid plans; malformed-output tests pass.

### Day 14 — Plans in the app
- Today: generate on first open, progress UI while generating, regenerate, AI vs template indicator.
- Task scheduling → `scheduled_at` UTC from local times.
- ✅ Real device: onboarding → AI plan within ~20 s, fallback when `AI_ENABLED=false`.

### Day 15 — Plan adjustment
- `POST /plans/adjust` (proposal, max 3 changes) + apply endpoint; Adjust sheet with accept/reject per change.
- **M** Review 20 generated plans with health advisor; tune prompt (bump version).
- ✅ Week-3 demo: personalised plans with safe adjustments.

---

## Week 4 — Nutrition & chat

### Day 16 — Food reference data
- `foods`, `portion_units` tables, `pg_trgm` index, import scripts (IFCT/FDC subset + local recipes from nutritionist), `GET /foods/search`.
- `NutritionProvider` interface (local first, external optional).
- ✅ Search returns sensible results for 30 common Indian foods.

### Day 17 — Estimate pipeline
- `FOOD_PARSE` structured call → match → portion → compute → confidence/clarifications; `food_estimates` with 24 h expiry.
- `POST /food-entries/estimate`, `POST/GET/PATCH/DELETE /food-entries`, server-side recompute.
- ✅ 50-meal accuracy script runs; nulls never become zeros.

### Day 18 — Food UI
- Meal list by type, add-meal (text or search), estimate review sheet with clarifications/options, inline edit, confirm, daily totals with coverage.
- ✅ Logging "2 rotis and dal" end-to-end in ≤ 5 taps after typing.

### Day 19 — Chat backend
- Sessions/messages APIs, tool registry (read tools + proposal tools), tool loop (max 5 rounds), actions confirm/dismiss endpoints, safety integration, streaming (SSE).
- Approved guidance library loader for `get_wellness_guidance`.
- ✅ Tests: injection can't trigger writes; other users' data unreachable; urgent → template.

### Day 20 — Chat UI
- Session list, chat view with streaming, disclaimer banner, action cards (edit/add/dismiss), emergency card, references.
- ✅ Week-4 demo: ask "how can I sleep better?" → answer → accept proposed task → appears on Today.

---

## Week 5 — Reminders & weekly reports

### Day 21 — Reminder settings + devices
- `GET/PUT /reminders`, `/reminders/pending`, snooze, `POST/DELETE /devices`.
- **FE** reminder settings screen, quiet hours, max per day; push token registration (requires dev build).
- **M** APNs key + FCM credentials uploaded to EAS (B6, B8).
- ✅ Settings persist; device token stored.

### Day 22 — Scheduler
- pg-boss worker process; `materialise-reminders` with dedupe keys, DST-safe conversion, task-linked occurrences.
- ✅ Tests: duplicates impossible, DST, quiet hours, disabled categories.

### Day 23 — Delivery
- `dispatch-due` (SKIP LOCKED claiming), eligibility checks, Expo push send, retries/backoff, expiry, receipts job, token disabling; notification tap deep-links.
- ✅ Real phones receive reminders at correct local time; outage simulation yields no burst.

### Day 24 — Weekly metrics & report pipeline
- Weekly SQL aggregates, coverage rules, prior-week comparison, summary prompt, fact-checker, fallback template, fingerprint, weekly cron.
- ✅ Fixture reports exact; fake-number injection rejected.

### Day 25 — Insights UI
- Week selector, metric cards with coverage, summary + suggestions → add to plan, regenerate, share (sensitive values hidden by default).
- ✅ Week-5 demo: full loop — plan → log → reminders → weekly report.

---

## Week 6 — Privacy, hardening, beta

### Day 26 — Privacy operations
- Data export job + download; account deletion flow (re-auth, soft flag, worker hard delete incl. auth user); consent revocation effects; retention purge jobs.
- ✅ Tests: export completeness, deletion completeness, AI-context revocation.

### Day 27 — Settings & polish
- Profile/settings screens complete, legal links, disclaimer screen, analytics events (no health data), Sentry in app + API.
- **M** Privacy policy, terms, disclaimer published (D1–D3); consent versions finalised.
- ✅ Every settings toggle is a real backend operation.

### Day 28 — QA & safety eval
- Run full must-pass list ([10-testing-qa.md](10-testing-qa.md)); full 150-prompt safety eval on final prompts/model; fix failures.
- Load sanity test (e.g. 200 concurrent users on non-AI routes).
- ✅ 0 critical safety failures; must-pass list green.

### Day 29 — Release prep
- Prod Supabase migration, prod env + secrets, PITR on, restore drill, alerts & spend caps, feature flags verified.
- EAS production builds; **M** store listings, screenshots, App Privacy / Data safety / Health declaration forms.
- ✅ Builds uploaded to TestFlight and Play internal testing.

### Day 30 — Closed beta launch
- Invite 10–30 testers, feedback form, monitoring dashboard (errors, AI failures, spend, onboarding funnel).
- Retro + Phase-2 backlog grooming (HealthKit/Health Connect, meal photos, subscriptions).
- ✅ Beta live; first-day metrics reviewed.

---

## Milestones

| End of | Milestone |
|--------|-----------|
| Week 1 | Auth + onboarding + DB with RLS |
| Week 2 | Manual tracker with template plan (shippable fallback) |
| Week 3 | AI daily plans with safety layer |
| Week 4 | Meal logging + wellness chat |
| Week 5 | Reminders + weekly reports |
| Week 6 | Privacy ops, QA, closed beta |

## Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Apple enrolment delay | Start Day 0; use Android internal testing first |
| Indian food coverage weak | Local recipe seed list from nutritionist; clarification UX |
| LLM latency/cost | Template fallbacks, budgets, caching stable prompts, measure before optimising |
| Safety failure in chat | Rule pre-check + templates + eval gate before beta; kill switch |
| Push unreliability | In-app pending list as source of truth; receipts monitoring |
| Scope creep | Phase-2 list is frozen until beta feedback |
