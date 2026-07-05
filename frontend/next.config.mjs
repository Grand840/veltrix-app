/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  images: { remotePatterns: [] },
};
export default nextConfig;
