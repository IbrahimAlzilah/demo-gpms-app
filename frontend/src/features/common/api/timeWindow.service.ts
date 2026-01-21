import { apiClient } from '@/lib/axios';
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
    const response = await apiClient.get<TimePeriod[]>('/time-windows/active');
    return response.data;
  },

  /**
   * Get upcoming time windows
   */
  getUpcomingWindows: async () => {
    const response = await apiClient.get<TimePeriod[]>(
      '/time-windows/upcoming'
    );
    return response.data;
  },

  /**
   * Check if a specific window type is active
   */
  checkWindow: async (type: string) => {
    const response = await apiClient.post<WindowCheckResponse>(
      '/time-windows/check',
      { type }
    );
    return response.data;
  },

  /**
   * Get status for multiple window types
   */
  getWindowsStatus: async (types: string[]) => {
    const response = await apiClient.post<Record<string, WindowStatus>>(
      '/time-windows/status',
      { types }
    );
    return response.data;
  },

  /**
   * Get all available window types
   */
  getWindowTypes: async () => {
    const response = await apiClient.get<WindowTypeInfo[]>(
      '/time-windows/types'
    );
    return response.data;
  },
};
