import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { logger } from "@/lib";
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
        logger.error(
          `API Error: ${ error.response.status } - ${ error.config.method?.toUpperCase() } ${ error.config.url }`, error.response.data);
      }
      if ( error.request )
      {
        logger.error('Network Error: No response received', error.message);
      }
      logger.error( 'Request Error:', error.message);
      return Promise.reject(error instanceof Error ? error : new Error((error as any)?.message || 'Unknown error'));
  }
);