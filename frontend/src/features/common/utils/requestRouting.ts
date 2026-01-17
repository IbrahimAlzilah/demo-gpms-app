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
  // All requests go directly to committee (supervisor approval no longer used)
  if (currentStatus === "pending") {
    return "committee";
  }

  if (currentStatus === "committee_rejected") {
    return "complete"; // Request is rejected, no further steps
  }

  if (currentStatus === "committee_approved") {
    return "complete"; // Request is approved, complete
  }

  // Legacy supervisor statuses are treated as rejected/complete
  if (currentStatus === "supervisor_rejected") {
    return "complete";
  }

  return null;
}
