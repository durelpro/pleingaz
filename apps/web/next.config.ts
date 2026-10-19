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

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})(nextConfig);

export default withSentryConfig(pwaConfig, {
  org: "pleingaz",
  project: "pleingaz-web",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: { enabled: true },
  tunnelRoute: "/monitoring",
  sourcemaps: { disable: true },
});
