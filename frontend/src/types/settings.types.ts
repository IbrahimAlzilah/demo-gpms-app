/** Display-only settings (key => value) from GET /settings */
export type SystemSettingsMap = Record<string, number | string | boolean>;

/** Single setting with metadata (admin list) */
export interface SystemSettingItem {
  key: string;
  value: number | string | boolean;
  type: "integer" | "string" | "boolean" | "json";
  description: string;
  category: string;
  min: number | null;
  max: number | null;
  default: number | string | boolean;
}

/** Payload for updating settings */
export type SystemSettingsUpdatePayload = Record<
  string,
  number | string | boolean
>;

export const SETTINGS_CATEGORY_LABELS: Record<string, string> = {
  groups: "Groups",
  proposals: "Proposals",
  projects: "Projects",
  committees: "Committees",
  supervisors: "Supervisors",
  documents: "Documents",
  meetings: "Meetings",
  milestones: "Milestones",
  evaluations: "Evaluations",
  requests: "Requests",
  authentication: "Authentication",
  ui: "Search & UI",
  periods: "Periods",
};
