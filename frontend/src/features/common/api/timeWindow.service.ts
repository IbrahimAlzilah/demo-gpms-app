import { apiClient } from '@/lib/apiClient';
import type {
  TimePeriod,
  WindowCheckResponse,
  WindowStatus,
  WindowTypeInfo,
} from '../types/timeWindow.types';

export const timeWindowService = {
  /**
   * Get all currently active time windows
   */
  getActiveWindows: async () => {
    const response = await apiClient.get<{ data: TimePeriod[] }>(
      '/time-windows/active'
    );
    return response.data.data;
  },

  /**
   * Get upcoming time windows
   */
  getUpcomingWindows: async () => {
    const response = await apiClient.get<{ data: TimePeriod[] }>(
      '/time-windows/upcoming'
    );
    return response.data.data;
  },

  /**
   * Check if a specific window type is active
   */
  checkWindow: async (type: string) => {
    const response = await apiClient.post<{ data: WindowCheckResponse }>(
      '/time-windows/check',
      { type }
    );
    return response.data.data;
  },

  /**
   * Get status for multiple window types
   */
  getWindowsStatus: async (types: string[]) => {
    const response = await apiClient.post<{ data: Record<string, WindowStatus> }>(
      '/time-windows/status',
      { types }
    );
    return response.data.data;
  },

  /**
   * Get all available window types
   */
  getWindowTypes: async () => {
    const response = await apiClient.get<{ data: WindowTypeInfo[] }>(
      '/time-windows/types'
    );
    return response.data.data;
  },
};
