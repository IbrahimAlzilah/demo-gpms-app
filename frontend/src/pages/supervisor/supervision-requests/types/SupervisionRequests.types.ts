export interface SupervisorAssignmentRequest {
  id: number;
  project_id: number;
  supervisor_id: number;
  requested_by: number;
  responded_by: number | null;
  status: "pending" | "approved" | "rejected" | "canceled";
  committee_notes: string | null;
  supervisor_response: string | null;
  created_at: string;
  updated_at: string;
  responded_at?: string;
  project: {
    id: number;
    title: string;
    description?: string;
  };
  supervisor: {
    id: number;
    name: string;
    email: string;
  };
  requestedBy?: {
    id: number;
    name: string;
    email?: string;
  };
  requested_by_user?: {
    id: number;
    name: string;
  };
}
