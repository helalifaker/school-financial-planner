/** @type {import('next').NextConfig} */
const nextConfig = {
  // Additional build configuration if needed
  // This tells Next.js to not bundle Supabase dependencies
  serverExternalPackages: ['supabase'],
  // No static export needed - Vercel will handle as Next.js app
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Handle dynamic routes with fallback
  trailingSlash: true,
};

module.exports = nextConfig;

