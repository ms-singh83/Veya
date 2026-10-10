# 05 — API Specification

Base path `/api/v1` · JSON · `Authorization: Bearer <supabase_access_token>` on every route except `/health`.

## 1. Conventions

- **Validation**: Zod on params, query and body. Unknown fields rejected (`.strict()`).
- **Casing**: `snake_case` JSON.
- **Dates**: timestamps ISO-8601 with offset; local dates `YYYY-MM-DD`; local times `HH:mm`.
- **Idempotency**: all `POST` creating records accept `Idempotency-Key` (UUID). Same key + same user returns the original response for 48 h.
- **Pagination**: cursor-based: `?limit=20&cursor=<opaque>` → `{ data, next_cursor }`.
- **Rate limiting**: headers `RateLimit-Limit`, `RateLimit-Remaining`, `Retry-After`.
- **Logging**: never log tokens, chat content, food descriptions or health values. Log request id, route, status, latency, user id hash.

### Error envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "amount_ml must be between 1 and 2000",
    "details": [{ "path": "amount_ml", "issue": "too_big" }],
    "request_id": "req_..."
  }
}
```

| Code                      | HTTP | Meaning                                             |
| ------------------------- | ---- | --------------------------------------------------- |
| `VALIDATION_ERROR`        | 400  | Bad input                                           |
| `UNAUTHORIZED`            | 401  | Missing/invalid token                               |
| `FORBIDDEN`               | 403  | Not allowed (e.g. consent missing, under-age)       |
| `NOT_FOUND`               | 404  | Not found **or not owned** (never reveal existence) |
| `CONFLICT`                | 409  | Duplicate / state conflict                          |
| `CONSENT_REQUIRED`        | 403  | AI feature without AI consent                       |
| `RATE_LIMITED`            | 429  | Too many requests / AI budget exceeded              |
| `AI_PROVIDER_UNAVAILABLE` | 503  | LLM down/timeouts; client shows fallback            |
| `AI_OUTPUT_INVALID`       | 502  | Model output failed validation after retry          |
| `INTERNAL_ERROR`          | 500  | Unexpected                                          |

## 2. Profile & account

| Method | Path                      | Body / query                                                                         | Response                                                                                          |
| ------ | ------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| GET    | `/me`                     | —                                                                                    | `{ user_id, display_name, age_band, timezone, locale, onboarding_completed_at, consents: [...] }` |
| PATCH  | `/me`                     | `{ display_name?, age_band?, timezone?, locale? }`                                   | profile                                                                                           |
| POST   | `/me/onboarding`          | `{ age_confirmed_adult: true, timezone, consents: [{type, version}], preferences? }` | profile; creates prefs + default reminders                                                        |
| POST   | `/me/onboarding/complete` | —                                                                                    | sets `onboarding_completed_at`                                                                    |
| GET    | `/preferences`            | —                                                                                    | preferences                                                                                       |
| PUT    | `/preferences`            | full preferences object                                                              | preferences                                                                                       |
| GET    | `/consents`               | —                                                                                    | list (current state per type)                                                                     |
| POST   | `/consents`               | `{ consent_type, version, granted: boolean }`                                        | consent state                                                                                     |
| POST   | `/me/export`              | —                                                                                    | `202 { export_id, status: "queued" }`                                                             |
| GET    | `/me/export/:id`          | —                                                                                    | `{ status, download_url?, expires_at? }`                                                          |
| DELETE | `/me`                     | `{ confirm: "DELETE" }` + recent re-auth                                             | `202 { deletion_scheduled_at }`                                                                   |

## 3. Plans & tasks

| Method | Path                               | Notes                                                                                   |
| ------ | ---------------------------------- | --------------------------------------------------------------------------------------- |
| GET    | `/plans/today`                     | Uses profile tz to compute local date. `404 NOT_FOUND` if none → client calls generate. |
| GET    | `/plans?date=YYYY-MM-DD`           | Specific day                                                                            |
| POST   | `/plans/generate`                  | `{ local_date?, regenerate?: boolean }`. Returns plan (AI or template, `source` field). |
| POST   | `/plans/adjust`                    | `{ feedback?: string }` → `{ proposal_id, changes: [...] }`                             |
| POST   | `/plans/adjust/:proposal_id/apply` | `{ accepted_change_ids: [] }` → updated plan                                            |
| POST   | `/tasks`                           | Create user/confirmed task `{ category, title, scheduled_local_time?, source }`         |
| PATCH  | `/tasks/:id`                       | `{ status: done                                                                         | skipped | pending | snoozed, snoozed_until? }` |
| DELETE | `/tasks/:id`                       |                                                                                         |

**Plan response**

```json
{
  "id": "uuid",
  "plan_date": "2026-10-10",
  "source": "ai",
  "summary": "Focus on consistent meals and movement today.",
  "tasks": [
    {
      "id": "uuid",
      "category": "activity",
      "title": "Take a comfortable walk",
      "scheduled_at": "2026-10-10T12:30:00Z",
      "local_time": "18:00",
      "status": "pending",
      "reason": "Supports your activity goal"
    }
  ],
  "progress": { "done": 1, "total": 5 }
}
```

## 4. Food

| Method | Path                            | Notes                                         |
| ------ | ------------------------------- | --------------------------------------------- |
| GET    | `/foods/search?q=roti&limit=10` | Reference food search (no AI)                 |
| POST   | `/food-entries/estimate`        | Parse + estimate, not saved                   |
| POST   | `/food-entries`                 | Save confirmed entry                          |
| GET    | `/food-entries?date=YYYY-MM-DD` | Day's meals + totals                          |
| PATCH  | `/food-entries/:id`             | Edit meal (items replaced, totals recomputed) |
| DELETE | `/food-entries/:id`             |                                               |

**POST /food-entries/estimate**

```json
// request
{ "description": "Two medium homemade rotis and one bowl of dal", "meal_type": "lunch", "consumed_at": "2026-10-10T13:00:00+05:30" }
// response — needs clarification
{
  "estimate_id": "uuid", "status": "needs_user_confirmation",
  "items": [
    { "item_id": "i1", "food_name": "Roti (whole wheat)", "food_reference": "local:roti_wheat", "quantity": 2, "unit": "medium",
      "serving_weight_g": 80, "calories": 240, "protein_g": 7.9, "carbs_g": 46.0, "fat_g": 3.0,
      "estimate_status": "estimated", "confidence": "medium", "basis_note": "Standard recipe, ~40 g per medium roti, no ghee" },
    { "item_id": "i2", "food_name": "Dal", "quantity": 1, "unit": "bowl", "calories": null,
      "estimate_status": "clarification_needed", "question": "Which dal, and roughly how big was the bowl?",
      "options": ["Toor dal, 1 katori (~150 ml)", "Moong dal, 1 katori", "Dal makhani, 1 bowl (~250 ml)"] }
  ],
  "totals": { "calories": null, "coverage": "1_of_2_items" },
  "message": "Please confirm the dal type and portion. Values are approximate."
}
```

`status` ∈ `estimated` | `needs_user_confirmation` | `no_match`.

**POST /food-entries**

```json
{ "estimate_id": "uuid", "meal_type": "lunch", "consumed_at": "...", "items": [ { "item_id": "i1" }, { "item_id": "i2", "selected_option": 0 } ], "notes": null }
// or manual items without estimate:
{ "meal_type": "snack", "consumed_at": "...", "items": [{ "food_name": "Apple", "quantity": 1, "unit": "medium", "calories": null }] }
```

Server recomputes nutrients from references; client-sent nutrient values are accepted only with `estimate_source: "USER_ENTERED"`.

## 5. Habit logs

| Method       | Path                 | Body                                                                     |
| ------------ | -------------------- | ------------------------------------------------------------------------ |
| POST         | `/water-logs`        | `{ amount_ml: 1..2000, logged_at? }`                                     |
| GET          | `/water-logs?date=`  |                                                                          |
| DELETE       | `/water-logs/:id`    |                                                                          |
| POST         | `/sleep-logs`        | `{ started_at, ended_at, quality? }` or `{ ended_at, duration_minutes }` |
| PATCH/DELETE | `/sleep-logs/:id`    |                                                                          |
| POST         | `/activity-logs`     | `{ activity_type, duration_minutes, steps?, distance_m?, logged_at? }`   |
| PATCH/DELETE | `/activity-logs/:id` |                                                                          |

Validation: `logged_at` not more than 5 min in the future; not older than 30 days (MVP); sleep overlapping existing log → `409 CONFLICT` with `details.overlapping_id`.

## 6. Metrics

| Method | Path                                                       | Response                                                                                                                                                           |
| ------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/metrics/daily?from=YYYY-MM-DD&to=YYYY-MM-DD` (≤ 31 days) | `[{ date, water_ml, water_logged, sleep_minutes, sleep_logged, activity_minutes, steps, meals_logged, calories_est, calories_coverage, tasks_done, tasks_total }]` |
| GET    | `/metrics/weekly?week_start=YYYY-MM-DD`                    | weekly aggregate object (see [08](08-weekly-reports.md))                                                                                                           |

Unlogged → `null`, never `0`.

## 7. Chat

| Method | Path                                  | Notes                                                                |
| ------ | ------------------------------------- | -------------------------------------------------------------------- |
| POST   | `/chat/sessions`                      | `{ title? }` → session                                               |
| GET    | `/chat/sessions`                      | paginated                                                            |
| DELETE | `/chat/sessions/:id`                  | deletes messages                                                     |
| GET    | `/chat/sessions/:id/messages?cursor=` | paginated, newest first                                              |
| POST   | `/chat/sessions/:id/messages`         | `{ content (≤ 2000 chars), client_message_id }` → SSE stream or JSON |
| POST   | `/chat/actions/:action_id/confirm`    | `{ edits? }` → executes the proposed write                           |
| POST   | `/chat/actions/:action_id/dismiss`    |                                                                      |

**Assistant message response**

```json
{
  "message": {
    "id": "uuid",
    "role": "assistant",
    "content": "A 20-minute evening walk is a gentle way to …",
    "safety_status": "ok"
  },
  "actions": [
    {
      "action_id": "uuid",
      "type": "create_wellness_task",
      "preview": { "category": "activity", "title": "Evening walk, 20 min", "local_time": "18:30" },
      "expires_at": "..."
    }
  ],
  "references": [{ "title": "Physical activity basics", "source": "WHO" }]
}
```

## 8. Reports

| Method | Path                          | Notes                           |
| ------ | ----------------------------- | ------------------------------- |
| GET    | `/reports/weekly?week_start=` | latest generation for that week |
| POST   | `/reports/weekly/generate`    | `{ week_start }` — rate-limited |

## 9. Reminders & devices

| Method | Path                    | Body                                                                                             |
| ------ | ----------------------- | ------------------------------------------------------------------------------------------------ |
| GET    | `/reminders`            | → `{ quiet_hours, max_per_day, categories: [{ category, enabled, local_times, days_of_week }] }` |
| PUT    | `/reminders`            | same shape; triggers re-materialisation                                                          |
| GET    | `/reminders/pending`    | next 24 h scheduled notifications                                                                |
| POST   | `/reminders/:id/snooze` | `{ minutes: 15                                                                                   | 60  | "tomorrow" }` |
| POST   | `/devices`              | `{ push_token, platform }` upsert                                                                |
| DELETE | `/devices/:id`          | disable                                                                                          |

## 10. Health

`GET /health` → `{ status: "ok", db: "ok", version }` (no auth, no secrets).
