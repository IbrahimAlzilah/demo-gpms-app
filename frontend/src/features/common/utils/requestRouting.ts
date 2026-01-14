import type { RequestType } from "../../../types/request.types";

/**
 * Determines if a request type requires supervisor approval first
 * @param requestType The type of request
 * @returns Always false - all requests now go directly to Projects Committee
 * @deprecated All requests now go directly to Projects Committee. This function is kept for backward compatibility.
 */
export function requiresSupervisorApproval(requestType: RequestType): boolean {
  // All requests now go directly to Projects Committee
  return false;
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
  // All requests go directly to committee
  if (currentStatus === "pending") {
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
