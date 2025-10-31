import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Additional build configuration if needed
  // This tells Next.js to not bundle Supabase dependencies
  serverExternalPackages: ['supabase'],
};

export default nextConfig;
