# Wiring Up the Recurring Briefing

## Creating the Routine

Use the Claude Code Remote `create_trigger` tool:

- `create_new_session_on_fire: true` — each firing is a clean session; the prompt must be fully self-contained since there's no memory of the prior week's briefing.
- `cron_expression` — weekly is the default (e.g. `0 5 * * 1` for Monday 08:00 Athens time in summer / EEST, UTC+3). Align to the subject's known quarterly/annual reporting dates if those matter — consider a one-off extra check via `fire_trigger` around those dates rather than changing the base cadence.
- `notifications` — if no mail connector (e.g. Gmail) is available to fired sessions in this org, set `{ email: true }` so the harness's own completion notification delivers the run's final response as the email. In that case, write the full structured briefing as the last thing the agent outputs — not a short status line — since that becomes the email body. If a mail connector *is* available, the agent can compose and send a proper email directly instead.

## Template Prompt

```
Produce this week's strategic briefing on [SUBJECT — exact name + disambiguating
context, e.g. "the Athens International Airport (AIA) expansion project"].

Research passes, in order:
1. Official sources: [subject's newsroom/press page, regulator, parent company
   investor relations]
2. Domestic press: [list relevant outlets]
3. International press: [list relevant outlets]
4. Periodic reports: check whether a quarterly/annual report or traffic/production
   statistics release has come out since the last briefing

Restrict to developments from the past 7 days, except confirmed periodic report
releases which should be reported regardless of the 7-day window.

Structure the briefing in three sections: Progress, Red Flags, Opportunities.
If a section has nothing new this week, say so in one line rather than omitting
it. Cite outlet + headline + date for every claim, and label speculation
("sources say," analyst opinion) explicitly as such.

Write the complete briefing as your final response — it will be delivered to
the user as an email, so it should read as a standalone document, not a status
update.
```

## Testing

Offer to fire the Routine once immediately with `fire_trigger` so the user can review the briefing's depth and format before waiting a full week for the first scheduled run.
