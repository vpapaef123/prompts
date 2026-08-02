# Job Sources Reference

## Greek Sources (Pass 1)

| Source | Notes | Query pattern |
|---|---|---|
| kariera.gr | Largest Greek job board; supports category + location filters | `site:kariera.gr [role] [location]` or use site search directly |
| skywalker.gr | Strong for corporate/management roles | `site:skywalker.gr [role]` |
| jobfind.gr | Broad general listings | `site:jobfind.gr [role]` |
| LinkedIn Jobs (Greece filter) | Best for management/exec roles; use LinkedIn's own location + date-posted filters | `[role] Greece` with LinkedIn's "Past 24 hours" filter |
| ergasia.gov.gr / ΔΥΠΑ (ΟΑΕΔ) | Public-sector and ΔΥΠΑ-listed postings; only relevant if the role fits | Direct site browse — no reliable general web search index |
| Company career pages | Only if the user has named target employers | `[company name] careers [role]` |

## International / EU Sources (Pass 2)

| Source | Notes | Query pattern |
|---|---|---|
| LinkedIn Jobs | Filter to target countries or "Remote"; use date-posted filter | `[role] Remote OR EU` |
| Indeed | Use `mcp__Indeed__search_jobs` tool when available (structured results); fall back to `site:indeed.com` WebSearch otherwise | tool query: role + location |
| EuroJobs (eurojobs.com) | EU-wide, some remote | `site:eurojobs.com [role]` |
| remoteok.com | Remote-first roles, mostly tech/ops/exec | `site:remoteok.com [role]` |
| weworkremotely.com | Remote-first, broad categories | `site:weworkremotely.com [role]` |
| EU-Startups Jobs | Startup/scaleup management roles across the EU | `site:eu-startups.com/jobs [role]` |

## Search Hygiene

- Always try to restrict to postings from the last 24-48 hours — a search without a date filter will resurface the same listings every run
- When a site supports a native "posted date" filter (LinkedIn, Indeed), use it instead of guessing from WebSearch snippets
- Note the exact source and a direct link for every posting reported — the user needs to verify and apply themselves
