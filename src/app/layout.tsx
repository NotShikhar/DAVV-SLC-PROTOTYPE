import type { Metadata } from "next";
import { Playfair_Display, Public_Sans, Merriweather, Sora } from "next/font/google";
import { AccentStyle } from "@/components/layout/AccentStyle";
import "./globals.css";

/*
 * "Heritage Regal" type system:
 *  - Playfair Display → display serif for h1–h3, stat numbers, card titles
 *  - Public Sans      → body, buttons, labels, tables
 *  - Merriweather     → italic serif accent (eyebrows, motto, date lines)
 *  - Sora             → enrollment numbers, course codes, avatar initials, numerals
 * Each exposes a CSS variable consumed by the @theme tokens in globals.css.
 */
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DAVV IET · Student Lifecycle Portal",
    template: "%s · DAVV IET SLC",
  },
  description:
    "Student Lifecycle portal for the Institute of Engineering & Technology, Devi Ahilya Vishwavidyalaya (DAVV), Indore.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${publicSans.variable} ${merriweather.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AccentStyle />
        {children}
      </body>
    </html>
  );
}
