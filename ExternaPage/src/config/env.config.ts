// Configuración de variables de entorno

export const GET_ENVIRONMENT = process.env.NODE_ENV || 'development';

export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Configuración para testimonios públicos (landing page)

export const GET_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://apptestimonial.vercel.app";

export const GET_ORGANIZATION_ID = Number(process.env.NEXT_PUBLIC_ORGANIZATION_ID) || 6;

export const GET_API_KEY = process.env.NEXT_PUBLIC_BACKEND_API_KEY || 'demo-api-key';

export const GET_DEFAULT_CATEGORY_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_CATEGORY_ID) || 1;
