import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'codezillatech.in',
    '*.codezillatech.in',
    'localhost:3000'
  ],
};

export default nextConfig;
