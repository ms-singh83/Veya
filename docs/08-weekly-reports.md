# 08 — Weekly Reports

Numbers from SQL. Words from the LLM. Words checked against numbers.

## 1. Pipeline

1. **Boundaries** — user-local week Monday 00:00 → Sunday 24:00 converted to UTC with the user's zone.
2. **Aggregate** — deterministic queries (below) → `metrics_json`.
3. **Validate coverage** — compute `days_logged` per metric; mark metrics with < 3 logged days as `insufficient_data`.
4. **Compare** — previous-week deltas only when both weeks have ≥ 3 logged days for that metric.
5. **Summarise** — LLM `REPORT_SUMMARY` receives only `metrics_json` and goals; returns structured `{ summary, highlights[], suggestions[2..3] }`.
6. **Fact-check** — every number in the text must appear in `metrics_json` (after rounding); no claims about unlogged days; banned medical language. Failure → retry once → fallback template summary.
7. **Store** — `weekly_reports` with `metrics_version`, `generation_version`, `data_fingerprint`.
8. **Regenerate** — allowed when the fingerprint of underlying data changed (UI shows "Your logs changed — refresh report").

## 2. Metrics definition (`metrics_version = 1`)

```json
{
  "week_start": "2026-10-05", "week_end": "2026-10-11", "timezone": "Asia/Kolkata",
  "coverage": { "days_with_any_log": 5 },
  "sleep":    { "nights_logged": 4, "avg_minutes_logged_nights": 412, "min_minutes": 360, "max_minutes": 470, "status": "ok" },
  "water":    { "days_logged": 3, "avg_ml_logged_days": 1650, "days_meeting_goal": 1, "goal_ml": 2000, "status": "ok" },
  "meals":    { "days_with_meals": 5, "entries": 11, "avg_calories_est_logged_days": 1580, "calorie_coverage_pct": 82, "avg_protein_g_est": 48, "status": "ok" },
  "activity": { "active_days": 2, "total_minutes": 75, "total_steps": null, "status": "insufficient_data" },
  "tasks":    { "done": 18, "total": 30, "completion_pct": 60 },
  "previous_week": { "sleep_avg_minutes_delta": 15, "water_avg_ml_delta": null, "tasks_completion_pct_delta": 10 }
}
```

Rules:
- Averages are over **logged** days only; text must say "on the 3 days you logged".
- Sleep night assigned to the local date of `ended_at`.
- Calories are estimates; `calorie_coverage_pct` = items with values / all items.
- `null` = unknown; never 0.

## 3. Example SQL (water)

```sql
SELECT (logged_at AT TIME ZONE $tz)::date AS local_day, SUM(amount_ml) AS ml
FROM water_logs
WHERE user_id = $user AND logged_at >= $week_start_utc AND logged_at < $week_end_utc
GROUP BY 1;
```
Service code computes `days_logged`, `avg_ml_logged_days`, `days_meeting_goal` from these rows.

## 4. Suggestions

- 2–3, each small and behaviour-based ("Try logging water at lunch on weekdays").
- Each suggestion → optional "Add to plan" → `create_wellness_task` proposal.
- Never: weight-loss targets, calorie restrictions, supplements, medical tests.

## 5. Sharing

Share sheet renders an image/text with coverage and task completion only by default; toggle "include details" to add sleep/water/meal numbers. No chat content ever.

## 6. Tests

- Fixture users with known logs → exact expected `metrics_json` (including DST week and a user in a negative-offset zone).
- LLM summary with injected wrong number → fact-checker rejects.
- Week with zero logs → report says "not enough data" without an LLM call.
