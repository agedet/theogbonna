
import _axios, {
    AxiosError,
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
  } from "axios";
  import Cookies from "js-cookie";
  import { URLS } from "../routes";
  import { TOKEN } from "../token";
  import AuthService from "../../services/auth";
  import type { CustomAxiosError } from "./types";
  import { toast } from "../../lib/toast";
  
  
  let hasToastedUnauthorizedError = false;
  let hasToastedNetworkError = false;
  let isLoggingOut = false;
  let unauthorizedLockTimeout: ReturnType<typeof setTimeout> | null = null;
  
  type QueuedRequest = {
    resolve: (value?: unknown) => void;
    reject: (error?: unknown) => void;
  };
  
  // Token refresh state management (industry standard pattern)
  let isRefreshing = false;
  let failedQueue: QueuedRequest[] = [];
  
  /**
   * Process queued requests after token refresh
   * Industry standard: Queue concurrent requests during refresh, then resolve/reject all
   */
  const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };
  
  // Show unauthorized toast only once, with a 10-second cooldown
  const showUnauthorizedToast = () => {
    if (hasToastedUnauthorizedError || isLoggingOut) return false;
    
    hasToastedUnauthorizedError = true;
    
    // Clear any existing timeout
    if (unauthorizedLockTimeout) {
      clearTimeout(unauthorizedLockTimeout);
    }
    
    toast.error("Session expired. Please login again.");
    logoutSuperAdmin();
    
    // Keep the lock for 10 seconds to prevent any duplicate toasts
    unauthorizedLockTimeout = setTimeout(() => {
      hasToastedUnauthorizedError = false;
    }, 10000);
    
    return true;
  };
  
  // Provide fallback API URL if environment variable is not set
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  
  export const setIsLoggingOut = (value: boolean) => {
    isLoggingOut = value;
  };
  
  export const getIsLoggingOut = () => isLoggingOut;
  
  const logoutSuperAdmin = () => {
    isLoggingOut = true;
    Cookies.remove(TOKEN.ACCESS_TOKEN, { path: "/" });
    Cookies.remove(TOKEN.ROLE, { path: "/" });
    Cookies.remove(TOKEN.MEMBER_ACCESS_TOKEN, { path: "/" });
  };
  
  export const axiosInstance: AxiosInstance = _axios.create({
    baseURL: API_BASE_URL,
    timeout: 1000 * 60 * 5, // 5 minutes (increased for large file uploads)
    withCredentials: true, // Enable cookie-based authentication
    maxContentLength: Infinity, // Allow large file uploads
    maxBodyLength: Infinity, // Allow large request bodies
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Response interceptor with automatic token refresh (industry standard)
  axiosInstance.interceptors.response.use(
    (response) => {
      // Only reset network error flag on success (not unauthorized - it has its own timeout)
      hasToastedNetworkError = false;
      return response;
    },
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
  
      // Handle network errors
      if (error.code === "ERR_NETWORK" && !hasToastedNetworkError) {
        hasToastedNetworkError = true;
        toast.error("Network Error. Please check your connection.");
        return Promise.reject(error);
      }
  
      // Identify auth-related endpoints that should NOT trigger refresh
      const isAuthRequest =
        originalRequest?.url?.includes("/auth/login") ||
        originalRequest?.url?.includes("/auth/verify-otp") ||
        originalRequest?.url?.includes("/auth/refresh") ||
        originalRequest?.url?.includes("/auth/logout") ||
        originalRequest?.url?.includes("/member-auth/request-otp") ||
        originalRequest?.url?.includes("/auth/verify-2fa") ||
        originalRequest?.url?.includes("/member-auth/verify-otp") ||
        originalRequest?.url?.includes("/auth/resend-otp") ||
        originalRequest?.url?.includes("/member-auth/logout");
  
      // Industry standard: Attempt token refresh on 401 before logging out
      if (
        error.response?.status === 401 &&
        !isAuthRequest &&
        !originalRequest._retry &&
        !getIsLoggingOut()
      ) {
        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              // Retry original request after refresh completes
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }
  
        // Mark request as retried to prevent infinite loops
        originalRequest._retry = true;
        isRefreshing = true;
  
        try {
          // Attempt to refresh token (refresh token comes from HttpOnly cookie)
          await AuthService.refreshToken();
  
          // Refresh successful - process queued requests and retry original
          processQueue(null, null);
          isRefreshing = false;
  
          // Retry the original request with new token
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear queue and log out user
          processQueue(refreshError, null);
          isRefreshing = false;
  
          // Only show toast and redirect if not already logging out
          if (!getIsLoggingOut()) {
            const currentPath = window.location.pathname;
            const isLoginPage =
              currentPath.includes("/admin/login") ||
              currentPath.includes("/auth/sign-in");
  
            const isVerifyLoginPage =
              currentPath.includes("/admin/verify-otp") ||
              currentPath.includes("/auth/verify-login");
  
            // Never bounce public checkout/success pages to login on API 401
            const isPublicPage =
              currentPath === "/" ||
              currentPath.startsWith("/checkout") ||
              currentPath.startsWith("/success");
  
            if (!isLoginPage && !isVerifyLoginPage && !isPublicPage) {
              // Use centralized handler - returns true if this is the first call
              const shouldRedirect = showUnauthorizedToast();
  
              if (shouldRedirect) {
                console.log("401 Unauthorized error - refresh failed:", originalRequest?.url);
  
                // Determine the correct login URL based on current path
                let loginURL: string;
                const cleanPath = currentPath.startsWith("/")
                  ? currentPath
                  : `/${currentPath}`;
  
                if (currentPath.startsWith("/admin")) {
                  loginURL = `${window.location.origin}${
                    URLS.ADMIN_LOGIN
                  }?redirectUrl=${encodeURIComponent(cleanPath)}`;
                } else {
                  // Default to super_admin login for super_admin routes and any other paths
                  loginURL = `${window.location.origin}${
                    URLS.SUPER_ADMIN_LOGIN
                  }?redirectUrl=${encodeURIComponent(cleanPath)}`;
                }
  
                console.log("Redirecting to:", loginURL);
                setTimeout(() => {
                  window.location.href = loginURL;
                }, 500);
              }
            }
          }
  
          return Promise.reject(refreshError);
        }
      }
  
      // For other 401s (auth endpoints, already retried, or during logout), use existing logic
      if (
        error.response?.status === 401 &&
        !isAuthRequest &&
        !getIsLoggingOut()
      ) {
        const currentPath = window.location.pathname;
        const isLoginPage =
          currentPath.includes("/admin/login") ||
          currentPath.includes("/auth/sign-in");
  
        const isVerifyLoginPage =
          currentPath.includes("/admin/verify-otp") ||
          currentPath.includes("/auth/verify-login");
  
        const isPublicPage =
          currentPath === "/" ||
          currentPath.startsWith("/checkout") ||
          currentPath.startsWith("/success");
  
        if (!isLoginPage && !isVerifyLoginPage && !isPublicPage) {
          // Use centralized handler - returns true if this is the first call
          const shouldRedirect = showUnauthorizedToast();
  
          if (shouldRedirect) {
            console.log("401 Unauthorized error:", originalRequest?.url);
  
            // Determine the correct login URL based on current path
            let loginURL: string;
            const cleanPath = currentPath.startsWith("/")
              ? currentPath
              : `/${currentPath}`;
  
            if (currentPath.startsWith("/admin")) {
              loginURL = `${window.location.origin}${
                URLS.ADMIN_LOGIN
              }?redirectUrl=${encodeURIComponent(cleanPath)}`;
            } else {
              // Default to super_admin login for super_admin routes and any other paths
              loginURL = `${window.location.origin}${
                URLS.SUPER_ADMIN_LOGIN
              }?redirectUrl=${encodeURIComponent(cleanPath)}`;
            }
  
            console.log("Redirecting to:", loginURL);
            setTimeout(() => {
              window.location.href = loginURL;
            }, 500);
          }
        }
      }
  
      return Promise.reject(error);
    }
  );
  
  // Request interceptor
  axiosInstance.interceptors.request.use(async (config) => {
    // Cookie-based authentication - cookies are automatically sent with withCredentials: true
    // Explicitly ensure withCredentials is true for all requests
    config.withCredentials = true;
    // No need to manually add Authorization headers
    
    // For FormData requests, ensure Content-Type is not manually set
    // Axios will automatically set it with the correct boundary
    if (config.data instanceof FormData) {
      // Remove any manually set Content-Type header to let axios set it automatically
      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }
    
    // Debug logging for POST requests to board tasks endpoint
    if (config.method === 'post' && config.url?.includes('/board/sprint') && config.url?.includes('/tasks')) {
      console.log('📤 POST Request to:', config.url);
      console.log('📤 Request data:', config.data);
      console.log('📤 Request headers:', config.headers);
    }
    
    return config;
  });
  
  export const authAxiosInstance = _axios.create({
    baseURL: API_BASE_URL,
    timeout: 1000 * 60, // 60 seconds
    withCredentials: true, // Enable cookie-based authentication
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Request interceptor for authAxiosInstance
  authAxiosInstance.interceptors.request.use(
    (config) => {
      // Ensure Content-Type is set
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
      // Ensure withCredentials is true
      config.withCredentials = true;
      
      // Log request in development
      if (import.meta.env.DEV && config.data) {
        console.log('📤 Auth API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          hasData: !!config.data,
          dataKeys: config.data ? Object.keys(config.data) : [],
        });
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  authAxiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<CustomAxiosError>) => {
      const message = error.response?.data?.message;
      const normalizedMessage = Array.isArray(message)
        ? message.join(', ')
        : typeof message === 'string'
          ? message
          : error.message;
  
      return Promise.reject(new Error(normalizedMessage));
    },
  );
  
  const handleApiSuccess = (res: AxiosResponse) => {
    return res.data;
  };
  
  const HandleApiError = (
    err: AxiosError<CustomAxiosError>,
    skipToast = false
  ) => {
    // Skip toast for auth-related endpoints that are handled in hooks
    const isAuthEndpoint =
      err.config?.url?.includes("/auth/resend-otp") ||
      err.config?.url?.includes("/auth/verify-2fa") ||
      err.config?.url?.includes("/member-auth/verify-otp") ||
      err.config?.url?.includes("/users/me/password");
  
    const isTicketDetail404 =
      err.response?.status === 404 &&
      err.config?.url &&
      (/\/tickets\/[^/]+$/.test(err.config.url) || 
       /\/tickets\/[^/]+\/comments$/.test(err.config.url));
  
    // Check if this request was already retried (token refresh was attempted)
    const wasRetried = (err.config as InternalAxiosRequestConfig & { _retry?: boolean })?._retry;
  
    // Handle Unauthorized
    if (err && err.response) {
      if (
        err.response?.status === 401 &&
        !skipToast &&
        !isAuthEndpoint &&
        !wasRetried // Skip toast if refresh was already attempted (toast shown in interceptor)
      ) {
        // Centralized handler prevents duplicate toasts
        showUnauthorizedToast();
      }
  
      // Log the error
      console.error(
        err?.response?.data?.message ??
          err?.message ??
          "An error occurred. Please try again or contact support"
      );
  
      // Check if this is a login request - don't show generic error for login
      const isLoginRequest = err.config?.url?.includes("/auth/login");
      
      // Don't show generic error toast for 401s (already handled above)
      // Skip toast for ticket detail 404s and other excluded cases
      if (!skipToast && !isAuthEndpoint && !isLoginRequest && err.response?.status !== 401 && !isTicketDetail404) {
        const errorMessage = err.response.data.message;
        // Handle validation errors which come as arrays
        if (Array.isArray(errorMessage)) {
          toast.error(errorMessage.join(', ') || "An error occurred. Please try again or contact support");
        } else if (typeof errorMessage === 'string') {
          toast.error(errorMessage);
        } else {
          toast.error("An error occurred. Please try again or contact support");
        }
      }
  
      const errorMessage = err.response.data.message;
      const finalMessage = Array.isArray(errorMessage) 
        ? errorMessage.join(', ')
        : (errorMessage || "An error occurred. Please try again or contact support");
      throw new Error(finalMessage);
    } else {
      console.error(err.message || "An Error Occurred");
    }
  };
  
  export const Api = {
    /**
     * GET request - returns the response data directly (not wrapped)
     * Backend returns data directly, so we return res.data which is the actual data
     */
    get: async <T>(
      endpoint: string,
      config?: AxiosRequestConfig
    ): Promise<T> => {
      try {
        return axiosInstance
          .get<T>(endpoint, config)
          .then(handleApiSuccess)
          .catch(HandleApiError);
      } catch (error) {
        console.error("API GET error:", error);
        throw error;
      }
    },
  
    /**
     * POST request - returns the response data directly (not wrapped)
     * Backend returns data directly, so we return res.data which is the actual data
     */
    post: async <T>(
      endpoint: string,
      data: unknown,
      config?: AxiosRequestConfig
    ): Promise<T> => {
      try {
        return axiosInstance
          .post<T>(endpoint, data, config)
          .then(handleApiSuccess)
          .catch(HandleApiError);
      } catch (error) {
        console.error("API POST error:", error);
        throw error;
      }
    },
  
    /**
     * PUT request - returns the response data directly (not wrapped)
     */
    put: async <T>(
      endpoint: string,
      data: unknown,
      config?: AxiosRequestConfig
    ): Promise<T> => {
      return axiosInstance
        .put<T>(endpoint, data, config)
        .then(handleApiSuccess)
        .catch(HandleApiError);
    },
  
    /**
     * PATCH request - returns the response data directly (not wrapped)
     */
    patch: async <T>(
      endpoint: string,
      data: unknown,
      config?: AxiosRequestConfig
    ): Promise<T> => {
      return axiosInstance
        .patch<T>(endpoint, data, config)
        .then(handleApiSuccess)
        .catch(HandleApiError);
    },
  
    /**
     * DELETE request - returns the response data directly (not wrapped)
     */
    delete: async <T>(
      endpoint: string,
      config?: AxiosRequestConfig
    ): Promise<T> => {
      return axiosInstance
        .delete<T>(endpoint, config)
        .then(handleApiSuccess)
        .catch(HandleApiError);
    },
  };
  
  export default Api;
  
  