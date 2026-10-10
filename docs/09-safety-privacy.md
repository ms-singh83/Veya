# 09 — Safety, Privacy & Compliance

These are MVP requirements, not later improvements.

## 1. Medical boundaries

| The app does | The app never does |
|--------------|--------------------|
| General wellness education (sleep hygiene, hydration, activity, balanced meals) | Diagnose, name likely conditions, interpret test results |
| Habit tracking and gentle suggestions | Recommend starting/stopping/changing medication or dosage |
| Refer to professionals for symptoms | Create treatment, fasting or very-low-calorie plans |
| Point to emergency services for red flags | Claim to monitor health or detect emergencies |

### Escalation tiers
| Tier | Example | Response |
|------|---------|----------|
| Urgent | chest pain, trouble breathing, stroke signs, severe bleeding, suicidal intent | Template: contact emergency services now (India **112**); mental-health: **Tele-MANAS 14416**; stop coaching; `safety_status=URGENT` |
| Referral | persistent symptoms, pregnancy questions, chronic disease management, medication questions | Brief general info + "please talk to a doctor/pharmacist"; no tasks proposed |
| Sensitive | eating-disorder signals, extreme dieting | Supportive, no numbers/targets, suggest professional support |
| OK | general wellness | Normal coaching |

Numbers must be verified by the team before launch (manual checklist E2).

## 2. Privacy & access control

- Auth on every route; ownership filter on every query; `404` for others' resources.
- RLS on all user tables (defence-in-depth). Service role key only on the server.
- TLS everywhere; Supabase encryption at rest; secrets in host secret store.
- Data minimisation: age band + adult confirmation instead of birth date; no location, no contacts.
- Separate, revocable consents: AI processing, AI personal context, notifications, analytics.
- **Export**: JSON of all user tables, generated async, link valid 7 days.
- **Deletion**: re-auth → mark profile `deletion_requested_at`, revoke sessions, disable devices → worker hard-deletes all rows + `auth.users` within 7 days → `ai_operations.user_id` set null.
- Logs: redact Authorization, body fields (`content`, `description`, `notes`, nutrient/health values).
- Analytics: no health values, no free text.
- Lock-screen notifications: generic copy only.

## 3. LLM safety

- User text, food names and tool results are **untrusted data**; system prompt says so; tool registry limits blast radius.
- Model cannot change settings, consents, delete data, or act on other users — no such tools exist.
- All write tools produce proposals requiring a user tap.
- Structured outputs validated with Zod + business rules; invalid → retry once → fallback.
- Output filter for banned medical phrasing and unsupported numbers.
- Per-user rate limits and daily AI budgets; global spend alerts.
- Kill switch: `AI_ENABLED=false` falls back to template plans and disables chat gracefully.

## 4. Compliance checklist (India launch)

- [ ] DPDP Act: notice in clear language, consent per purpose, withdrawal as easy as giving, erasure, grievance redressal contact, breach notification process, processor contracts. Confirm the rules in force at launch with counsel.
- [ ] Children: block under-18; no knowingly processing minors' data.
- [ ] Apple App Store: privacy policy URL, App Privacy details, health-related review guidelines, account deletion in-app (required).
- [ ] Google Play: Data safety form, Health apps declaration, account deletion (in-app + web link), privacy policy.
- [ ] Not a medical device: no diagnosis/treatment claims in app, store listing or marketing. Reassess if features change.
- [ ] Third-party processors (Supabase, Anthropic, host, Expo, Sentry, analytics) listed in privacy policy.

## 5. Notification safety

No alarming wording; never imply monitoring; no consequences for ignoring reminders; respect quiet hours and caps.
