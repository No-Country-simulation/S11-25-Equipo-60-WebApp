// Configuración de variables de entorno
export const CONFIG = {
  API_URL: process.env.NEXT_BACKEND_API_URL || 'https://apptestimonial.vercel.app',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;
