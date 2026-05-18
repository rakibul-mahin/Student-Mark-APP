import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent this app being embedded in an iframe (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from MIME-sniffing the content type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send the origin (not the full URL) in Referer headers
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features this app doesn't use
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Force HTTPS for 1 year in production (browser will refuse plain HTTP)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Don't advertise that this is a Next.js app
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;