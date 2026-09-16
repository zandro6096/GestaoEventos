import { create as createAxios } from 'axios';

import { API_BASE_URL } from './api-config';

export const httpClient = createAxios({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let unauthorizedHandler: (() => void) | null = null;

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) unauthorizedHandler?.();
    if (status === 403) return Promise.reject(error);

    return Promise.reject(error);
  },
);

export function attachAuthToken(token: string | null) {
  if (token?.trim()) {
    httpClient.defaults.headers.common.Authorization = `Bearer ${token.trim()}`;
    return;
  }

  delete httpClient.defaults.headers.common.Authorization;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function apiRoute(path: `/api/${string}`) {
  return path;
}
