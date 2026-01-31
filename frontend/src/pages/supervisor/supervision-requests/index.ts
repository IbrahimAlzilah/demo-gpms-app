// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Types
export type { SupervisorAssignmentRequest } from "./types/SupervisionRequests.types";

// API Services (for internal use, but exported for flexibility)
export { supervisionService } from "./api/supervision.service";
