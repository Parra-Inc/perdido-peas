import type { Metadata, Viewport } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";

import { SITE_URL } from "./site";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  weight: ["400", "600", "700", "800"],
});

// Absolute base for og:image and friends. On Vercel, Next inferred this from
// VERCEL_URL; Workers sets no such variable, so without it every social preview
// resolves against http://localhost:3000 and the image 404s for everyone.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Perdido Peas",
  description: "A children's book by Ian MacCallum and Katie Rivas. Tap the cover to read!",
  openGraph: {
    title: "Perdido Peas",
    description: "A children's book by Ian MacCallum and Katie Rivas. Tap the cover to read!",
    type: "website",
    siteName: "Perdido Peas",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2ec4b6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={baloo.variable}>
      <body>{children}</body>
    </html>
  );
}
