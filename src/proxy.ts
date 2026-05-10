import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Exclude `/og/*` (server-rendered Open Graph image route handlers,
  // Phase 1.18) so they bypass the locale-prefix rewrite.
  matcher: '/((?!api|og|_next|_vercel|.*\\..*).*)'
};
