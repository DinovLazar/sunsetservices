import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Strict mode is on by default in Next 16; nothing else to set yet.
};

export default withNextIntl(nextConfig);
