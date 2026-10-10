<p align="center">
  <img src="apps/mobile/assets/icon.png" width="120" alt="Veya" />
</p>

<h1 align="center">veya</h1>
<p align="center"><em>Your everyday wellness, intelligently cared for.</em></p>
<p align="center">Personal · Proactive · AI-powered</p>

Veya is your personal everyday wellness agent. It helps adults understand their habits, follow realistic wellness routines, and improve consistency over time.

Veya is a mobile-first **consumer wellness** app (iOS + Android). It is **not** a medical or diagnostic product.

## Start here

| #   | Document                                                      | What it covers                                                                                         |
| --- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 00  | [Manual setup checklist](docs/00-manual-setup.md)             | **Everything a human must do before/while the code is built**: accounts, keys, legal, content, devices |
| 11  | [Day-wise build plan](docs/11-build-plan.md)                  | 30 working days (6 weeks) from empty repo to closed beta                                               |
| 01  | [Product requirements (PRD)](docs/01-product-requirements.md) | Scope, personas, screens, acceptance criteria                                                          |
| 02  | [Technical architecture](docs/02-architecture.md)             | Stack, repo layout, request flow, environments                                                         |
| 03  | [Database schema](docs/03-database.md)                        | Tables, constraints, Prisma schema, RLS, retention                                                     |
| 04  | [AI agent design](docs/04-ai-agent.md)                        | Orchestrator, tool registry, prompts, structured output contracts                                      |
| 05  | [API specification](docs/05-api-spec.md)                      | REST endpoints, payloads, error codes, conventions                                                     |
| 06  | [Nutrition estimation](docs/06-nutrition.md)                  | Food matching pipeline and uncertainty rules                                                           |
| 07  | [Reminders & scheduled jobs](docs/07-reminders-and-jobs.md)   | Scheduling, dedupe, quiet hours, DST                                                                   |
| 08  | [Weekly reports](docs/08-weekly-reports.md)                   | Deterministic metrics + grounded AI summary                                                            |
| 09  | [Safety, privacy & compliance](docs/09-safety-privacy.md)     | Medical boundaries, DPDP, store policies                                                               |
| 10  | [Testing & QA](docs/10-testing-qa.md)                         | Test strategy, safety eval set, release checklist                                                      |

## Getting started

Requirements: Node 22.12+ and pnpm 10 (`corepack enable`).

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm dev:api      # API on http://localhost:4000 (GET /health)
```

> Run mobile commands with the root `pnpm` scripts below (or from inside `apps/mobile`).
> Running `npx expo start` at the **repo root** fails with _"Could not resolve react-native"_ /
> _"iOS is disabled"_, because the root is the workspace, not the Expo app.

### iOS Simulator (Xcode)

One-time setup on your Mac:

1. Install the latest **Xcode** from the App Store, open it once and accept the licence.
2. Xcode → Settings → Components: install an **iOS Simulator** runtime.
3. `xcode-select --install` (command line tools) and `brew install cocoapods watchman`.

Then, from the repo root:

```bash
pnpm ios          # builds the native app with Xcode, installs it on the simulator and starts Metro
```

To build and run from the Xcode UI instead:

```bash
pnpm ios:xcode    # generates apps/mobile/ios (+ CocoaPods) and opens it in Xcode
pnpm start        # keep Metro running in a terminal
```

In Xcode pick the **Veya** scheme and an iPhone simulator, then press **Run (⌘R)**.

Notes:

- `apps/mobile/ios` is generated (Continuous Native Generation) and git-ignored — never edit it by hand;
  change `app.json` / config plugins and re-run `pnpm ios:xcode` (add `--clean` to the prebuild to regenerate).
- If Xcode can't find `node` (common with nvm), create `apps/mobile/ios/.xcode.env.local` containing
  `export NODE_BINARY=$(which node)` using the path printed by `which node` in your terminal.
- If port 8081 is busy (another Metro project), stop it or accept the alternate port Expo offers.

### Expo Go / Android / web

```bash
pnpm start        # dev server (press s to switch between development build and Expo Go)
pnpm android      # native Android build (Android Studio + emulator required)
pnpm --filter @veya/mobile web
```

Checks (same as CI): `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test`.

## Repository layout

```
apps/mobile      Expo + Expo Router app (src/app = routes, src/components, src/theme)
apps/api         Express API (env validation, redacted logging, request ids, error envelope)
packages/shared  Brand tokens, error codes and API contracts shared by app and API
docs/            Product, architecture and build-plan documentation
```

## Core promise

> Every day, Veya helps you decide what to do for your well-being, makes tracking easy, and helps you stay consistent.

## Tech stack (summary)

React Native + Expo + TypeScript · Node.js + Express + TypeScript + Zod · Supabase (Postgres + Auth) · Prisma · Claude API (server-side, structured outputs) · Expo Notifications · managed Node hosting.
