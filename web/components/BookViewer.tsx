"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { pages } from "@/lib/pages";
import PageCounter from "@/components/PageCounter";

const LAST = pages.length - 1;

export default function BookViewer() {
  const [opened, setOpened] = useState(false);
  const [index, setIndex] = useState(0); // 0 = cover (closed book)
  const [prevIndex, setPrevIndex] = useState<number | null>(null); // page shown under the incoming one during a turn
  const [dir, setDir] = useState<"next" | "prev" | null>(null);
  const [dragDx, setDragDx] = useState(0);
  const drag = useRef<{ startX: number; pointerId: number } | null>(null);
  const suppressClick = useRef(false);

  const openBook = useCallback(() => {
    setOpened(true);
    setIndex(1);
    setPrevIndex(null);
    setDir(null);
  }, []);

  const closeBook = useCallback(() => {
    setOpened(false);
    setIndex(0);
    setPrevIndex(null);
    setDir(null);
  }, []);

  const next = useCallback(() => {
    if (!opened) return openBook();
    if (index >= LAST) return closeBook(); // the end: start over
    setDir("next");
    setPrevIndex(index);
    setIndex((i) => i + 1);
  }, [opened, index, openBook, closeBook]);

  const prev = useCallback(() => {
    if (!opened) return;
    if (index <= 1) return closeBook();
    setDir("prev");
    setPrevIndex(index);
    setIndex((i) => i - 1);
  }, [opened, index, closeBook]);

  // Arrow key navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape") {
        closeBook();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, closeBook]);

  // Swipe / drag navigation (touch and mouse, via pointer events)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { startX: e.clientX, pointerId: e.pointerId };
    suppressClick.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || e.pointerId !== drag.current.pointerId) return;
    const dx = e.clientX - drag.current.startX;
    setDragDx(dx);
    if (Math.abs(dx) > 8) suppressClick.current = true;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag.current || e.pointerId !== drag.current.pointerId) return;
    const dx = e.clientX - drag.current.startX;
    drag.current = null;
    setDragDx(0);
    if (Math.abs(dx) < 40) return;
    suppressClick.current = true;
    if (dx < 0) next();
    else prev();
  };
  const onPointerCancel = () => {
    drag.current = null;
    setDragDx(0);
  };
  // Skip the click that follows a swipe/drag so it doesn't also turn a page
  const guardClick = (fn: () => void) => () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    fn();
  };

  const page = pages[index];

  return (
    <main
      className="flex min-h-svh touch-pan-y select-none flex-col items-center justify-center gap-4 px-4 py-6"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {/* Floating music notes, a nod to the Bama band */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-8 flex justify-around text-3xl text-cap-navy/25">
        <span className="music-note">🎵</span>
        <span className="music-note [animation-delay:1.3s]">🎶</span>
        <span className="music-note [animation-delay:2.6s]">🎵</span>
      </div>

      {/* The book */}
      <div className="book-scene relative w-[min(92vw,68svh)]">
        {/* Open book: current page */}
        <div
          className={`relative aspect-square w-full overflow-hidden rounded-2xl border-4 border-white bg-sand shadow-[0_18px_40px_-12px_rgba(29,53,87,0.45)] ${
            opened ? "" : "invisible"
          }`}
        >
          {/* Outgoing page stays put underneath while the new one crossfades in over it */}
          {opened && prevIndex !== null && (
            <img
              src={pages[prevIndex].src}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {opened && (
            <img
              key={index}
              src={page.src}
              alt={page.alt}
              draggable={false}
              onAnimationEnd={() => setPrevIndex(null)}
              className={`relative h-full w-full object-cover ${dir === "next" ? "page-in-next" : dir === "prev" ? "page-in-prev" : ""}`}
              style={dragDx ? { transform: `translateX(${dragDx * 0.25}px)` } : undefined}
            />
          )}

          {/* Tap anywhere on the page to go forward (restarts at the end) */}
          {opened && (
            <button
              aria-label={index >= LAST ? "Start over" : "Next page"}
              onClick={guardClick(next)}
              className="absolute inset-0 cursor-pointer focus:outline-none"
            />
          )}
        </div>

        {/* Closed cover, hinged at the spine. Ignores taps once open so the page underneath gets them */}
        <div className={`absolute inset-0 ${opened ? "pointer-events-none" : "animate-bob"}`}>
          <button
            aria-label="Open the book"
            onClick={guardClick(openBook)}
            className={`book-cover-3d backface-hidden absolute inset-0 block w-full cursor-pointer rounded-2xl focus:outline-none ${
              opened ? "is-open" : ""
            }`}
          >
            {/* Page block edge peeking out behind the cover */}
            <span aria-hidden className="absolute -right-2 top-2 bottom-2 w-3 rounded-r-md bg-sand-deep shadow-inner" />
            <img
              src={pages[0].src}
              alt={pages[0].alt}
              draggable={false}
              className="relative h-full w-full rounded-2xl border-4 border-white object-cover shadow-[0_24px_50px_-12px_rgba(29,53,87,0.55)]"
            />
            {/* Spine highlight */}
            <span aria-hidden className="absolute inset-y-0 left-0 w-4 rounded-l-2xl bg-gradient-to-r from-black/25 to-transparent" />
          </button>
        </div>

        {/* Preload neighbors for snappy flips */}
        <div hidden>
          {index + 1 <= LAST && <img src={pages[index + 1].src} alt="" />}
          {index - 1 >= 0 && <img src={pages[index - 1].src} alt="" />}
        </div>
      </div>

      {/* Controls + counter */}
      {opened ? (
        <div className="flex items-center gap-3">
          <NavButton label="Previous page" onClick={prev}>
            ←
          </NavButton>
          <PageCounter label={page.counter} />
          <NavButton label={index >= LAST ? "Start over" : "Next page"} onClick={next}>
            {index >= LAST ? "↺" : "→"}
          </NavButton>
        </div>
      ) : (
        <p className="rounded-full bg-white/80 px-5 py-2 text-lg font-bold text-emerald-sea shadow-md">
          Tap the book to open it! 🦀
        </p>
      )}

      {opened && (
        <button
          onClick={closeBook}
          className="text-sm font-semibold text-cap-navy/60 underline-offset-4 hover:underline"
        >
          Back to cover
        </button>
      )}
    </main>
  );
}

function NavButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-coral text-2xl font-bold text-white shadow-[0_5px_0_rgba(29,53,87,0.35)] transition active:translate-y-0.5 active:shadow-[0_2px_0_rgba(29,53,87,0.35)] disabled:opacity-40 disabled:shadow-none"
    >
      {children}
    </button>
  );
}
