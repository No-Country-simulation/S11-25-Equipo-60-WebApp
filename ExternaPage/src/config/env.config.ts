// Configuración de variables de entorno
export const CONFIG = {
  API_URL: process.env.NEXT_BACKEND_API_URL || 'https://apptestimonial.vercel.app',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  
  // Configuración para testimonios públicos (landing page)
  TESTIMONIAL_API_KEY: process.env.NEXT_PUBLIC_TESTIMONIAL_API_KEY || 'demo-api-key',
  TESTIMONIAL_ORGANIZATION_ID: Number(process.env.NEXT_PUBLIC_ORGANIZATION_ID) || 1,
  TESTIMONIAL_DEFAULT_CATEGORY_ID: Number(process.env.NEXT_PUBLIC_DEFAULT_CATEGORY_ID) || 1,
} as const;
