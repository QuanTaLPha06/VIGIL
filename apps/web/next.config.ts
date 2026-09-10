import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@vigil/types", "@vigil/constants", "@vigil/config"],
  experimental: {
    // Enables server actions
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
