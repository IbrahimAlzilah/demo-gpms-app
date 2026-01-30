import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get a user-facing error message from an API error response.
 * If the backend sent error_key (and optional error_params), the message is translated via i18n.
 * Otherwise falls back to response message or a default key.
 */
export function getApiErrorMessage(
  error: unknown,
  t: (key: string, params?: Record<string, unknown>) => string,
  fallbackKey = "common.error",
): string {
  const data = (
    error as {
      response?: {
        data?: {
          message?: string;
          error_key?: string;
          error_params?: Record<string, unknown>;
        };
      };
    }
  )?.response?.data;
  if (!data) return t(fallbackKey);
  if (data.error_key) return t(data.error_key, data.error_params ?? {});
  return data.message ?? t(fallbackKey);
}
