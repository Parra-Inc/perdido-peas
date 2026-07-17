#!/usr/bin/env node
// Generates fake square page images that simulate the real book output format
// (8.5x8.5in, rendered square). Real art drops in later at the same filenames.
// Usage: node scripts/generate-placeholders.mjs   (requires rsvg-convert)

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "pages");
mkdirSync(outDir, { recursive: true });

const SIZE = 1275; // half of print res (2550), plenty for web placeholders

// Per-page mood palettes from the book's art style guide
const moods = {
  school: { bg: "#8fa3b8", bg2: "#7a8fa6", accent: "#dfe7ee", text: "#243b53" },
  beach: { bg: "#2ec4b6", bg2: "#20a4a0", accent: "#fdf6e3", text: "#0b4f4a" },
  lonely: { bg: "#5aa9c9", bg2: "#4a93b5", accent: "#eaf4f9", text: "#123f54" },
  golden: { bg: "#f4a259", bg2: "#ef8354", accent: "#fff3d6", text: "#6b3410" },
  sunset: { bg: "#ef6f6c", bg2: "#d94f67", accent: "#ffe8d1", text: "#5c1a2e" },
  cover: { bg: "#ffb703", bg2: "#f4a259", accent: "#fdf6e3", text: "#5c3a00" },
  sand: { bg: "#fdf6e3", bg2: "#f5e9c9", accent: "#2ec4b6", text: "#5c4a1e" },
};

const pages = [
  { file: "00-cover", label: "COVER", title: "Perdido Peas", sub: "by Ian MacCallum and Katie Rivas", mood: "cover" },
  { file: "01-dedication", label: "DEDICATION", title: "For the Perdido Peas.", sub: "seven peas in a pod", mood: "sand" },
  { file: "02-page-01", label: "PAGE 1", title: "Rainy classroom", sub: "the clock ticked so slow", mood: "school" },
  { file: "03-page-02", label: "PAGE 2", title: "The dream bubble", sub: "water's so clear", mood: "school" },
  { file: "04-page-03", label: "PAGE 3", title: "RIIIING!", sub: "the beach trip was here", mood: "beach" },
  { file: "05-page-04", label: "PAGE 4", title: "Empty beach", sub: "where IS everybody?", mood: "beach" },
  { file: "06-page-05", label: "PAGE 5", title: "Bocce, abandoned", sub: "not a one", mood: "beach" },
  { file: "07-page-06", label: "PAGE 6", title: "Empty water", sub: "waves swish and sway", mood: "beach" },
  { file: "08-page-07", label: "PAGE 7", title: "Still pool", sub: "still as a bathtub", mood: "lonely" },
  { file: "09-page-08", label: "PAGE 8", title: "The lonely mile", sub: "no Peas in view", mood: "lonely" },
  { file: "10-page-09", label: "PAGE 9", title: "A guitar! A song!", sub: "Eric started to SMILE", mood: "golden" },
  { file: "11-page-10", label: "PAGE 10", title: "THE FLORA-BAMA!", sub: "the best place on the sand", mood: "golden" },
  { file: "12-page-11", label: "PAGE 11", title: "He spotted the Peas!", sub: "all cheering", mood: "golden" },
  { file: "13-page-12", label: "PAGE 12", title: "A seat saved for him", sub: "frosty and sweet", mood: "golden" },
  { file: "14-page-13", label: "PAGE 13", title: "Coladas + bushwhackers", sub: "the best ever seen", mood: "golden" },
  { file: "15-page-14", label: "PAGE 14", title: "Friends in low places", sub: "smiles on their faces", mood: "sunset" },
  { file: "16-page-15", label: "PAGE 15", title: "Waves, bocce, dancing", sub: "the Flora-Bama band", mood: "sunset" },
  { file: "17-page-16", label: "PAGE 16", title: "Gold on the sea", sub: "right where they should be", mood: "sunset" },
  { file: "18-page-17", label: "PAGE 17", title: "Back at the window", sub: "he knows where he'll go", mood: "school" },
  { file: "19-back-cover", label: "BACK COVER", title: "See you at the Bama!", sub: "", mood: "sunset" },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function svgFor(p, index) {
  const m = moods[p.mood];
  // Hidden orange crab easter egg on every placeholder, like the real book
  const crabX = 140 + ((index * 397) % (SIZE - 280));
  const crab = `
    <g transform="translate(${crabX}, ${SIZE - 120}) scale(0.9)">
      <ellipse cx="0" cy="0" rx="34" ry="24" fill="#f4772e"/>
      <circle cx="-12" cy="-10" r="7" fill="#fff"/><circle cx="12" cy="-10" r="7" fill="#fff"/>
      <circle cx="-12" cy="-10" r="3" fill="#3a2410"/><circle cx="12" cy="-10" r="3" fill="#3a2410"/>
      <path d="M -30 -14 q -18 -14 -10 -26" stroke="#f4772e" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 30 -14 q 18 -14 10 -26" stroke="#f4772e" stroke-width="8" fill="none" stroke-linecap="round"/>
    </g>`;

  // Simple scalloped wave band for texture
  let waves = "";
  for (let x = -60; x < SIZE + 60; x += 120) {
    waves += `<circle cx="${x}" cy="${SIZE - 40}" r="80" fill="${m.bg2}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="${m.bg}"/>
  <circle cx="${SIZE - 180}" cy="180" r="110" fill="${m.accent}" opacity="0.9"/>
  ${waves}
  <rect x="80" y="${SIZE / 2 - 260}" width="${SIZE - 160}" height="440" rx="48" fill="${m.accent}" opacity="0.95"/>
  <text x="50%" y="${SIZE / 2 - 150}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="52" font-weight="bold" letter-spacing="14" fill="${m.text}" opacity="0.7">${esc(p.label)}</text>
  <text x="50%" y="${SIZE / 2 - 20}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="88" font-weight="bold" fill="${m.text}">${esc(p.title)}</text>
  <text x="50%" y="${SIZE / 2 + 90}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="54" font-style="italic" fill="${m.text}" opacity="0.8">${esc(p.sub)}</text>
  ${crab}
</svg>`;
}

for (const [i, p] of pages.entries()) {
  const svgPath = join(outDir, `${p.file}.svg`);
  const pngPath = join(outDir, `${p.file}.png`);
  writeFileSync(svgPath, svgFor(p, i));
  execFileSync("rsvg-convert", ["-w", String(SIZE), "-h", String(SIZE), "-o", pngPath, svgPath]);
  rmSync(svgPath);
  console.log(`✓ ${p.file}.png`);
}
console.log(`\nDone: ${pages.length} placeholder pages in public/pages/`);
