import type { NextConfig } from "next";

/**
 * This is a fully static, front-end-only prototype (no backend).
 * `next build` emits a self-contained static site to `out/` that can be hosted
 * anywhere (GitHub Pages, Netlify, S3, ...). Keep the app static-export-safe:
 * no server actions / route handlers, and provide `generateStaticParams` for
 * any dynamic route segment.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
