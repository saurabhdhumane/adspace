import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, AuthTokens } from '../types/index.js';

export interface TokenStorage {
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  setTokens: (tokens: AuthTokens) => Promise<void>;
  clearTokens: () => Promise<void>;
}

let tokenStorage: TokenStorage | null = null;

export const setApiTokenStorage = (storage: TokenStorage) => {
  tokenStorage = storage;
};

export const createApiClient = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to attach access token
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (tokenStorage) {
        const accessToken = await tokenStorage.getAccessToken();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for token refresh on 401
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else if (token) {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        tokenStorage &&
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/register') &&
        !originalRequest.url?.includes('/auth/refresh')
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return instance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await tokenStorage.getRefreshToken();
          if (!refreshToken) {
            await tokenStorage.clearTokens();
            processQueue(new Error('No refresh token available'), null);
            return Promise.reject(error);
          }

          const refreshResponse = await axios.post<ApiResponse<AuthTokens>>(
            `${baseURL}/auth/refresh`,
            { refreshToken }
          );

          if (refreshResponse.data?.success && refreshResponse.data.data) {
            const newTokens = refreshResponse.data.data;
            await tokenStorage.setTokens(newTokens);
            processQueue(null, newTokens.accessToken);
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return instance(originalRequest);
          } else {
            await tokenStorage.clearTokens();
            processQueue(new Error('Refresh failed'), null);
            return Promise.reject(error);
          }
        } catch (refreshErr) {
          await tokenStorage.clearTokens();
          processQueue(refreshErr, null);
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};
