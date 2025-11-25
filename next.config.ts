import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL
let apiHost: string | undefined
let apiPort: string | undefined
let apiProtocol: "http" | "https" | undefined

try {
  if (apiUrl) {
    const parsed = new URL(apiUrl)
    apiHost = parsed.hostname
    apiPort = parsed.port || undefined
    apiProtocol = parsed.protocol === "https:" ? "https" : "http"
  }
} catch (err) {
  console.warn("Invalid NEXT_PUBLIC_API_URL, falling back to defaults", err)
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "i.namu.wiki",
      },
      {
        protocol: "https",
        hostname: "img.danawa.com",
      },
      {
        protocol: "https",
        hostname: "cdn.huffingtonpost.kr",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      ...(apiHost && apiProtocol
        ? [
            {
              protocol: apiProtocol,
              hostname: apiHost,
              ...(apiPort ? { port: apiPort } : {}),
            } as const,
          ]
        : []),
    ],
  },
};

export default nextConfig;
