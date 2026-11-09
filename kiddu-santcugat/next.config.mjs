/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    // Private pages (plans, class groups, invites, admin): never indexed or cached.
    return [{
      source: '/:lang(ca|es|en)/:section(p|plan|g|class|groups)/:path*',
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }, { key: 'Cache-Control', value: 'private, no-store' }],
    }];
  },
};
export default nextConfig;
