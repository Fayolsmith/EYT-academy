import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  typescript: {
    // Already checked during build
  },
};

export default nextConfig;
