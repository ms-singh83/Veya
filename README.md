# LifeHealth AI (repo: Veya)

> Your personal everyday wellness agent. Helps adults understand their habits, follow realistic wellness routines, and improve consistency over time.

LifeHealth AI is a mobile-first **consumer wellness** app (iOS + Android). It is **not** a medical or diagnostic product.

## Start here

| # | Document | What it covers |
|---|----------|----------------|
| 00 | [Manual setup checklist](docs/00-manual-setup.md) | **Everything a human must do before/while the code is built**: accounts, keys, legal, content, devices |
| 11 | [Day-wise build plan](docs/11-build-plan.md) | 30 working days (6 weeks) from empty repo to closed beta |
| 01 | [Product requirements (PRD)](docs/01-product-requirements.md) | Scope, personas, screens, acceptance criteria |
| 02 | [Technical architecture](docs/02-architecture.md) | Stack, repo layout, request flow, environments |
| 03 | [Database schema](docs/03-database.md) | Tables, constraints, Prisma schema, RLS, retention |
| 04 | [AI agent design](docs/04-ai-agent.md) | Orchestrator, tool registry, prompts, structured output contracts |
| 05 | [API specification](docs/05-api-spec.md) | REST endpoints, payloads, error codes, conventions |
| 06 | [Nutrition estimation](docs/06-nutrition.md) | Food matching pipeline and uncertainty rules |
| 07 | [Reminders & scheduled jobs](docs/07-reminders-and-jobs.md) | Scheduling, dedupe, quiet hours, DST |
| 08 | [Weekly reports](docs/08-weekly-reports.md) | Deterministic metrics + grounded AI summary |
| 09 | [Safety, privacy & compliance](docs/09-safety-privacy.md) | Medical boundaries, DPDP, store policies |
| 10 | [Testing & QA](docs/10-testing-qa.md) | Test strategy, safety eval set, release checklist |

## Core promise

> Every day, LifeHealth AI helps you decide what to do for your well-being, makes tracking easy, and helps you stay consistent.

## Tech stack (summary)

React Native + Expo + TypeScript · Node.js + Express + TypeScript + Zod · Supabase (Postgres + Auth) · Prisma · Claude API (server-side, structured outputs) · Expo Notifications · managed Node hosting.
