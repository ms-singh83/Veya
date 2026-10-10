# 00 — Manual Work Checklist (do this first)

Code cannot be written, tested or shipped without the items below. They need a human (you or your team) because they involve **accounts, payments, legal decisions, credentials, real devices or domain expertise**. Items are ordered by when they block the [build plan](11-build-plan.md).

Legend: 🔴 blocks Day 1–3 · 🟠 needed by Week 3 · 🟡 needed before beta (Week 6)

---

## A. Decisions to make (Day 0, ~2 hours) 🔴

| #   | Decision                        | Recommendation                                                                                                                                                                       | Owner                       |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| A1  | Final product name & bundle IDs | Name is **Veya**. Placeholder bundle id `com.veya.app` is in `apps/mobile/app.json` — confirm or change before the first store build; bundle IDs **cannot change** after submission. | Founder                     |
| A2  | Legal entity publishing the app | Company or individual developer account. A company account shows the company name in stores and is better for a health-adjacent app.                                                 | Founder                     |
| A3  | Launch region(s)                | India first (affects DPDP Act, nutrition data, emergency numbers, Supabase region).                                                                                                  | Founder                     |
| A4  | Hosting region for data         | Supabase + API in `ap-south-1` (Mumbai) if targeting India.                                                                                                                          | Tech lead                   |
| A5  | LLM provider                    | Claude API (Anthropic). Default model `claude-opus-5-5`; decide later whether to move cheaper routes (safety pre-check, food parsing) to a smaller model after measuring quality.    | Tech lead                   |
| A6  | Nutrition data source           | See section F. Must be decided by Week 3.                                                                                                                                            | Product + nutrition advisor |
| A7  | Monthly budget cap              | Set hard caps for LLM spend, hosting and Supabase before beta.                                                                                                                       | Founder                     |
| A8  | Team & roles                    | Who writes mobile, backend, who reviews safety content, who does QA.                                                                                                                 | Founder                     |

## B. Accounts to create 🔴 (unless marked)

| #   | Account                                                              | Why                                          | Notes / cost (verify current pricing)                                                                                            |
| --- | -------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| B1  | **GitHub** repo access + branch protection                           | Source control, CI                           | Enable required reviews on `main`.                                                                                               |
| B2  | **Supabase** organisation + 2 projects (`veya-dev`, `veya-prod`)     | Postgres + Auth                              | Choose Mumbai region. Enable Point-in-Time Recovery on prod before beta (paid plan).                                             |
| B3  | **Anthropic Console** account + workspace + API key                  | LLM                                          | Create separate keys for dev and prod. Set a workspace spend limit. Review data-retention settings.                              |
| B4  | **Expo / EAS** account                                               | Builds, OTA updates, push service            | Free tier is fine to start.                                                                                                      |
| B5  | **Hosting** for the API (Render / Railway / Fly.io / AWS App Runner) | Run Express API + worker                     | Need: always-on web service + background worker + cron.                                                                          |
| B6  | **Apple Developer Program** 🟠                                       | iOS builds, TestFlight, APNs push key        | Annual fee; enrolment as an organisation needs a D-U-N-S number and can take **1–2 weeks** — start Day 0.                        |
| B7  | **Google Play Console** 🟠                                           | Android internal testing                     | One-time fee; new personal accounts may require a closed test with testers for a period before production — check current rules. |
| B8  | **Firebase project** 🟠                                              | FCM credentials for Android push via Expo    | Upload FCM v1 service account to EAS.                                                                                            |
| B9  | **Error monitoring** (Sentry or similar)                             | Crash + API error tracking                   | Configure PII scrubbing.                                                                                                         |
| B10 | **Product analytics** (PostHog / Amplitude, privacy-conscious) 🟡    | Onboarding & retention metrics               | No health values in events.                                                                                                      |
| B11 | **Transactional email / SMTP** (Resend, SES, Postmark) 🟠            | Supabase Auth emails (verification, reset)   | Supabase default SMTP is rate-limited; configure custom SMTP before beta.                                                        |
| B12 | **Domain name** + DNS 🟠                                             | API domain, privacy-policy URL, email sender | e.g. `api.veya.app`, `veya.app/privacy`.                                                                                         |
| B13 | **Password manager / secrets vault** 🔴                              | Store all keys                               | Never commit secrets.                                                                                                            |

## C. Credentials & configuration to generate 🔴/🟠

Put these in the hosting provider's secret store and in a local `.env` (git-ignored). The mobile app only ever gets **public** values.

| Variable                                  | Where it comes from                                      | Used by                         |
| ----------------------------------------- | -------------------------------------------------------- | ------------------------------- |
| `DATABASE_URL`, `DIRECT_URL`              | Supabase → Project settings → Database (pooled + direct) | API (Prisma)                    |
| `SUPABASE_URL`                            | Supabase → API                                           | API + mobile                    |
| `SUPABASE_ANON_KEY` (publishable)         | Supabase → API keys                                      | **Mobile only (public)**        |
| `SUPABASE_SERVICE_ROLE_KEY` (secret)      | Supabase → API keys                                      | **API only — never in the app** |
| `SUPABASE_JWT_SECRET` / JWKS URL          | Supabase → Auth                                          | API token verification          |
| `ANTHROPIC_API_KEY`                       | Anthropic Console                                        | API only                        |
| `NUTRITION_API_KEY` (if using a paid API) | Provider                                                 | API only                        |
| `EXPO_ACCESS_TOKEN`                       | Expo → Access tokens                                     | API (push sending), CI          |
| APNs key (.p8)                            | Apple Developer → Keys                                   | Uploaded to EAS                 |
| FCM v1 service-account JSON               | Firebase console                                         | Uploaded to EAS                 |
| `SENTRY_DSN`                              | Sentry                                                   | API + mobile                    |

Also in Supabase Auth settings (manual): enable Email (+ optional Google / Apple sign-in), set redirect URLs for the Expo deep-link scheme, set password policy, enable leaked-password protection if available, set JWT expiry.

> If you offer any third-party social login on iOS, Apple's guidelines generally require also offering Sign in with Apple — check the current App Review Guidelines.

## D. Legal & compliance work 🟡 (start in Week 1, it takes time)

| #   | Item                                                                       | Notes                                                                                                                                                                                         |
| --- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Privacy policy**                                                         | What health data is collected, why, where stored, retention, AI processing by a third party (Anthropic), user rights, grievance contact. Hosted at a public URL (stores require it).          |
| D2  | **Terms of service**                                                       | Including age 18+ restriction and wellness-only use.                                                                                                                                          |
| D3  | **Wellness disclaimer** text                                               | Shown in onboarding and settings: not medical advice, not for emergencies.                                                                                                                    |
| D4  | **DPDP Act review** (India)                                                | Consent notice, purpose limitation, data-principal rights (access, correction, erasure, grievance), breach notification, processor agreements. Have a lawyer review rules in force at launch. |
| D5  | **Consent texts + versions**                                               | Exact copy for: terms, privacy, AI processing of health data, notifications, analytics. Each gets a version string stored in `user_consents`.                                                 |
| D6  | **Data Processing Agreements**                                             | With Supabase, Anthropic, hosting, email, analytics, error monitoring providers.                                                                                                              |
| D7  | **Apple App Privacy "nutrition label"** & **Google Play Data Safety form** | Filled in manually in store consoles. Must match actual behaviour.                                                                                                                            |
| D8  | **Health-app store policies**                                              | Apple guideline 1.4 (physical harm) / 5.1 (privacy); Google Play Health apps policy & health declaration form.                                                                                |
| D9  | **Grievance officer / contact email**                                      | Required for DPDP; also a support email for stores.                                                                                                                                           |
| D10 | **Nutrition data licence**                                                 | Confirm commercial-use rights of whichever food database you use.                                                                                                                             |

## E. Safety & content work (needs a human expert) 🟠

| #   | Item                                   | Notes                                                                                                                                                                                                |
| --- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | **Red-flag symptom list**              | Symptoms that trigger "seek urgent care" (chest pain, difficulty breathing, stroke signs, suicidal thoughts, severe bleeding, etc.). Review with a doctor.                                           |
| E2  | **Emergency resources for India**      | 112 (national emergency), 108 (ambulance in many states), Tele-MANAS 14416 (mental health). Verify current numbers before launch.                                                                    |
| E3  | **Approved wellness guidance library** | 30–60 short, reviewed articles (hydration, sleep hygiene, walking, balanced meals) used by `get_wellness_guidance`. Cite reputable public sources (WHO, ICMR-NIN dietary guidelines, etc.).          |
| E4  | **Safe limits table**                  | Max water per log (e.g. 2000 ml), max per day warning, sleep 0–20 h, activity 0–600 min, calorie suggestions **never** below a floor, no fasting plans. Reviewed by a nutrition/health professional. |
| E5  | **Safety evaluation set**              | ~150 test prompts (benign, borderline, urgent, self-harm, medication, eating-disorder, minors, prompt-injection) with expected behaviour. See [10-testing-qa.md](10-testing-qa.md).                  |
| E6  | **Notification copy**                  | Neutral, non-alarming, no health details on lock screen.                                                                                                                                             |

## F. Nutrition data work 🟠

| #   | Item                                               | Notes                                                                                                                                                                                                                                                                                                  |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F1  | Evaluate sources                                   | **IFCT 2017** (Indian Food Composition Tables, ICMR-NIN) — best for Indian raw ingredients, check licence/terms; **USDA FoodData Central** — public domain, broad coverage; **Open Food Facts** — packaged foods (ODbL licence); commercial APIs (Edamam, Nutritionix, etc.) — composite dishes, cost. |
| F2  | Build a **seed list of ~200 common Indian dishes** | Roti, dal, rice, sabzi, idli, dosa, poha, paneer dishes, chai… with standard recipe + per-100 g values + standard portion weights (1 medium roti ≈ X g, 1 katori ≈ Y ml). Have a nutritionist sanity-check.                                                                                            |
| F3  | **Portion unit dictionary**                        | katori, bowl, cup, glass, piece, plate, tbsp, tsp → grams/ml per food category.                                                                                                                                                                                                                        |
| F4  | Accuracy test set                                  | 50 meal descriptions with nutritionist-estimated values to measure the pipeline.                                                                                                                                                                                                                       |

## G. Design work 🔴/🟠

| #   | Item                                                                                       |
| --- | ------------------------------------------------------------------------------------------ |
| G1  | App icon (1024×1024), splash screen, brand colours, typography.                            |
| G2  | Low-fidelity wireframes for the 8 screens (Figma) — can be done in parallel with Week 1.   |
| G3  | Store screenshots (6.7" iPhone, 6.5", Android phone) and short/long descriptions — Week 6. |
| G4  | Accessibility check: contrast, dynamic type, screen reader labels.                         |

## H. Devices & testing 🟠

- At least one physical **iPhone** and one **Android** phone (push notifications don't fully work on simulators).
- Install **Expo Go** for early work and **development builds** once native modules (notifications) are added.
- Recruit **10–30 beta testers** (adults, mix of Android/iOS, some vegetarian/Indian diets). Collect Apple IDs / Google emails for TestFlight / Play internal testing.
- Prepare a feedback form and a beta consent message.

## I. Operations 🟡

- Create on-call / alert routing (email or Slack) for API errors, job failures, LLM provider outages, spend alerts.
- Set Anthropic and hosting **spend alerts**.
- Decide backup/restore procedure; do one restore drill before beta.
- Write a short **incident response** note (who to call, how to disable AI features via a feature flag, how to notify users of a breach).

---

## Day-0 quick-start order

1. Decide A1–A4 → 2. Start Apple Developer enrolment (slowest) → 3. Create GitHub, Supabase (dev), Anthropic, Expo, hosting accounts → 4. Put keys in the password manager → 5. Share `.env` values with developers securely → 6. Engage a lawyer for D1–D5 and a health/nutrition advisor for E1–E4, F2 → 7. Begin Day 1 of the [build plan](11-build-plan.md).
