import type { RequestType } from "../../../types/request.types";

/**
 * Determines if a request type requires supervisor approval first
 * @param requestType The type of request
 * @returns true if supervisor approval is required first, false if it goes directly to committee
 */
export function requiresSupervisorApproval(requestType: RequestType): boolean {
  // Requests that need supervisor approval first
  const supervisorFirstTypes: RequestType[] = [
    "change_supervisor",
    "change_group",
  ];

  return supervisorFirstTypes.includes(requestType);
}

/**
 * Gets the next approval step for a request
 * @param requestType The type of request
 * @param currentStatus The current status of the request
 * @returns The next step or null if complete
 */
export function getNextApprovalStep(
  requestType: RequestType,
  currentStatus: string
): "supervisor" | "committee" | "complete" | null {
  const needsSupervisor = requiresSupervisorApproval(requestType);

  if (currentStatus === "pending") {
    return needsSupervisor ? "supervisor" : "committee";
  }

  if (currentStatus === "supervisor_approved" && needsSupervisor) {
    return "committee";
  }

  if (
    currentStatus === "supervisor_rejected" ||
    currentStatus === "committee_rejected"
  ) {
    return "complete"; // Request is rejected, no further steps
  }

  if (currentStatus === "committee_approved") {
    return "complete"; // Request is approved, complete
  }

  return null;
}
