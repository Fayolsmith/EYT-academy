import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcxhxxihtjshyjaoxoqh.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjeGh4eGlodGpzaHlqYW94b3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MjA3ODEsImV4cCI6MjEwNDE5Njc4MX0.wAbrPNvT-DzMDOB3JSB5hHt_LnPIiilRVqadff4Zor4',
  },
  outputFileTracingRoot: path.join(__dirname),
  typescript: {
    // Already checked during build
  },
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Accept' },
        ],
      },
    ];
  },
};

export default nextConfig;
