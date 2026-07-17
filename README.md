# Perdido Peas

A children's book by Ian MacCallum and Katie Rivas. Page text and illustration briefs live in [book.md](book.md).

## Rendering pipeline: open-assets

We render pages with [open-assets](/Users/ianmaccallum/Developer/Repos/open-assets) (npm `@open-assets/open-assets`), a Puppeteer-based HTML/CSS/SVG to PNG renderer ("Storybook for marketing assets"). It is **not** an image generator: it loads each HTML template in headless Chromium and screenshots it. Closest existing analog in our repos: `the-playbook/card-game` (many same-styled templates, shared stylesheet, reusable SVG components).

### Project layout

```
florabama/
  assets.json             # manifest (required, at root)
  assets.lock             # auto-generated incremental cache (commit it)
  package.json            # scripts + devDeps
  src/styles.css          # Tailwind input (@import "tailwindcss")
  dist/styles.css         # compiled Tailwind output (gitignored)
  public/                 # shared assets: illustrations, textures, fonts
  assets/pages/           # one HTML template per book page
    01-cover.html
    02-dedication.html
    ...
  exports/                # rendered PNGs (commit them)
```

### Setup

```bash
npm i -D @open-assets/open-assets @tailwindcss/cli tailwindcss concurrently
```

`package.json` scripts (pattern copied from the-playbook card-game):

```json
"scripts": {
  "dev": "concurrently \"npx @tailwindcss/cli -i src/styles.css -o dist/styles.css --watch\" \"npx open-assets dev\"",
  "build:css": "npx @tailwindcss/cli -i src/styles.css -o dist/styles.css",
  "render": "npm run build:css && npx open-assets render --force"
}
```

### assets.json starting point

```json
{
  "version": 1,
  "name": "Florabama",
  "publicDir": "public",
  "command": "npx open-assets render --force",
  "collections": [
    {
      "id": "pages",
      "label": "Book Pages",
      "sourceSize": { "width": 2550, "height": 2550 },
      "borderRadius": 0,
      "templates": [
        { "src": "assets/pages/01-cover.html", "name": "01-cover", "label": "Cover" }
      ],
      "export": [
        { "name": "print", "label": "8.5in @300dpi", "size": { "width": 2550, "height": 2550 }, "outFile": "exports/pages/print/{template}.png" },
        { "name": "preview", "label": "Screen 1024", "size": { "width": 1024, "height": 1024 }, "outFile": "exports/pages/preview/{template}.png" }
      ],
      "customExport": { "defaultWidth": 2550, "defaultHeight": 2550 }
    }
  ]
}
```

### Commands

- `npx open-assets dev`: live-preview UI at http://localhost:3200 (live reload, zoom/pan, export buttons)
- `npx open-assets render`: headless render, incremental via `assets.lock`
  - `--force` rebuild all, `--collection <id>`, `--template <name>`, `--size <name>`, `-o <dir>` (default `./exports`)
  - ad-hoc dimensions: `--width 2550 --height 2550`
- Output: PNG per template per export size, path `exports/{collection}/{size}/{template}.png` (or `outFile` override)

### Template rules

- `body` width/height must match the collection's `sourceSize`; `overflow: hidden`
- Link compiled CSS: `<link rel="stylesheet" href="../dist/styles.css">` (paths relative to project root)
- Reference shared images from `public/`, e.g. `../../public/illustrations/page-03.png`
- Background is transparent by default (`omitBackground`): paint an opaque background in every book page

### Book format decisions

- Trim: 8.5" x 8.5" square, 2550 x 2550 px = 300 DPI
- `sourceSize` = export size (2550), so CSS `zoom` = 1 and any embedded raster illustrations render 1:1 and stay crisp (vector/text scale safely at any zoom; raster does not)

### Gotchas

- **`assets.lock` only checksums HTML/SVG source, not images in `public/`.** After swapping illustration PNGs, render with `--force` or pages get skipped as "unchanged".
- **Print caveats:** output is RGB PNG with no DPI metadata, no CMYK, no bleed/crop marks. 2550px = 300 DPI by convention only; a print step must tag DPI / convert color. If the printer wants bleed, bake it into `sourceSize`/`export` (2625 x 2625 for 0.125" bleed).
- `deviceScaleFactor: 1`; scaling is CSS `zoom = max(exportW/sourceW, exportH/sourceH)`.

### Reusable character components

Every character/prop lives as a standalone SVG in `public/characters/` (e.g. `eric.svg`, `crab.svg`) with the palette colors baked in. Page templates reuse them via `<img src="../../public/characters/eric.svg">`, same art on every page by construction. The `characters` collection in `assets.json` renders each one alone on a **transparent** 1200x1200 canvas (open-assets' default background) so the PNGs can be composited anywhere.

### Illustration strategy (two routes)

1. **Hand-built vector art (recommended):** each character is a reusable inline SVG component (one Eric, one Katie, ...) dropped into every page template; all colors from one shared stylesheet. Consistency is guaranteed by construction. This is how the card-game and app-icon flows work.
2. **AI-generated raster art:** generate each page's art with an image model at >= 2550px, save to `public/illustrations/`, reference via `<img>` in templates. open-assets handles framing, text overlay, and batch export; style consistency across pages is the image model's job (fixed seed, style reference, character refs, identical style suffix per prompt).
