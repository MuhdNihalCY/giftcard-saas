import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { auth } from './auth';
import logger from './logger';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies (for CSRF token and session)
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Helper function to get CSRF token from cookie
const getCSRFToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Helper to fetch CSRF token by making a GET request
const fetchCSRFToken = async (): Promise<string | null> => {
  try {
    // If user is authenticated, use an authenticated endpoint to ensure same session
    // Otherwise, use health endpoint
    const token = auth.getAccessToken();
    let response;
    
    if (token) {
      // Use authenticated endpoint to get CSRF token with the same session
      response = await axios.get(`${API_URL}/gift-cards`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        params: { limit: 1 }, // Minimal request
      });
    } else {
      // Use health endpoint for unauthenticated requests
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
      response = await axios.get(`${backendUrl}/health`, {
        withCredentials: true,
      });
    }
    
    const csrfToken = response.headers['x-csrf-token'];
    if (csrfToken && typeof document !== 'undefined') {
      const isProduction = process.env.NODE_ENV === 'production';
      const sameSite = isProduction ? 'None' : 'Lax';
      const secure = isProduction ? '; Secure' : '';
      document.cookie = `XSRF-TOKEN=${encodeURIComponent(csrfToken)}; path=/; SameSite=${sameSite}${secure}`;
      return csrfToken;
    }
    // Also check cookie
    return getCSRFToken();
  } catch (err) {
    logger.warn('Failed to fetch CSRF token', { error: err });
    return null;
  }
};

// Request interceptor to add auth token and CSRF token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add auth token
    const token = auth.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      let csrfToken = getCSRFToken();
      
      // If CSRF token is missing, try to fetch it first
      if (!csrfToken) {
        csrfToken = await fetchCSRFToken();
      }
      
      if (csrfToken && config.headers) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    // Extract CSRF token from response header or cookie and store it
    const csrfToken = response.headers['x-csrf-token'];
    if (csrfToken && typeof document !== 'undefined') {
      // Update cookie if token is in header
      // Use SameSite=Lax for development (matches backend) or None for production
      const isProduction = process.env.NODE_ENV === 'production';
      const sameSite = isProduction ? 'None' : 'Lax';
      const secure = isProduction ? '; Secure' : '';
      document.cookie = `XSRF-TOKEN=${encodeURIComponent(csrfToken)}; path=/; SameSite=${sameSite}${secure}`;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _csrfRetry?: boolean };

    // Check if this is a CSRF token error
    const errorMessage = (error.response?.data as any)?.error?.message?.toLowerCase() || '';
    const isCSRFError = 
      error.response?.status === 401 && 
      (errorMessage.includes('csrf') || errorMessage.includes('invalid csrf'));

    // If CSRF error and we haven't retried yet, fetch token and retry
    if (isCSRFError && !originalRequest._csrfRetry) {
      originalRequest._csrfRetry = true;
      const csrfToken = await fetchCSRFToken();
      if (csrfToken && originalRequest.headers) {
        originalRequest.headers['X-CSRF-Token'] = csrfToken;
        return api(originalRequest);
      }
    }

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = auth.getRefreshToken();

      if (!refreshToken) {
        // No refresh token, clear auth and redirect
        auth.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Update tokens
        auth.setTokens(accessToken, newRefreshToken || refreshToken);

        // Update the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Process queued requests
        processQueue(null, accessToken);

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect
        processQueue(refreshError, null);
        auth.clear();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

