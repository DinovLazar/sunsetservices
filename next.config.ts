import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Strict mode is on by default in Next 16.
  // Phase M.01c: allow next/image to serve real project photography from
  // the Sanity asset CDN (urlFor() builds cdn.sanity.io URLs).
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: 'cdn.sanity.io'},
    ],
  },
};

export default withNextIntl(nextConfig);
