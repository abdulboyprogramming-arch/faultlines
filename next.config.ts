import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Security headers.
 *
 * In development the policy has to be looser: Turbopack's dev runtime uses
 * `eval`, and the platform preview embeds the app in an iframe. Shipping the
 * production policy in dev is what makes local previews render as a blank
 * white rectangle.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'" + (isDev ? " ws: wss:" : ""),
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  isDev ? "frame-ancestors *" : "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  ...(process.env.GITHUB_PAGES === "true"
    ? { output: "export", basePath: "/faultlines", assetPrefix: "/faultlines/" }
    : {}),
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          ...(isDev ? [] : [{ key: "X-Frame-Options", value: "DENY" }]),
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]),
          ...(isDev ? [] : [{ key: "Cross-Origin-Opener-Policy", value: "same-origin" }]),
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
