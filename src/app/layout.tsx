import type { Metadata } from "next";
import { Poppins, Open_Sans, Merriweather } from "next/font/google";
import { AccentStyle } from "@/components/layout/AccentStyle";
import "./globals.css";

/*
 * Institutional type system:
 *  - Poppins      → headings & UI labels
 *  - Open Sans    → body copy (16px / 1.6)
 *  - Merriweather → serif accent for the Sanskrit motto & formal documents
 * Each exposes a CSS variable consumed by the @theme tokens in globals.css.
 */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700"],
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
      className={`${poppins.variable} ${openSans.variable} ${merriweather.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AccentStyle />
        {children}
      </body>
    </html>
  );
}
