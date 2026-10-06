## Before you push

Run `pnpm check` before pushing. It assumes dependencies are already
installed (`pnpm install` at the repo root, then `pnpm install` in `web/`).

In order:
1. typecheck: `tsc --noEmit` in `web/`
2. build: `pnpm run build:cf` in `web/` (Next.js build via OpenNext)

Takes about 20-30 seconds. It never deploys and never touches Cloudflare.

If you change what `.github/workflows/deploy.yml` builds, update
`scripts/check.sh` to match.
