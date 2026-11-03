---
title: Perdido Peas error audit
date: 2026-10-29
window: 2026-10-22T04:09:02Z to 2026-10-29T04:09:02Z
workers: perdido-peas-web-production
layers: invocations, logs, zone, grafana
layers_failed: none (grafana-errors.mjs was not executable and ran via `node` instead; the run itself succeeded)
layer2_warnings: none
logs_truncated: effectively no (7d window at 7d retention; layer 2 starts 2026-10-22T04:08:59Z, 6s into the window)
data: ./2026-10-29/
---

# Perdido Peas error audit

**Verdict in three sentences.** Production is clean: `perdido-peas-web-production` served 20 requests over the 7-day window with 0 errors on every layer (Cloudflare invocations across 4 deployed versions, Cloudflare logs, Grafana Loki and traces), and no app-scoped Grafana alert is firing. This is a single-page static children's picture-book site on Next.js/OpenNext Workers serving entirely on `*.workers.dev`, so it has no custom-domain zone and edge 5xx (layer 3) does not cover it. There is nothing to fix; the only caveat is that Grafana history for this worker starts about 44.8 hours into the window, so that opening stretch is unknown at the Grafana layers rather than confirmed clean (Cloudflare layer 1 still covers the full window and is clean).

## Numbers

| | This run | Last run (2026-10-27, 4d) |
| --- | --- | --- |
| Worker errors (layer 1, deployed versions) | 0 | 0 |
| Error rate (deployed versions) | 0.000% of 20 | 0.000% of 14 |
| Versionless failures (local dev, excluded) | 0 | 0 |
| Distinct error groups (layer 2) | 0 | 0 |
| Log events (layer 2) | 18 (all `info`, 0 error/warn, exact, not truncated) | 14 (all `info`) |
| Edge 5xx (layer 3, whole UTC days) | n/a: no custom-domain zone (serves on `*.workers.dev`) | n/a: no custom-domain zone |
| Grafana alerts firing / pending (G1) | 0 / 0 (scoped to this app) | 0 / 0 |
| Grafana 5xx by path, top path (G2) | 0 | 0 |
| Error spans (G3 spanmetrics; job-canceled apart) | 0 of 18 `GET` server calls | 0 of 14 |
| GA `exception` events | n/a: no GA tag on this site | n/a |
| Crashlytics fatals / ASC TF crashes | n/a: web-only app, no iOS target | n/a |

"Last run" is filled from `2026-10-27-error-audit.md`. Both runs land on severity noise; counts are up only because this window is 7 days versus 4 and includes more low-volume crawler traffic.

## Fix now

Nothing. No errors were observed on any layer, so there is no file-level finding to place. Per the audit rules, the list is not padded with findings that could not be mapped to a repo path.

## Batch

Nothing. No real-but-cheap issues surfaced.

## Deliberately skipped

- **`clientDisconnected`**: 0 rows for this worker. It is a client hanging up, not a server error, and would go here if present. None observed.
- **Versionless layer 1 failures** (empty `scriptVersion`, local `wrangler dev` under the production Worker name): `versionless.requests` 0, `errors` 0 in `invocations.json`. Nothing to exclude.
- **Fleet-wide Grafana folder firings**: the `Fleet` folder (1 firing) and the `knowledge-graph` folder (5 firing / 1 pending) show activity in `grafana.json`, but `alerts.rules` is empty for this app and neither folder's rules are scoped to `perdido-peas-web-production`. The app-scoped result is 0 firing / 0 pending, which is the only figure that applies here. No firing absence rule exists for this app, so there is no Grafana-driven finding.

## Blind spots

What this audit could not see:
- **Grafana history starts mid-window** (the one `!` warning, verbatim): `Grafana history starts mid-window, so earlier is unknown, not clean: perdido-peas-web-production (2026-10-24T01:00:00Z)`. The window opens at 2026-10-22T04:09:02Z but the worker's first Loki/trace line is 2026-10-24T01:00:00Z, so roughly the first 44.8 hours are unknown at the Grafana layers (Loki G2 and traces G3), not confirmed clean. Cloudflare layer 1 (invocations) and layer 2 (logs) still cover the full window there and show 0 errors / 0 error groups.
- **Edge 5xx (layer 3) does not cover this app.** `perdido-peas` serves on `perdido-peas-web-production.<account>.workers.dev` with `workers_dev: true` and no `custom_domain` route (`web/wrangler.jsonc`), so it has no zone in the account-wide discovery (`~/Developer/Repos/docs/errors/reports/2026-10-29/zone.json`); a grep for `perdido` returns nothing there. That discovery's zone coverage ran whole-UTC-day from 2026-10-22T00:00:00Z to 2026-10-29T04:03:37Z (4.1 hours of overhang before the window, 0 after), but none of its zones are this app's. Edge-level 5xx for this app's `workers.dev` traffic is therefore unmeasured.
- **Workers with observability disabled**: none. `web/wrangler.jsonc` sets `observability.enabled: true`, `head_sampling_rate: 1`, logs persisted (7-day copy) and both traces and logs exported to Grafana Cloud.
- **Layer 2 warnings**: none (no `!!!`). `logs.json` returned `ok: true`, `exact: true`, `scoped: true`, 0 groups, empty `warnings`, so no manual Workers Logs query (`logs-manual.json`) was needed.
- **Layer 2 counts marked `~`**: none; the Loki figures are exact (`slices.querySampled: 0`, `storedSampled: 0`).
- **Layer 2 truncation**: the window equals the 7-day Workers Logs retention, so layer 2 effectively starts at 2026-10-22T04:08:59Z (6 seconds into the window) per the collector's `!` line. The 6-second shortfall is immaterial.
- **GA**: no gtag/analytics tag on this site, so client-side JS exceptions are not captured regardless.
- **Crashlytics / TestFlight**: not applicable; there is no iOS target.
- **Collector note**: `grafana-errors.mjs` was not executable and was run with `node` instead; the run completed normally (`ok: true` on every section), so this is an environment nit, not missing data.
- **Build and deploy failures**: not covered (the cloudflare-builds MCP needs OAuth). Deploy context: the live version `e95af531-423a-482a-beff-52ec1e7272f7` (14 of the 20 requests) is unchanged since the 2026-10-27 audit; the only commits since are `5b22fe1` (2026-10-27 error-audit docs, `[skip ci]`) and `4083c57` (deploy.sh fleet-template sync, a chore), neither of which touches the worker or book content. The other 3 versions in layer 1 carried 2 requests each with 0 errors. No version boundary correlates with any error because there were none.

## Outcome

Not applicable. Severity is noise and no fix is being shipped, so there is no before/after to verify.
