# Error audit history

One line per run, newest last.

| Date | Window | Verdict | Severity | Report |
| --- | --- | --- | --- | --- |
| 2026-10-27 | 2026-10-23T15:26Z to 2026-10-27T15:26Z (4d) | Clean: 0 errors / 14 requests across layer 1, layer 2, and Grafana; no custom-domain zone so no edge 5xx coverage; Grafana history starts ~9.5h into the window | noise | [2026-10-27](./2026-10-27-error-audit.md) |
| 2026-10-29 | 2026-10-22T04:09Z to 2026-10-29T04:09Z (7d) | Clean: 0 errors / 20 requests across 4 deployed versions, layer 2, and Grafana; no custom-domain zone so no edge 5xx coverage; Grafana history starts ~44.8h into the window | noise | [2026-10-29](./2026-10-29-error-audit.md) |
| 2026-11-12 | 2026-11-11T03:34Z to 2026-11-13T03:34Z (48h) | Clean: 0 errors / 4 requests on the single deployed version, layer 2, and Grafana; no custom-domain zone so no edge 5xx coverage; Grafana history covers the full window (starts ~1.6h before it) | noise | [2026-11-12](./2026-11-12-error-audit.md) |
| 2026-11-16 | 2026-11-13T17:57Z to 2026-11-16T17:57Z (3d) | Clean: 0 errors / 6 requests on the single deployed version (340ca2eb), layer 2, and Grafana; no custom-domain zone so no edge 5xx coverage; Grafana history starts ~8h into the window | noise | [2026-11-16](./2026-11-16-error-audit.md) |
