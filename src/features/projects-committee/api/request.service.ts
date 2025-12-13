import { mockRequestService } from "../../../lib/mock/request.mock";
import type { Request } from "../../../types/request.types";

export const committeeRequestService = {
  getPendingRequests: async (): Promise<Request[]> => {
    return mockRequestService.getPendingForCommittee();
  },

  getById: async (id: string): Promise<Request | null> => {
    return mockRequestService.getById(id);
  },

  approve: async (
    id: string,
    approvedBy: string,
    comments?: string
  ): Promise<Request> => {
    return mockRequestService.approveByCommittee(id, approvedBy, comments);
  },

  reject: async (
    id: string,
    rejectedBy: string,
    comments?: string
  ): Promise<Request> => {
    return mockRequestService.rejectByCommittee(id, rejectedBy, comments);
  },
};
