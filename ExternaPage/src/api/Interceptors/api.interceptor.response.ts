import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { logger } from "@/core";
import { api } from "@/api";
import type { HttpMethod } from "@/types";

interface ApiResponse<T = any> extends AxiosResponse<T> {}
interface ApiError extends AxiosError {
  config: InternalAxiosRequestConfig;
  response?: AxiosResponse;
  request?: any;
}

api.interceptors.response.use(
  (response: ApiResponse) => {
    logger.api(
      (response.config.method?.toUpperCase() || "UNKNOWN") as HttpMethod,
      response.config.url || '',
      response.status
    );
    return response;
  },
  (error: ApiError) => {
    if (error.response) {
      const status = error.response.status;
      const message = `API Error: ${status} - ${error.config.method?.toUpperCase()} ${error.config.url}`;

      if (status >= 500) {
        logger.error(`❌ ${message}`, error.response.data);
      } else if (status >= 400) {
        logger.warn(`⚠️ ${message}`, error.response.data);
      } else {
        logger.info(`ℹ️ ${message}`, error.response.data);
      }
    } else if (error.request) {
      logger.error('🌐 Network Error: No response received', error.message);
    } else {
      logger.debug('🔍 Request Error:', error.message);
    }
    return Promise.reject(error instanceof Error ? error : new Error((error as any)?.message || 'Unknown error'));
  }
);
