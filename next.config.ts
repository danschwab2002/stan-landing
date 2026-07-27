import type { NextConfig } from "next";

// Headers de seguridad base. NO incluye CSP a propósito: el sitio embebe terceros
// (widget de Calendly, videos) y Next inyecta scripts inline; una CSP a ciegas
// rompería producción. Queda pendiente una pasada dedicada de CSP con testing.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Solo actúa sobre https; en localhost los navegadores la ignoran.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Que Google no indexe el panel.
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
