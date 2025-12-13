import { mockRequestService } from "../../../lib/mock/request.mock";
import type { Request } from "../../../types/request.types";

export const supervisionService = {
  getRequests: async (supervisorId: string): Promise<Request[]> => {
    return mockRequestService.getPendingForSupervisor(supervisorId);
  },

  approveRequest: async (
    requestId: string,
    supervisorId: string,
    comments?: string
  ): Promise<Request> => {
    return mockRequestService.approveBySupervisor(
      requestId,
      supervisorId,
      comments
    );
  },

  rejectRequest: async (
    requestId: string,
    supervisorId: string,
    comments?: string
  ): Promise<Request> => {
    return mockRequestService.rejectBySupervisor(
      requestId,
      supervisorId,
      comments
    );
  },
};
