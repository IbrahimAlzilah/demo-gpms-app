import { useQuery } from "@tanstack/react-query";
import { supervisorService } from "../api/supervisor.service";

/**
 * Fetch available supervisors for proposal submission
 */
export function useSupervisors() {
  return useQuery({
    queryKey: ["supervisor-supervisors"],
    queryFn: () => supervisorService.getAll(),
  });
}
