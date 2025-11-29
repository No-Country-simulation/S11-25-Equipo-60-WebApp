// Configuración de variables de entorno
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://apptestimonial.vercel.app',
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

export default config;
