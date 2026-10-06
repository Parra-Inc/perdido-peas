#!/usr/bin/env bash
#
# Pre-push verification. Mirrors the build step .github/workflows/deploy.yml
# runs before it deploys (that workflow currently only runs on
# workflow_dispatch, but this check keeps the web app buildable regardless).
# Assumes dependencies are already installed. Never deploys, never touches
# Cloudflare.

set -euo pipefail

echo "==> typecheck (web)"
(cd web && pnpm exec tsc --noEmit)

echo "==> build (web, build:cf)"
(cd web && pnpm run build:cf)

echo "==> check passed"
