import { useQuery } from "@tanstack/react-query";
import { requestService, type RequestContext } from "../api/request.service";

export function useRequestContext() {
  return useQuery<RequestContext>({
    queryKey: ["student-request-context"],
    queryFn: () => requestService.getContext(),
    staleTime: 60_000,
  });
}
