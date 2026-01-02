import { useMyGroup } from '../hooks/useGroups'

export function useGroupsView() {
  const { data: group, isLoading, error } = useMyGroup()

  return {
    group: group || null,
    isLoading,
    error: error as Error | null,
  }
}
