//server\post-service\src\utils\http.ts

// src/utils/http.ts
import axios, { AxiosRequestConfig } from 'axios';
import { env } from '../config/env.js';
import { logger } from './logger.js';

const httpClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-service-token': env.INTERNAL_SERVICE_TOKEN
  }
});

// Request interceptor for logging
httpClient.interceptors.request.use(
  (config) => {
    logger.debug(`HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('HTTP Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
httpClient.interceptors.response.use(
  (response) => {
    logger.debug(`HTTP Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    logger.error('HTTP Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default httpClient;