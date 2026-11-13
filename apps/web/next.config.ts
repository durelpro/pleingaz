import type { NextConfig } from "next";
// @ts-ignore
import withPWA from 'next-pwa';
import { withSentryConfig } from '@sentry/nextjs/config';

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const hasSentry = !!process.env.SENTRY_AUTH_TOKEN;

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development' || !process.env.ENABLE_PWA_BUILD,
  register: true,
  skipWaiting: true,
})(nextConfig);

export default hasSentry
  ? withSentryConfig(pwaConfig, {
      org: "pleingaz",
      project: "pleingaz-web",
      silent: true,
      widenClientFileUpload: true,
      reactComponentAnnotation: { enabled: true },
      tunnelRoute: "/monitoring",
      sourcemaps: { disable: true },
    })
  : pwaConfig;
