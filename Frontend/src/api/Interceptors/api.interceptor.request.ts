import { logger } from "@/lib/logger";
import { api } from "../url/api.url";

api.interceptors.request.use((config) => {
  // Siempre intentar agregar token desde localStorage en el navegador
  if (globalThis.window !== undefined) {
      const storage = localStorage.getItem('auth-storage');
      if (storage) {
          try {
              const { state } = JSON.parse(storage);
              if (state?.token && state.token !== 'undefined') {
                config.headers['Authorization'] = `JWT ${state.token}`;
                logger.auth( '✅ Token agregado on prefijo JWT:', state.token.substring( 0, 5 ) + '...' );
                logger.debug('🔍 Header configurado:', config.headers['Authorization'].substring(0, 5) + '...');
              } else {
                  logger.warn('⚠️ Token inválido en store');
              }
          } catch (error) {
              logger.error('❌ Error parseando auth-storage:', error);
          }
      } else {
          logger.warn('⚠️ No hay auth-storage en localStorage');
      }
  }

  // Verificar si el header se agregó correctamente
  logger.debug( `📤 Request ${ config.method?.toUpperCase() } ${ config.url }` );

  return config;
});