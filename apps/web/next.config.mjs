/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@vigil/types", "@vigil/constants", "@vigil/config"],
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
