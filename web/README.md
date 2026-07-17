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
