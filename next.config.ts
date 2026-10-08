import type { NextConfig } from "next";

const basePath = process.env.EXPERIENCE_BASE_PATH || "/x/my-experience";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath,
};

export default nextConfig;
