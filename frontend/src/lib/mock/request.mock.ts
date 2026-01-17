import { v4 as uuidv4 } from "uuid";
import type { Request } from "../../types/request.types";

// Mock requests database
export const mockRequests: Request[] = [
  {
    id: "1",
    type: "change_supervisor",
    studentId: "1",
    projectId: "2",
    reason: "رغبة في تغيير المشرف",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockRequestService = {
  getAll: async (studentId?: string): Promise<Request[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    let requests = [...mockRequests];
    if (studentId) {
      requests = requests.filter((r) => r.studentId === studentId);
    }
    return requests;
  },

  getById: async (id: string): Promise<Request | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockRequests.find((r) => r.id === id) || null;
  },

  create: async (
    data: Omit<Request, "id" | "createdAt" | "updatedAt">
  ): Promise<Request> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const request: Request = {
      ...data,
      id: uuidv4(),
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockRequests.push(request);
    return request;
  },

  getPendingForSupervisor: async (supervisorId: string): Promise<Request[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    // In real app, filter by supervisor's projects using supervisorId
    // For now, return all pending requests that need supervisor approval
    void supervisorId; // Keep parameter for API compatibility
    return mockRequests.filter(
      (r) =>
        r.status === "pending" &&
        (r.type === "change_supervisor" || r.type === "change_group")
    );
  },

  getPendingForCommittee: async (): Promise<Request[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockRequests.filter(
      (r) =>
        r.status === "pending" ||
        (r.status === "supervisor_approved" &&
          (r.type === "change_project" ||
            r.type === "other" ||
            r.type === "change_supervisor" ||
            r.type === "change_group"))
    );
  },

  update: async (id: string, data: Partial<Request>): Promise<Request> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = mockRequests.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Request not found");
    mockRequests[index] = {
      ...mockRequests[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockRequests[index];
  },

  /**
   * @deprecated Supervisor approval is no longer used. All requests go directly to Projects Committee.
   */
  approveBySupervisor: async (
    id: string,
    approvedBy: string,
    comments?: string
  ): Promise<Request> => {
    throw new Error("Supervisor approval is no longer supported. All requests must be processed by the Projects Committee.");
  },

  approveByCommittee: async (
    id: string,
    approvedBy: string,
    comments?: string
  ): Promise<Request> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const request = await mockRequestService.getById(id);
    if (!request) throw new Error("Request not found");

    // Can approve if pending (all requests go directly to committee now)
    if (request.status !== "pending") {
      throw new Error(
        "Request cannot be approved by committee in current status"
      );
    }

    return mockRequestService.update(id, {
      status: "committee_approved",
      committeeApproval: {
        approved: true,
        comments,
        approvedAt: new Date().toISOString(),
        approvedBy,
      },
    });
  },

  approve: async (
    id: string,
    approvedBy: string,
    comments?: string
  ): Promise<Request> => {
    // All requests now go directly to committee
    const request = await mockRequestService.getById(id);
    if (!request) throw new Error("Request not found");

    if (request.status === "pending") {
      return mockRequestService.approveByCommittee(id, approvedBy, comments);
    }

    throw new Error("Request cannot be approved in current status");
  },

  /**
   * @deprecated Supervisor rejection is no longer used. All requests go directly to Projects Committee.
   */
  rejectBySupervisor: async (
    id: string,
    rejectedBy: string,
    comments?: string
  ): Promise<Request> => {
    throw new Error("Supervisor rejection is no longer supported. All requests must be processed by the Projects Committee.");
  },

  rejectByCommittee: async (
    id: string,
    rejectedBy: string,
    comments?: string
  ): Promise<Request> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const request = await mockRequestService.getById(id);
    if (!request) throw new Error("Request not found");

    // All requests go directly to committee (supervisor approval no longer used)
    if (request.status !== "pending") {
      throw new Error(
        "Request cannot be rejected by committee in current status"
      );
    }

    return mockRequestService.update(id, {
      status: "committee_rejected",
      committeeApproval: {
        approved: false,
        comments,
        approvedAt: new Date().toISOString(),
        approvedBy: rejectedBy,
      },
    });
  },

  reject: async (
    id: string,
    rejectedBy: string,
    comments?: string
  ): Promise<Request> => {
    // All requests now go directly to committee
    const request = await mockRequestService.getById(id);
    if (!request) throw new Error("Request not found");

    if (request.status === "pending") {
      return mockRequestService.rejectByCommittee(id, rejectedBy, comments);
    }

    throw new Error("Request cannot be rejected in current status");
  },
};
