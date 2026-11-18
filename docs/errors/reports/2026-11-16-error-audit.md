---
title: Perdido Peas error audit
date: 2026-11-16
window: 2026-11-13T17:57:52Z to 2026-11-16T17:57:52Z
workers: perdido-peas-web-production
layers: invocations, logs, zone, grafana
layers_failed: none (grafana-errors.mjs lacked the exec bit and was run via `node` on the same path; output unchanged)
layer2_warnings: none (the collector emitted one `!` Grafana coverage-gap line, not a `!!!` layer-2 warning)
logs_truncated: false (3-day window, well inside the 7-day Workers Logs retention)
data: ./2026-11-16/
---

# Perdido Peas error audit

**Verdict in three sentences.** Production is clean: `perdido-peas-web-production` served 6 requests over the 3-day window with 0 errors on every layer that covers it (Cloudflare invocations on the single deployed version `340ca2eb`, Cloudflare Workers Logs, Grafana Loki, and Grafana traces), and no app-scoped Grafana alert is firing or pending. This is a single-page static children's picture-book site on Next.js/OpenNext Workers that serves entirely on `*.workers.dev`, so it has no custom-domain zone and edge 5xx (layer 3) does not cover it. There is nothing to fix; the one caveat is that the Grafana export history begins about 8 hours into the window (first Loki/trace line 2026-11-14T02:00Z), so the Grafana view of those first ~8 hours is unknown, though Cloudflare layers 1 and 2 cover the whole window and are clean.

## Numbers

| | This run | Last run (2026-11-12, 48h) |
| --- | --- | --- |
| Worker errors (layer 1, deployed versions) | 0 | 0 |
| Error rate (deployed versions) | 0.000% of 6 | 0.000% of 4 |
| Versionless failures (local dev, excluded) | 0 | 0 |
| Distinct error groups (layer 2) | 0 | 0 |
| Log events (layer 2) | 0 error-level (Grafana Loki: 6 lines, all `info`, 0 error/warn; Cloudflare Workers Logs: 0 groups, exact, not truncated) | 0 error-level (4 lines `info`) |
| Edge 5xx (layer 3, whole UTC days) | n/a: no custom-domain zone (serves on `*.workers.dev`) | n/a: no custom-domain zone |
| Grafana alerts firing / pending (G1) | 0 / 0 (app-scoped; 1 healthy rule in the "Perdido Peas" folder) | 0 / 0 |
| Grafana 5xx by path, top path (G2) | 0 (6 `GET` requests, 0 fivexx) | 0 |
| Error spans (G3 spanmetrics; job-canceled apart) | 0 of 6 `GET` server calls | 0 of 4 |
| GA `exception` events | n/a: no GA tag on this site | n/a |
| Crashlytics fatals / ASC TF crashes | n/a: web-only app, no iOS target | n/a |

"Last run" is filled from `2026-11-12-error-audit.md`. Both runs land on severity noise; the request count rose only because this window is 3 days versus 48 hours.

## Fix now

Nothing. No errors were observed on any layer, so there is no file-level finding to place. Per the audit rules, the list is not padded with findings that could not be mapped to a repo path.

## Batch

Nothing. No real-but-cheap issues surfaced.

## Deliberately skipped

- **`clientDisconnected`**: 0 rows for this worker (`invocations.json` -> `workers[].statuses` is `{success: 6}`, `failingStatuses` empty). It is a client hanging up, not a server error, and would go here if present. None observed.
- **Versionless layer 1 failures** (empty `scriptVersion`, local `wrangler dev` under the production Worker name): `workers[].versionless` is `{requests: 0, errors: 0, onlyTraffic: false}` in `invocations.json`. Nothing to exclude; all 6 requests are on the single deployed version `340ca2eb-5d2a-41b5-8b4c-5170a1a5af7b`.
- **Fleet-wide Grafana folder state**: `grafana.json` shows the account-wide `Fleet` folder with 0 firing / 1 pending, but `alerts.rules` is empty for this app and that pending rule is not scoped to `perdido-peas-web-production`. The app-scoped result is 0 firing / 0 pending, which is the only figure that applies here. The app's own folder ("Perdido Peas") holds 1 rule, healthy and not firing. No firing absence rule exists for this app, so there is no Grafana-driven finding.

## Blind spots

What this audit could not see:
- **Grafana history starts ~8 hours into the window.** The collector emitted a single `!` line: `Grafana history starts mid-window, so earlier is unknown, not clean: perdido-peas-web-production (2026-11-14T02:00:00Z)`. The window opened 2026-11-13T17:57:59Z and the worker's first Loki/trace line is 2026-11-14T02:00:00Z, so the Grafana layers (G2 logs, G3 traces) do not cover roughly the first 8 hours of the window. This is a Grafana-export gap only: Cloudflare invocations (layer 1) and Cloudflare Workers Logs (layer 2) cover the full window from 2026-11-13T17:57:52Z and are clean, so the app is not unmonitored for that span, only unseen by Grafana.
- **Edge 5xx (layer 3) does not cover this app.** `perdido-peas` serves on `perdido-peas-web-production.<account>.workers.dev` with `workers_dev: true` and the `custom_domain` route left commented out (`web/wrangler.jsonc`), so it has no zone in the account-wide discovery (`~/Developer/Repos/docs/errors/reports/2026-11-16/zone.json`); a scan of that file's 20 zones returns no `perdido` domain. That discovery ran whole-UTC-day from 2026-11-13T00:00:00Z to 2026-11-16T17:51:25Z (17.8 hours of overhang before the window, 0 after), but none of its zones are this app's. Edge-level 5xx for this app's `workers.dev` traffic is therefore unmeasured, as on every prior run.
- **Workers with observability disabled**: none. `web/wrangler.jsonc` sets `observability.enabled: true`, `head_sampling_rate: 1`, logs persisted (the 7-day Workers Logs copy), and both traces and logs exported to Grafana Cloud (`destinations: ["grafana-traces"]`).
- **Layer 2 warnings**: none (no `!!!`). `logs.json` returned `ok: true`, `exact: true`, `scoped: true`, 0 groups, empty `warnings`, so Cloudflare Workers Logs is clean (not unknown) and no manual Workers Logs query (`logs-manual.json`) was needed.
- **Layer 2 counts marked `~`**: none; the Loki and logs figures are exact (`slices.querySampled: 0`, `storedSampled: 0`, `exact: true`).
- **Layer 2 truncation**: none. The 3-day window is well inside the 7-day Workers Logs retention (`truncated: false`, `effectiveFrom` equals the window start).
- **GA**: no gtag/analytics tag on this site (grep for `gtag`/`googletagmanager`/`GoogleAnalytics` across `web` returns nothing), so client-side JS exceptions are not captured regardless.
- **Crashlytics / TestFlight**: not applicable; there is no iOS target.
- **Collector note**: `grafana-errors.mjs` was not executable and was run with `node` on the same path; the run completed normally (`ok: true` on every section), so this is an environment nit, not missing data.
- **Build and deploy failures**: not covered (the cloudflare-builds MCP needs OAuth). Deploy context: the live version is now `340ca2eb-5d2a-41b5-8b4c-5170a1a5af7b`, changed from `e23be9d7-...` recorded at the 2026-11-12 audit. All 6 requests ran on this single version with 0 errors, so no version boundary correlates with any failure (there were none). The only commit since the last audit is `8c4d560` (open-assets 0.6.3 / lockfile v2, #15, 2026-11-08), a tooling chore; the last worker-affecting change remains `646f690` (Grafana export, #8, 2026-10-23).

## Outcome

Not applicable. Severity is noise and no fix is being shipped, so there is no before/after to verify.
