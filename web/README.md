# Perdido Peas, web reader

A tiny Next.js app that hosts the book. Starts closed at the cover; tap to open it with a book animation, then flip pages by tapping, swiping, or using the arrow keys.

## Run it

```bash
npm install
npm run dev     # http://localhost:3400
```

## Pages

- `public/pages/` holds one square image per page (cover, dedication, pages 1 to 17, back cover).
- Current images are placeholders that simulate the real output format (square, 8.5x8.5). Regenerate them with `npm run placeholders`.
- When the real open-assets renders are ready, export them with the same filenames into `public/pages/` and nothing else changes. The manifest lives in `lib/pages.ts`.

## Controls

- Tap the cover to open the book
- Tap the right side / swipe left / right arrow key: next page
- Tap the left side / swipe right / left arrow key: previous page
- Left from the first page, "Back to cover", or Escape: closes the book

## Hosting

The site runs on Cloudflare Workers via OpenNext. `.github/workflows/deploy.yml`
builds `web/` and runs `wrangler deploy` on every push to `main`; config lives in
`wrangler.jsonc` (worker `perdido-peas-web-production`). There is no custom
domain, so the canonical URL is the workers.dev one:

https://perdido-peas-web-production.ian-b42.workers.dev

### Why vercel.json still exists

The book used to be hosted on Vercel at `perdido-peas.vercel.app`, and that URL
is in the wild (README banner, links shared with friends). The Vercel project is
kept alive purely as a redirect shim: `vercel.json` holds two permanent (308)
redirects that forward `/` and every sub-path to the Worker.

That file must stay committed. The Vercel project is still connected to this
repo's `main` branch, so any push rebuilds it from git. If `vercel.json` were
missing from the commit, the rebuild would drop the redirects and
`perdido-peas.vercel.app` would start serving a stale copy of the app again.
