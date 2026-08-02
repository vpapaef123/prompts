# Wiring Up the Recurring Run

## Creating the Routine

Use the Claude Code Remote `create_trigger` tool:

- `create_new_session_on_fire: true` — each firing is a clean session with full tool access (WebSearch, Indeed MCP, PushNotification, Gmail). This matters because the prompt must be fully self-contained; a fresh session has no memory of prior runs.
- `cron_expression` — daily cadence, in UTC. Convert the user's local time first (Athens is UTC+2 in winter / EEST UTC+3 in summer — check which is in effect).
- `notifications` — for fresh-session Routines, `{ push: true }` (and/or `email: true`) controls the harness's own completion summary. This is separate from an explicit `PushNotification` tool call made inside the run — set both consistently with what the user asked for.

## Template Prompt

Write the Routine's `prompt` field as a complete standalone instruction — it will not see this conversation. Example shape:

```
Run today's job search for [USER NAME] ([email]).

Target: [exact role/titles + adjacent titles], based in / open to [location scope].

Pass 1 — Greek sources first: kariera.gr, skywalker.gr, jobfind.gr, LinkedIn Jobs
(Greece filter). Restrict to postings from the last 24-48 hours.

Pass 2 — International/EU sources: LinkedIn Jobs (Remote/EU filter), Indeed
(use mcp__Indeed__search_jobs if available), EuroJobs, remoteok.com,
weworkremotely.com. Restrict to postings from the last 24-48 hours.

If you find one or more new postings that genuinely match the target role
and location: send ONE push notification summarizing all of them (title,
company, location, source, link).

If nothing matches: end without sending a notification. Do not report a
"nothing found" result to the user.
```

## Cron Guidance

- Minimum interval for Routines is hourly; daily is expressed as a single fixed UTC time, e.g. `0 5 * * *` for 08:00 Athens time in summer (EEST, UTC+3).
- Re-check the UTC offset when Greece switches to winter time (EET, UTC+2) and update the cron expression with `update_trigger` if the user wants the local fire time to stay fixed.

## Testing

Before relying on the schedule, offer to fire the Routine once immediately with `fire_trigger` so the user can confirm the notification format and content before waiting a full day for the first real run.
