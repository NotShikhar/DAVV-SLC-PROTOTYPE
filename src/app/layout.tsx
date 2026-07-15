import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans, Sora } from "next/font/google";
import { AccentStyle } from "@/components/layout/AccentStyle";
import "./globals.css";

/*
 * "Heritage Modern" type system:
 *  - Fraunces          → soft display serif for h1–h3, stat numbers, card
 *                        titles; its italic also serves the serif accents
 *                        (eyebrows, motto, date lines)
 *  - Plus Jakarta Sans → body, buttons, labels, tables
 *  - Sora              → enrollment numbers, course codes, avatar initials
 * Each exposes a CSS variable consumed by the @theme tokens in globals.css.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jakarta.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AccentStyle />
        {children}
      </body>
    </html>
  );
}
