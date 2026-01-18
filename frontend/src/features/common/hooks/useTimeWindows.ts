import { useQuery } from '@tanstack/react-query';
import { timeWindowService } from '../api/timeWindow.service';
import type { TimePeriodType } from '../types/timeWindow.types';

/**
 * Hook to get all active time windows
 */
export const useActiveWindows = () => {
  return useQuery({
    queryKey: ['timeWindows', 'active'],
    queryFn: timeWindowService.getActiveWindows,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

/**
 * Hook to get upcoming time windows
 */
export const useUpcomingWindows = () => {
  return useQuery({
    queryKey: ['timeWindows', 'upcoming'],
    queryFn: timeWindowService.getUpcomingWindows,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to check if a specific window is active
 */
export const useWindowCheck = (type: string, enabled = true) => {
  return useQuery({
    queryKey: ['timeWindows', 'check', type],
    queryFn: () => timeWindowService.checkWindow(type),
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};

/**
 * Hook to get status for multiple window types
 */
export const useWindowsStatus = (types: string[], enabled = true) => {
  return useQuery({
    queryKey: ['timeWindows', 'status', ...types],
    queryFn: () => timeWindowService.getWindowsStatus(types),
    enabled: enabled && types.length > 0,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
};

/**
 * Hook to get all window types
 */
export const useWindowTypes = () => {
  return useQuery({
    queryKey: ['timeWindows', 'types'],
    queryFn: timeWindowService.getWindowTypes,
    staleTime: Infinity, // Types don't change
  });
};

/**
 * Helper hook to check if user can perform an action based on window status
 */
export const useCanPerformAction = (windowType: TimePeriodType) => {
  const { data: windowCheck, isLoading } = useWindowCheck(windowType);

  return {
    canPerform: windowCheck?.is_active ?? false,
    window: windowCheck?.window,
    daysRemaining: windowCheck?.days_remaining,
    isLoading,
  };
};
