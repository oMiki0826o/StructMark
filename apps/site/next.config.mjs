/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/StructMark",
  assetPrefix: "/StructMark/",
  trailingSlash: true,
  images: { unoptimized: true },
  webpack: (config) => {
    config.resolve.extensionAlias = { ".js": [".ts", ".tsx", ".js"] };
    return config;
  },
};
export default nextConfig;
