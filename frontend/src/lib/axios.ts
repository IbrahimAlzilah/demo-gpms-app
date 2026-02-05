import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Remove Content-Type header for FormData - browser will set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Skip processing for blob responses (file downloads)
    if (response.config.responseType === "blob") {
      return response;
    }

    // Backend returns { success: true, data: {...}, message?: string, pagination?: {...}, statistics?: {...}, ... }
    // Extract the data property for easier access while preserving other keys (e.g. statistics)
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data
    ) {
      const body = response.data as Record<string, unknown>;
      const extractedData = "data" in body ? body.data : body;
      const {
        data: _d,
        success: _s,
        pagination: p,
        message: m,
        ...rest
      } = body;
      return {
        ...response,
        data: extractedData,
        pagination:
          (p as Record<string, unknown>) || (response as any).pagination,
        message: m,
        ...rest,
      };
    }
    return response;
  },
  (error) => {
    // Handle common errors (401, 403, 422, 500, etc.)
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Handle unauthorized access
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Redirect to login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      // Format error response to match backend structure
      const errorMessage =
        data?.message || error.message || "An error occurred";
      const errorData = {
        message: errorMessage,
        errors: data?.errors || {},
        status,
      };

      return Promise.reject({
        ...error,
        response: {
          ...error.response,
          data: errorData,
        },
      });
    }

    // Network error or no response
    return Promise.reject({
      ...error,
      message: error.message || "Network error. Please check your connection.",
    });
  },
);
