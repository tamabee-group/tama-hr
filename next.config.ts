import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8081",
        pathname: "/uploads/**",
      },
    ],
    // Tắt image optimization cho development (bypass private IP check)
    unoptimized: process.env.NODE_ENV === "development",
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
