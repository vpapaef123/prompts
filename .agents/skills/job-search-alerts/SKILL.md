---
name: job-search-alerts
description: Run a recurring daily job search that checks credible Greek sources first, then international sources, and surfaces only new openings that match the target role/location criteria. Use when the user wants a daily or recurring job search, job alert, vacancy monitor, or asks to "keep an eye out" for new openings in a given field. Also use when setting up an automated notification for newly posted positions. Not for one-off "find me a job" lookups — see the ad-hoc search flow below for those.
metadata:
  version: 1.0.0
---

# Daily Job Search Alerts

Runs a repeatable, two-pass job search — Greek sources first, then international/EU sources — and notifies the user only when a genuinely new, matching opening appears. Designed to run as a scheduled agent (a Routine/cron firing), so each run starts with no memory of prior runs.

## Before Setting Up

Nail down the search criteria before building the recurring search — a vague query returns noise and trains the user to ignore the alerts:

1. **Role / field** — exact job titles or keywords (e.g. "General Manager," "Managing Director," "Country Manager," "COO"), plus adjacent titles worth matching
2. **Location scope** — Greece only, Greece + EU remote, or fully international/relocation
3. **Seniority / must-haves** — years of experience, industry, language requirements, salary floor if any
4. **Notification channel** — push notification, email digest, or both
5. **Cadence** — daily is the default; confirm the time of day

Don't guess these — ask if not provided. A daily automation that fires with the wrong criteria is worse than no automation, because it either misses real openings or trains the user to ignore it.

## Search Order

Always search in this order, and say which pass you're on:

### Pass 1 — Greek sources

Check credible Greek job boards and employer pages first:

- kariera.gr
- skywalker.gr
- jobfind.gr
- LinkedIn Jobs filtered to Greece
- ergasia.gov.gr / ΟΑΕΔ-ΔΥΠΑ listings, if the role fits public-sector or ΔΥΠΑ-listed postings
- Direct career pages of known employers in the target industry, if the user has named specific companies

See [sources.md](references/sources.md) for the full source list and search-query patterns per site.

### Pass 2 — International / EU sources

Then check international and EU-remote-friendly sources:

- LinkedIn Jobs filtered to the agreed countries or "remote"
- Indeed (use the `mcp__Indeed__search_jobs` tool if available; otherwise WebSearch site-restricted to indeed.com)
- EU-focused remote boards: EuroJobs, remoteok.com, weworkremotely.com, EU-Startups Jobs
- Relevant sector-specific boards if the user's field has one (e.g. a vertical job board)

Use `WebSearch` for sources without a dedicated tool. Restrict queries to postings from the last 24-48 hours where the site supports date filtering — a daily search that keeps resurfacing week-old listings erodes trust fast.

## What Counts as "New"

Each run has no memory of previous runs (unless it's resumed in the same session). To avoid repeat noise:

- Prefer sources/queries that support date filtering (posted in last 1-2 days) over relying on memory
- If the user wants strict de-duplication across days, maintain a simple log the agent can check each run (e.g. a dated list of previously-notified postings, kept in a file or note the user has access to) — set this up explicitly if the user asks for it; don't assume it exists
- When in doubt, prefer under-notifying to spamming: only surface postings you're confident are freshly posted and genuinely match the criteria

## Notifying

- If one or more new matching postings are found: send **one** notification covering all of them (not one per posting), with job title, company, location, source, and link for each
- If nothing matches: end quietly. Do not send a notification for an empty result — a daily "nothing found" message trains the user to ignore the channel
- Match the channel the user chose (push notification, email, or both) — see [notification-setup.md](references/notification-setup.md) for wiring this into a Claude Code Remote Routine

## Setting Up the Recurring Run

Use `create_trigger` (Claude Code Remote MCP) with `create_new_session_on_fire: true` so each firing is a clean run with full tool access, and a cron expression for the agreed cadence. The Routine's prompt must be fully self-contained — it starts with no memory of this conversation — and should restate: the target role/criteria, the two-pass source order above, and the notify-only-on-match rule.

See [notification-setup.md](references/notification-setup.md) for a template prompt and cron guidance.

## Related Skills

- **customer-research**: For researching companies/employers in depth once a target list exists
- **my-career-coach**: For broader career positioning, CV/LinkedIn audits, and promotion strategy (this skill only covers the search-and-alert mechanics)
