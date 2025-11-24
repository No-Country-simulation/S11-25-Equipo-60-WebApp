import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'apitestimonial.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary según el README del backend
      },
    ],
  },
  // Desactivar strict mode en desarrollo para evitar doble renderizado
  reactStrictMode: true,
  // Optimizar para producción
  poweredByHeader: false,
};

export default nextConfig;
