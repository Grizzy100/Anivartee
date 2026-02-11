import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const httpClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-service-token': env.INTERNAL_SERVICE_TOKEN
  }
});

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    logger.debug(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    logger.error('HTTP Request Error:', error);
    return Promise.reject(error);
  }
);

httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.debug(`HTTP Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    logger.error('HTTP Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default httpClient;
