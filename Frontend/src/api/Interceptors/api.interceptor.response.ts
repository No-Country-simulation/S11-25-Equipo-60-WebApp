import { logger } from "@/lib/logger";
import { api } from "../url/api.url";
import type { HttpMethod } from "@/shared/TYPES/httpMethod";

api.interceptors.response.use(
  (response) => {
      logger.api(
          (response.config.method?.toUpperCase() || "UNKNOWN") as HttpMethod,
          response.config.url || '',
          response.status
      );
      return response;
  },
  (error) => {
      if (error.response) {
        logger.error(
          `API Error: ${ error.response.status } - ${ error.config.method?.toUpperCase() } ${ error.config.url }`, error.response.data);
      }
      if ( error.request )
      {
        logger.error('Network Error: No response received', error.message);
      }
      logger.error( 'Request Error:', error.message);
      return Promise.reject(error);
  }
);