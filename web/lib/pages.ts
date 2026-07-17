// Page manifest for Perdido Peas.
// Swap placeholder art for real renders by dropping same-named files into public/pages/.

export type BookPage = {
  src: string;
  alt: string;
  /** Label shown in the page counter. Story pages get "n of 17". */
  counter: string;
};

const STORY_PAGE_COUNT = 17;

export const pages: BookPage[] = [
  { src: "/pages/00-cover.png", alt: "Cover: Perdido Peas by Ian MacCallum and Katie Rivas", counter: "Cover" },
  { src: "/pages/01-dedication.png", alt: "Dedication: For the Perdido Peas", counter: "Dedication" },
  ...Array.from({ length: STORY_PAGE_COUNT }, (_, i) => {
    const n = i + 1;
    return {
      src: `/pages/${String(n + 1).padStart(2, "0")}-page-${String(n).padStart(2, "0")}.png`,
      alt: `Page ${n}`,
      counter: `${n} of ${STORY_PAGE_COUNT}`,
    };
  }),
  { src: "/pages/19-back-cover.png", alt: "Back cover: See you at the Bama!", counter: "The End" },
];
