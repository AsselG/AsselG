/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingIncludes: { '/**': ['./config/**', './data/**'] },
};
export default nextConfig;
