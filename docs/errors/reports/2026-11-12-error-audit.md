---
title: Perdido Peas error audit
date: 2026-11-12
window: 2026-11-11T03:34:11Z to 2026-11-13T03:34:11Z
workers: perdido-peas-web-production
layers: invocations, logs, zone, grafana
layers_failed: none (grafana-errors.mjs lacked the exec bit and was run via `node`; exit 126 when run directly, the `node` run itself succeeded)
layer2_warnings: none
logs_truncated: false (48h window, well inside the 7-day Workers Logs retention)
data: ./2026-11-12/
---

# Perdido Peas error audit

**Verdict in three sentences.** Production is clean: `perdido-peas-web-production` served 4 requests over the requested 48-hour window with 0 errors on every layer (Cloudflare invocations on the single deployed version, Cloudflare logs, Grafana Loki and traces), and no app-scoped Grafana alert is firing or pending. This is a single-page static children's picture-book site on Next.js/OpenNext Workers that serves entirely on `*.workers.dev`, so it has no custom-domain zone and edge 5xx (layer 3) does not cover it. There is nothing to fix, and unlike the previous run the Grafana export history begins about 1.6 hours before the window opened, so the Grafana layers cover the whole window rather than starting mid-window.

## Numbers

| | This run | Last run (2026-10-29, 7d) |
| --- | --- | --- |
| Worker errors (layer 1, deployed versions) | 0 | 0 |
| Error rate (deployed versions) | 0.000% of 4 | 0.000% of 20 |
| Versionless failures (local dev, excluded) | 0 | 0 |
| Distinct error groups (layer 2) | 0 | 0 |
| Log events (layer 2) | 0 error-level (Grafana Loki: 4 lines, all `info`, 0 error/warn, exact, not truncated) | 18 (all `info`) |
| Edge 5xx (layer 3, whole UTC days) | n/a: no custom-domain zone (serves on `*.workers.dev`) | n/a: no custom-domain zone |
| Grafana alerts firing / pending (G1) | 0 / 0 (app-scoped; 1 healthy rule exists in the "Perdido Peas" folder) | 0 / 0 |
| Grafana 5xx by path, top path (G2) | 0 | 0 |
| Error spans (G3 spanmetrics; job-canceled apart) | 0 of 4 `GET` server calls | 0 of 18 |
| GA `exception` events | n/a: no GA tag on this site | n/a |
| Crashlytics fatals / ASC TF crashes | n/a: web-only app, no iOS target | n/a |

"Last run" is filled from `2026-10-29-error-audit.md`. Both runs land on severity noise; the request count is lower here only because this window is 48 hours versus 7 days.

## Fix now

Nothing. No errors were observed on any layer, so there is no file-level finding to place. Per the audit rules, the list is not padded with findings that could not be mapped to a repo path.

## Batch

Nothing. No real-but-cheap issues surfaced.

## Deliberately skipped

- **`clientDisconnected`**: 0 rows for this worker (`invocations.json` -> `statuses` is `{success: 4}`, `failingStatuses` empty). It is a client hanging up, not a server error, and would go here if present. None observed.
- **Versionless layer 1 failures** (empty `scriptVersion`, local `wrangler dev` under the production Worker name): `versionless.requests` 0, `errors` 0, `onlyTraffic` false in `invocations.json`. Nothing to exclude; all 4 requests are on the deployed version `e23be9d7-0f60-4424-9b5f-d00d370d9956`.
- **Fleet-wide Grafana folder firings**: `grafana.json` shows the account-wide `Fleet` folder with 3 firing / 2 pending, but `alerts.rules` is empty for this app and none of those rules are scoped to `perdido-peas-web-production`. The app-scoped result is 0 firing / 0 pending, which is the only figure that applies here. The app's own folder ("Perdido Peas") holds 1 rule, healthy and not firing. No firing absence rule exists for this app, so there is no Grafana-driven finding.

## Blind spots

What this audit could not see:
- **Edge 5xx (layer 3) does not cover this app.** `perdido-peas` serves on `perdido-peas-web-production.<account>.workers.dev` with `workers_dev: true` and no `custom_domain` route (`web/wrangler.jsonc`), so it has no zone in the account-wide discovery (`~/Developer/Repos/docs/errors/reports/2026-11-12/zone.json`); a grep for `perdido` there returns nothing. That discovery's zone coverage ran whole-UTC-day from 2026-11-11T00:00:00Z to 2026-11-13T03:22:17Z (3.4 hours of overhang before the window, 0 after), but none of its 20 zones are this app's. Edge-level 5xx for this app's `workers.dev` traffic is therefore unmeasured, as it has been on every prior run.
- **Workers with observability disabled**: none. `web/wrangler.jsonc` sets `observability.enabled: true`, `head_sampling_rate: 1`, logs persisted (7-day copy) and both traces and logs exported to Grafana Cloud.
- **Layer 2 warnings**: none (no `!!!`). `logs.json` returned `ok: true`, `exact: true`, `scoped: true`, 0 groups, empty `warnings`, so layer 2 is clean (not unknown) and no manual Workers Logs query (`logs-manual.json`) was needed.
- **Layer 2 counts marked `~`**: none; the Loki and logs figures are exact (`slices.querySampled: 0`, `storedSampled: 0`, `exact: true`).
- **Layer 2 truncation**: none. The 48-hour window is well inside the 7-day Workers Logs retention (`truncated: false`, `effectiveFrom` equals the window start).
- **Grafana history**: covers the full window this run. The worker's first Loki/trace line is 2026-11-11T02:00:00Z, about 1.6 hours before the window opened at 2026-11-11T03:34:27Z, so there is no mid-window history gap (the collector printed no `!` line), unlike the 2026-10-29 run where history started ~44.8 hours in.
- **GA**: no gtag/analytics tag on this site, so client-side JS exceptions are not captured regardless.
- **Crashlytics / TestFlight**: not applicable; there is no iOS target.
- **Collector note**: `grafana-errors.mjs` was not executable (exit 126 run directly) and was run with `node` instead; the run completed normally (`ok: true` on every section), so this is an environment nit, not missing data.
- **Build and deploy failures**: not covered (the cloudflare-builds MCP needs OAuth). Deploy context: the live version is now `e23be9d7-0f60-4424-9b5f-d00d370d9956`, changed from `e95af531-423a-482a-beff-52ec1e7272f7` at the 2026-10-29 audit. All 4 requests ran on this single version with 0 errors, so no version boundary correlates with any failure (there were none). The commits since the last audit are chores: `2c6658b` (Node 24 pin, #13) and `9c654ec` (error-audit docs, #14); the last worker-affecting change was `646f690` (Grafana export, #8, 2026-10-23).

## Outcome

Not applicable. Severity is noise and no fix is being shipped, so there is no before/after to verify.
