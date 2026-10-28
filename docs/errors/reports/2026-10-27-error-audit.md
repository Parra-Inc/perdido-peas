---
title: Perdido Peas error audit
date: 2026-10-27
window: 2026-10-23T15:26:18Z to 2026-10-27T15:26:18Z
workers: perdido-peas-web-production
layers: invocations, logs, grafana
layers_failed: none
layer2_warnings: none
logs_truncated: false
data: ./2026-10-27/
---

# Perdido Peas error audit

**Verdict in three sentences.** Production is clean: the one deployed version of `perdido-peas-web-production` served 14 requests over the 4-day window with 0 errors across every layer (Cloudflare invocations and logs, Grafana Loki and traces), and no app-scoped Grafana alert is firing. This is a static children's picture-book site on Next.js/Workers serving entirely on `*.workers.dev`, so it has no custom-domain zone and edge 5xx (layer 3) does not cover it. There is nothing to fix; the only caveat is that Grafana history for this worker starts about 1.5 hours into the window, so that opening slice is unknown rather than confirmed clean.

## Numbers

| | This run | Last run |
| --- | --- | --- |
| Worker errors (layer 1, deployed versions) | 0 | |
| Error rate (deployed versions) | 0.000% of 14 | |
| Versionless failures (local dev, excluded) | 0 | |
| Distinct error groups (layer 2) | 0 | |
| Log events (layer 2) | 14 (all `info`, exact, not truncated) | |
| Edge 5xx (layer 3, whole UTC days) | n/a: no custom-domain zone (serves on `*.workers.dev`) | |
| Grafana alerts firing / pending (G1) | 0 / 0 (scoped to this app) | |
| Grafana 5xx by path, top path (G2) | 0 | |
| Error spans (G3 spanmetrics; job-canceled apart) | 0 of 14 `GET` server calls | |
| GA `exception` events | n/a: no GA tag on this site | |
| Crashlytics fatals / ASC TF crashes | n/a: web-only app, no iOS target | |

First audit for this app, so "Last run" is blank by design rather than invented.

## Fix now

Nothing. No errors were observed on any layer, so there is no file-level finding to place. Per the audit rules, the list is not padded with findings that could not be placed against a repo path.

## Batch

Nothing. No real-but-cheap issues surfaced.

## Deliberately skipped

- **`clientDisconnected`**: 0 rows for this worker. It is a client hanging up, not a server error, and would go here if present. None observed.
- **Versionless layer 1 failures** (empty `scriptVersion`, local `wrangler dev` under the production Worker name): 0 rows. Nothing to exclude.
- **Fleet-wide Grafana folder firings**: the `Fleet` folder (1 firing, 1 pending) and `knowledge-graph` folder (2 firing, 2 pending) show activity, but neither rule is scoped to `perdido-peas-web-production`. The app-scoped alert result is 0 firing / 0 pending, which is the only figure that applies here. These folder totals belong to other services and are out of scope for this app's audit.

## Blind spots

What this audit could not see:
- **Grafana history starts mid-window** (the one `!` warning, verbatim): `Grafana history starts mid-window, so earlier is unknown, not clean: perdido-peas-web-production (2026-10-24T01:00:00Z)`. The window opens at 2026-10-23T15:26:18Z but the worker's first Loki/trace line is 2026-10-24T01:00:00Z, so roughly the first 9.5 hours are unknown at layers 2 and 3 (Grafana), not confirmed clean. Cloudflare layer 1 (invocations) still covers the full window and shows 0 errors there.
- **Edge 5xx (layer 3) does not cover this app.** `perdido-peas` serves on `perdido-peas-web-production.ian-b42.workers.dev` with `workers_dev: true` and no `custom_domain` route, so it has no zone in the account-wide discovery (`~/Developer/Repos/docs/errors/reports/2026-10-27/zone.json`, scope `all`). Zone discovery coverage ran whole-UTC-day from 2026-10-23T00:00:00Z to 2026-10-27T15:20:50Z (15.3 hours of overhang before the window, 0 after); none of its zones are this app's. Edge-level 5xx for workers.dev traffic is therefore unmeasured.
- **Workers with observability disabled**: none. `web/wrangler.jsonc` sets `observability.enabled: true`, `head_sampling_rate: 1`, logs persisted (7-day copy), traces exported to Grafana Cloud.
- **Layer 2 warnings**: none (`!!!`). Logs layer returned `ok: true`, `exact: true`, `scoped: true`, 0 groups, empty `warnings` array, so no manual Workers Logs query was needed.
- **Layer 2 counts marked `~`**: none; the 14 events are exact (`slices.querySampled: 0`, `storedSampled: 0`).
- **Layer 2 truncation**: none; window was 4 days, under the 7-day retention.
- **GA**: no gtag/analytics tag on this site, so JS exceptions are not captured client-side regardless.
- **Crashlytics / TestFlight**: not applicable; there is no iOS target.
- **Build and deploy failures**: not covered (the cloudflare-builds MCP needs OAuth). Deploy context: the deployed version `e95af531-423a-482a-beff-52ec1e7272f7` sits after the 2026-10-23 commits, which were observability export (#8) and canonical `deploy.sh` sync chores (#9, #10, #11), not book-content changes. No version boundary correlates with any error because there were none.

## Outcome

Not applicable. Severity is noise and no fix is being shipped, so there is no before/after to verify.
