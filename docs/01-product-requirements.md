# 01 — Product Requirements (MVP)

## 1. Product definition

| Item | Value |
|------|-------|
| Name | LifeHealth AI |
| Tagline | Your personal everyday wellness agent |
| Platforms | iOS + Android (one Expo codebase) |
| Audience | Adults 18+ |
| Type | Consumer wellness — **not** a medical device |
| Build target | 4–6 weeks to closed beta |

**Core promise:** Every day, LifeHealth AI helps you decide what to do for your well-being, makes tracking easy, and helps you stay consistent.

## 2. Personas

1. **Busy professional (25–40)** — wants simple routines: drink more water, walk daily, sleep on time. Low patience for long forms.
2. **Health-curious home cook (30–55)** — eats mostly home-cooked Indian food, wants rough calorie/protein awareness without weighing food.
3. **Habit rebuilder (20–35)** — had a good routine before; wants reminders and weekly feedback to rebuild consistency.

## 3. MVP success criteria (targets to validate)

| Metric | Target |
|--------|--------|
| Time from install to first plan | < 3 minutes (median) |
| Taps to log water | ≤ 2 from Today |
| Taps to log a known meal | ≤ 5 |
| Weekly report numbers match DB | 100% (automated test) |
| Estimates labelled as estimates | 100% of nutrition values |
| Week-2 retention of beta users | Measure; no fixed target yet |
| Unsafe answers in safety eval | 0 critical failures |

## 4. Scope

### MVP — must ship
- Sign-up / sign-in, onboarding, adult wellness profile
- AI-generated daily wellness plan with tasks
- Text-based meal logging with approximate nutrition estimates
- Manual water, sleep, activity logging
- Configurable reminders (local + push) with quiet hours
- Weekly report (deterministic metrics + AI summary)
- General wellness chat with confirm-before-write task creation
- Privacy controls: consent management, export, account deletion
- Safety checks, error handling, rate limits

### Phase 2 (after validation)
HealthKit / Health Connect, wearables, meal photos, family/caregiver profiles, medication schedules, calendar reminders, advanced trends, paid subscriptions.

### Out of scope
Diagnosis, treatment, prescriptions/dosage, emergency monitoring, disease prediction, medical-grade scores, autonomous medical decisions, custom-trained models, multi-agent swarms, users under 18.

## 5. Navigation

Bottom tabs: **Today · Food · Activity · Insights · Chat**. Profile/Settings via avatar on Today header.

## 6. Screens and acceptance criteria

### S1 — Welcome & onboarding
Steps (each skippable except those marked *):
1. Sign up / log in* (email + password; optional Google/Apple)
2. Age confirmation 18+* and time zone* (auto-detected, editable)
3. Accept terms, privacy, wellness disclaimer* (versioned consent)
4. AI-processing consent* (required for AI features; app still usable for manual logging without it)
5. Goals (multi-select): sleep consistency, more activity, better meal habits, hydration, stress/routine
6. Schedule: wake time, bedtime, work hours (optional)
7. Diet: vegetarian / vegan / eggetarian / non-veg / Jain; allergies (free text, optional)
8. Reminder times + notification permission (optional)
9. Generating first plan → Today

**Acceptance**
- Skipping every optional step still produces a basic plan (template fallback if AI unavailable).
- Under-18 → blocked with a polite message; no data stored beyond what's needed to block.
- Onboarding completion sets `profiles.onboarding_completed_at`.
- Median completion < 3 min in usability testing.

### S2 — Today dashboard
- Header: greeting, date, avatar → settings
- Plan card: summary + task list with checkboxes, category icons, suggested times
- Metrics row: meals logged, water (ml / goal), sleep last night, activity minutes
- "Next reminder" chip
- Quick actions: + Water (250 ml default, long-press for custom), + Meal, + Activity
- "Adjust my plan" → proposal sheet (accept/reject each change)
- Missing data shown as "Not logged", estimates marked "≈"

**Acceptance**: every card navigates to its detail; task completion and quick logs update optimistically and reconcile with server; offline → queued with idempotency key.

### S3 — Food
- Day selector, list of meals grouped by breakfast/lunch/dinner/snack
- Add meal: type, time, free-text description **or** search food → choose portion
- Estimate review sheet: items, quantity, unit, calories/protein/carbs/fat with "≈" and source; items needing clarification are highlighted with a question
- Confirm → save; edit and delete existing entries
- Daily totals with coverage note ("3 of 4 items have estimates")

**Acceptance**: estimates never shown as exact; unknown values show "—" not 0; edits recalculate totals.

### S4 — Activity & habits
- Water: quick add buttons (150/250/500 ml), custom, list for day
- Sleep: start/end pickers or duration; supports crossing midnight
- Activity: type (walk, run, yoga, cycling, gym, sport, other), duration, optional steps/distance
- Edit/delete any record
- Progress vs personal goals (only goals the user set)

**Acceptance**: validation of ranges and future dates; time zone correct; overlapping sleep logs warned.

### S5 — Reminders (inside Settings, also reachable from Today chip)
- Categories: hydration, meals, activity, sleep wind-down, plan check-in, weekly report
- Per category: enabled, local times, days of week
- Quiet hours (default 22:00–07:00)
- Max reminders per day (default 6)
- Pending reminders list; complete or snooze (15 min / 1 h / tomorrow)

**Acceptance**: disabled categories never fire; retries never duplicate; snooze reschedules exactly one notification.

### S6 — Insights (weekly)
- Week selector
- Coverage strip: days with any log
- Sleep: avg duration on logged days, number of logged nights
- Water: avg on logged days, days logged
- Meals: days with meals logged, estimated daily calories/protein (≈)
- Activity: total minutes, active days
- vs. previous week when both weeks have ≥ 3 logged days for that metric
- AI summary + 2–3 suggestions (each can become a task)
- Share: image/text with sensitive values hidden by default (toggle to include)

**Acceptance**: all numbers come from DB aggregates; summary is fact-checked against metrics; regenerate available.

### S7 — Chat
- Session list + new chat
- Message stream, typing indicator
- Persistent banner: "General wellness info, not medical advice"
- Suggested actions rendered as cards: "Add 'Evening walk 20 min' to today?" → Edit / Add / Dismiss
- Urgent-symptom responses show emergency info card (112) and stop normal coaching

**Acceptance**: no write action without user confirmation; refuses diagnosis/medication changes; works with AI-context permission off (no personal data in prompt).

### S8 — Profile, settings & privacy
- Edit name, goals, schedule, diet, time zone
- Reminder settings (S5)
- Permissions: notifications, AI personal-context use, analytics
- Export my data (JSON zip via email link or in-app download)
- Delete account (confirmation + re-auth) → real backend deletion
- Legal: privacy policy, terms, disclaimer, licences, app version

**Acceptance**: revoking AI-context consent immediately stops personal data going to the LLM; deletion removes all user rows and auth user within the stated window.

## 7. Non-functional requirements

| Area | Requirement |
|------|-------------|
| Performance | Today screen loads < 1.5 s on 4G (cached first paint < 300 ms). Non-AI API p95 < 300 ms. Plan generation p95 < 20 s with progress UI. |
| Availability | Logging works if the AI provider is down. |
| Offline | Water/activity/sleep logging queued offline and synced. |
| Accessibility | WCAG AA contrast, screen-reader labels, dynamic font sizes. |
| Localisation | English at launch; strings externalised for Hindi later. Metric units. |
| Security | See [09-safety-privacy.md](09-safety-privacy.md). |
| Cost | Per-user daily AI budget (see [04-ai-agent.md](04-ai-agent.md)). |

## 8. Analytics events (no health values)

`onboarding_started`, `onboarding_step_completed{step}`, `onboarding_completed{duration_s}`, `plan_generated{source: ai|template}`, `task_completed{category}`, `log_created{type}`, `meal_estimate_confirmed{needed_clarification}`, `chat_message_sent`, `chat_task_accepted`, `reminder_opened{category}`, `report_viewed`, `account_deleted`.
