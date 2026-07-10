/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  images: { remotePatterns: [] },
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: "http://localhost:8000/api/v1/:path*" }];
  },
};
export default nextConfig;
