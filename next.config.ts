import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.GITHUB_PAGES === "true" ? { output: "export", basePath: "/devpost-hackathon", assetPrefix: "/devpost-hackathon/" } : {}),
};

export default nextConfig;
