---
name: strategic-project-intelligence
description: Build a recurring strategic-picture briefing on a named project, company, or infrastructure program — progress, red flags, and opportunities — sourced from press coverage, official announcements, and periodic (quarterly/annual) reports. Use when the user wants ongoing intelligence on a specific project or company (e.g. "keep an eye on X's expansion," "track progress and risks at Y," "weekly briefing on Z"), not a one-off lookup. For job-opening monitoring specifically, see job-search-alerts instead.
metadata:
  version: 1.0.0
---

# Strategic Project Intelligence Briefing

Produces a structured, recurring briefing on a specific named subject (a company, infrastructure project, or program) covering three things: what's progressing, what's a risk, and what's an opening. Designed to run as a scheduled agent (a Routine/cron firing) with no memory of prior runs, so each briefing must stand on its own.

## Before Setting Up

Nail these down before building the recurring briefing — a vague subject produces a generic news summary, not strategic intelligence:

1. **Exact subject** — the company, project, or program name, and enough context to disambiguate it (e.g. "Athens International Airport expansion project," not just "AIA")
2. **What "progress" means here** — construction milestones, financial results, regulatory approvals, traffic/output figures, leadership changes — whatever is relevant to this subject
3. **Cadence** — weekly is the default for this kind of briefing (press and filings don't move daily); confirm against quarterly/annual reporting calendars if the subject has known reporting dates
4. **Delivery channel** — email digest suits a full written briefing better than a push notification, which suits a short alert; confirm which the user wants

Don't guess these — ask if not provided.

## Research Passes

Run these in order and note which sources actually turned up something — an empty pass is worth reporting as "no new [official announcements/press] this period," unlike job-search-alerts where an empty result should be silent. A strategic briefing's value is partly in confirming nothing changed.

### 1. Official / primary sources

The subject's own announcements: press releases, investor/newsroom pages, regulatory filings, parent-company or concession-authority statements. These carry the most weight and should be checked first and cited by name.

### 2. Press coverage — domestic first, then international

For a Greek-based subject: Naftemporiki, Kathimerini (Οικονομία), Capital.gr, Reporter.gr, insider.gr, and the relevant trade press for the sector (e.g. aviation trade press for an airport project). Then international coverage: Reuters, Bloomberg, and sector trade publications (e.g. Construction Europe, Airport Technology, ACI Europe for aviation infrastructure).

### 3. Periodic reports

Quarterly and annual reports, traffic/production statistics, and analyst notes where publicly available. These are the highest-signal source for hard numbers (capex spent, capacity delivered, revenue, delays) — prioritize them over press paraphrasing when both are available for the same fact.

See [sources.md](references/sources.md) for a fuller source list and query patterns.

## Structuring the Briefing

Every briefing should land in three sections, each with cited sources:

- **Progress** — concrete milestones reached since the last known state (construction phases completed, approvals granted, financial/traffic results, leadership or governance changes)
- **Red Flags** — anything indicating delay, cost overrun, regulatory friction, opposition (local, environmental, political), contractor/dispute issues, or numbers that miss stated targets
- **Opportunities** — upcoming tenders, hiring signals, partnership/expansion announcements, or anything indicating the project is opening doors (for employment, investment, or partnership angles relevant to the user)

Keep each section to what's genuinely new or notable this period — don't pad with restated background just to fill the section. If a section has nothing new, say so in one line rather than omitting it silently (unlike job-search-alerts' notify-only-on-match rule, a strategic briefing should confirm coverage even when quiet).

## Delivery

- **Email digest**: write the full structured briefing as the run's final response. If no Gmail (or other mail) connector is available to the session, rely on the Routine's own completion-notification email (`notifications: {email: true}` on the trigger) to deliver that final response — write it as the complete, standalone document the user will read, not a short status line.
- **Push notification**: only for a condensed top-line version (1-3 bullet highlights) — use when the user wants a quick heads-up rather than the full document.

See [notification-setup.md](references/notification-setup.md) for wiring this into a Claude Code Remote Routine.

## Related Skills

- **job-search-alerts**: For monitoring job openings specifically (notify-only-on-new-match, not a standing briefing)
- **competitive-analyst**: For structured competitor benchmarking, if the subject is being tracked relative to rivals rather than on its own progress
